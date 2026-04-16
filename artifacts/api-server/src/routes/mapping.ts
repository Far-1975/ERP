import { Router } from "express";
import { db } from "@workspace/db";
import { mappingSessionsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { ERP_SYSTEMS, getErpSystem, getKnownMappings } from "../lib/erp/registry.js";
import { parseErpJson } from "../lib/erp/parser.js";
import { getCanonicalSchema, getAllCanonicalSchemas } from "../lib/canonical/schemas.js";
import { runMapping } from "../lib/ai/mapper.js";
import { buildExcelRows, rowsToCsv } from "../lib/excel/writer.js";
import type { MappingResult } from "../lib/ai/mapper.js";
import type { ErpField } from "../lib/erp/parser.js";

const router = Router();

// GET /api/mapping/erp-systems
router.get("/erp-systems", (req, res) => {
  res.json({ erpSystems: ERP_SYSTEMS });
});

// GET /api/mapping/canonical-schemas
router.get("/canonical-schemas", (req, res) => {
  const schemas = getAllCanonicalSchemas().map(s => ({
    id: s.id,
    name: s.name,
    documentType: s.documentType,
    version: s.version,
    description: s.description,
  }));
  res.json({ schemas });
});

// POST /api/mapping/run
router.post("/run", async (req, res) => {
  const { erpSystemId, documentType, erpJson } = req.body as {
    erpSystemId: string;
    documentType: string;
    erpJson: Record<string, unknown>;
  };

  if (!erpSystemId || !documentType || !erpJson) {
    res.status(400).json({ error: "Missing required fields: erpSystemId, documentType, erpJson" });
    return;
  }

  const erpSystem = getErpSystem(erpSystemId);
  if (!erpSystem) {
    res.status(400).json({ error: `Unknown ERP system: ${erpSystemId}` });
    return;
  }

  const canonicalSchema = getCanonicalSchema(documentType);
  if (!canonicalSchema) {
    res.status(400).json({ error: `Unknown document type: ${documentType}` });
    return;
  }

  try {
    const erpFields = parseErpJson(erpJson);
    const knownMappings = getKnownMappings(erpSystemId);
    const mappings = await runMapping(
      erpSystemId,
      documentType,
      erpFields,
      canonicalSchema.fields,
      knownMappings
    );

    const fieldMappings = mappings.filter(m => m.canonicalXpath);
    const unmappedCount = mappings.filter(m => !m.canonicalXpath).length;
    const confidences = fieldMappings.map(m => m.confidence);

    const stats = {
      totalErpFields: erpFields.length,
      totalCanonicalFields: canonicalSchema.fields.filter(f => f.smrConstruct === "Field").length,
      mappedFields: fieldMappings.length,
      unmappedFields: unmappedCount,
      highConfidence: fieldMappings.filter(m => m.confidence >= 0.85).length,
      mediumConfidence: fieldMappings.filter(m => m.confidence >= 0.65 && m.confidence < 0.85).length,
      lowConfidence: fieldMappings.filter(m => m.confidence < 0.65).length,
      needsReview: mappings.filter(m => m.needsReview).length,
      averageConfidence: confidences.length > 0
        ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100
        : 0,
    };

    // Save to DB
    const [session] = await db.insert(mappingSessionsTable).values({
      erpSystemId,
      erpSystemName: erpSystem.name,
      documentType,
      erpFields: erpFields as unknown as Record<string, unknown>[],
      mappings: mappings as unknown as Record<string, unknown>[],
      stats: stats as unknown as Record<string, unknown>,
    }).returning();

    res.json({
      sessionId: String(session.id),
      erpSystemId,
      documentType,
      erpFields,
      mappings,
      stats,
      createdAt: session.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error running mapping");
    res.status(500).json({ error: "Failed to run mapping", details: String(err) });
  }
});

// POST /api/mapping/export
router.post("/export", async (req, res) => {
  const { sessionId } = req.body as { sessionId: string };

  if (!sessionId) {
    res.status(400).json({ error: "Missing sessionId" });
    return;
  }

  try {
    const [session] = await db
      .select()
      .from(mappingSessionsTable)
      .where(eq(mappingSessionsTable.id, parseInt(sessionId)))
      .limit(1);

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const canonicalSchema = getCanonicalSchema(session.documentType);
    if (!canonicalSchema) {
      res.status(400).json({ error: "Unknown document type" });
      return;
    }

    const mappings = session.mappings as unknown as MappingResult[];
    const rows = buildExcelRows(mappings, canonicalSchema.fields);
    const erpName = session.erpSystemId.toUpperCase();
    const filename = `SMR_CANONICAL_TO_${erpName}_V1.csv`;
    const csvContent = rowsToCsv(rows);

    // Store as base64 data URL for download
    const base64 = Buffer.from(csvContent, "utf8").toString("base64");
    const downloadUrl = `data:text/csv;base64,${base64}`;

    res.json({ downloadUrl, filename });
  } catch (err) {
    req.log.error({ err }, "Error exporting mapping");
    res.status(500).json({ error: "Failed to export mapping", details: String(err) });
  }
});

// GET /api/mapping/sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await db
      .select()
      .from(mappingSessionsTable)
      .orderBy(desc(mappingSessionsTable.createdAt))
      .limit(50);

    res.json({
      sessions: sessions.map(s => {
        const stats = s.stats as Record<string, number>;
        return {
          id: String(s.id),
          erpSystemId: s.erpSystemId,
          erpSystemName: s.erpSystemName,
          documentType: s.documentType,
          totalFields: stats.totalErpFields ?? 0,
          mappedFields: stats.mappedFields ?? 0,
          averageConfidence: stats.averageConfidence ?? 0,
          createdAt: s.createdAt.toISOString(),
        };
      }),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching sessions");
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// GET /api/mapping/sessions/:id
router.get("/sessions/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid session ID" });
    return;
  }

  try {
    const [session] = await db
      .select()
      .from(mappingSessionsTable)
      .where(eq(mappingSessionsTable.id, id))
      .limit(1);

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({
      id: String(session.id),
      erpSystemId: session.erpSystemId,
      erpSystemName: session.erpSystemName,
      documentType: session.documentType,
      erpFields: session.erpFields,
      mappings: session.mappings,
      stats: session.stats,
      createdAt: session.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching session" );
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// GET /api/mapping/stats
router.get("/stats", async (req, res) => {
  try {
    const sessions = await db.select().from(mappingSessionsTable);

    let totalFieldsMapped = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;
    const erpCounts = new Map<string, { name: string; count: number }>();
    const docTypeCounts = new Map<string, number>();

    for (const s of sessions) {
      const stats = s.stats as Record<string, number>;
      totalFieldsMapped += stats.mappedFields ?? 0;
      if (stats.averageConfidence) {
        totalConfidence += stats.averageConfidence;
        confidenceCount++;
      }

      if (!erpCounts.has(s.erpSystemId)) {
        erpCounts.set(s.erpSystemId, { name: s.erpSystemName, count: 0 });
      }
      erpCounts.get(s.erpSystemId)!.count++;

      docTypeCounts.set(s.documentType, (docTypeCounts.get(s.documentType) ?? 0) + 1);
    }

    res.json({
      totalSessions: sessions.length,
      totalFieldsMapped,
      averageConfidenceOverall: confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 100) / 100 : 0,
      sessionsByErp: Array.from(erpCounts.entries()).map(([erpSystemId, data]) => ({
        erpSystemId,
        erpSystemName: data.name,
        count: data.count,
      })),
      sessionsByDocType: Array.from(docTypeCounts.entries()).map(([documentType, count]) => ({
        documentType,
        count,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
