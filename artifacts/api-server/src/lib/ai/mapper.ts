import { openai } from "@workspace/integrations-openai-ai-server";
import type { ErpField } from "../erp/parser.js";
import type { CanonicalField } from "../canonical/schemas.js";

export interface MappingResult {
  canonicalXpath: string;
  dialectTerm: string;
  erpJsonPath: string;
  erpFieldKey: string;
  confidence: number;
  matchStrategy: "rule_based" | "ai_semantic" | "fuzzy" | "unmapped";
  rationale: string;
  smrConstruct: "Field" | "Record" | "Composite";
  compositeRef: string;
  needsReview: boolean;
}

interface AiMappingResult {
  canonical_xpath: string;
  erp_json_path: string;
  confidence: number;
  rationale: string;
}

function tokenSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    s.toLowerCase().replace(/[_\-\.]/g, " ").split(/\s+/).filter(Boolean);
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++;
  }
  return (2 * overlap) / (tokensA.size + tokensB.size);
}

function getTopCandidates(
  erpField: ErpField,
  canonicalFields: CanonicalField[],
  topK = 20
): CanonicalField[] {
  // Filter by section: header fields to header canonical, line fields to line canonical
  const sectionFiltered = canonicalFields.filter(cf => {
    if (erpField.level === "line") return cf.section === "Lines";
    return cf.section !== "Lines";
  });

  const scored = sectionFiltered
    .filter(cf => cf.smrConstruct === "Field")
    .map(cf => ({
      field: cf,
      score: tokenSimilarity(erpField.fieldKey, cf.dialectTerm + " " + (cf.functionEnum ?? "")),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(s => s.field);
}

async function runAiMapping(
  erpSystemId: string,
  documentType: string,
  erpFields: ErpField[],
  candidates: Map<string, CanonicalField[]>
): Promise<AiMappingResult[]> {
  const erpFieldsForPrompt = erpFields.map(f => ({
    field_key: f.fieldKey,
    json_path: f.jsonPath,
    level: f.level,
    sample_value: f.sampleValue,
    data_type: f.dataType,
  }));

  const candidatesForPrompt = erpFields.map(f => ({
    field_key: f.fieldKey,
    candidates: (candidates.get(f.fieldKey) ?? []).map(c => ({
      xpath: c.xpath,
      dialect_term: c.dialectTerm,
      function_enum: c.functionEnum,
      data_type: c.dataType,
      is_required: c.isRequired,
    })),
  }));

  const systemPrompt = `You are an expert EDI and ERP integration engineer specializing in OpenText TrustedLink/BNStandard canonical schemas.
Your task is to map ERP JSON fields to OpenText BNStandard Canonical XPaths.

Rules:
1. Focus on BUSINESS MEANING, not just field name similarity.
2. One ERP field can map to MULTIPLE canonical paths (e.g. a date field might cover multiple date references).
3. One canonical path can map to ONLY ONE ERP field (no duplicates).
4. For line-level canonical fields, only match to items[] ERP fields.
5. Output ONLY valid JSON array. No commentary outside the JSON block.
6. If no good match exists, set erp_json_path to empty string and confidence to 0.
7. ALWAYS provide a short rationale for each mapping decision.
8. Confidence scale: 0.9-1.0 = very certain, 0.7-0.89 = likely, 0.5-0.69 = plausible, below 0.5 = uncertain.`;

  const userPrompt = `ERP System: ${erpSystemId}
Document Type: ${documentType}

ERP Fields to Map (unmatched):
${JSON.stringify(erpFieldsForPrompt, null, 2)}

Canonical Field Candidates per ERP field:
${JSON.stringify(candidatesForPrompt, null, 2)}

Return a JSON array of mapping objects. Each object must have:
- canonical_xpath: the full XPath string from the candidates list (empty string if no match)
- erp_json_path: the ERP field's json_path value (e.g. "JSON|JSON|External_Document_No")
- confidence: number between 0 and 1
- rationale: one sentence explaining the match

Only include one mapping per canonical_xpath (no duplicates). If multiple ERP fields could map to the same canonical path, choose the best one.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
  });

  const rawContent = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(rawContent);
    // Handle both array and object with array property
    if (Array.isArray(parsed)) return parsed as AiMappingResult[];
    const keys = Object.keys(parsed);
    for (const key of keys) {
      if (Array.isArray(parsed[key])) return parsed[key] as AiMappingResult[];
    }
    return [];
  } catch {
    return [];
  }
}

const BATCH_SIZE = 30;

export async function runMapping(
  erpSystemId: string,
  documentType: string,
  erpFields: ErpField[],
  canonicalFields: CanonicalField[],
  knownMappings: Record<string, string>
): Promise<MappingResult[]> {
  const results: MappingResult[] = [];
  const usedCanonicalPaths = new Set<string>();

  // Build a lookup for canonical fields by xpath
  const canonicalByXpath = new Map<string, CanonicalField>(
    canonicalFields.map(cf => [cf.xpath, cf])
  );

  // Layer 1: Rule-based (known mappings from adapter)
  const unmatchedErpFields: ErpField[] = [];
  for (const erpField of erpFields) {
    const knownXpath = knownMappings[erpField.fieldKey];
    if (knownXpath && !usedCanonicalPaths.has(knownXpath)) {
      const canonical = canonicalByXpath.get(knownXpath);
      if (canonical) {
        usedCanonicalPaths.add(knownXpath);
        results.push({
          canonicalXpath: canonical.xpath,
          dialectTerm: canonical.dialectTerm,
          erpJsonPath: erpField.jsonPath,
          erpFieldKey: erpField.fieldKey,
          confidence: 0.97,
          matchStrategy: "rule_based",
          rationale: `Known mapping from ${erpSystemId} adapter: ${erpField.fieldKey} → ${canonical.dialectTerm}`,
          smrConstruct: canonical.smrConstruct,
          compositeRef: canonical.compositeRef ?? "",
          needsReview: false,
        });
        continue;
      }
    }
    unmatchedErpFields.push(erpField);
  }

  // Layer 2: AI Semantic Matching in batches
  const fieldCandidates = new Map<string, CanonicalField[]>();
  for (const erpField of unmatchedErpFields) {
    fieldCandidates.set(erpField.fieldKey, getTopCandidates(erpField, canonicalFields));
  }

  for (let i = 0; i < unmatchedErpFields.length; i += BATCH_SIZE) {
    const batch = unmatchedErpFields.slice(i, i + BATCH_SIZE);
    const batchCandidates = new Map<string, CanonicalField[]>();
    for (const f of batch) {
      batchCandidates.set(f.fieldKey, fieldCandidates.get(f.fieldKey) ?? []);
    }

    let aiResults: AiMappingResult[] = [];
    try {
      aiResults = await runAiMapping(erpSystemId, documentType, batch, batchCandidates);
    } catch (err) {
      // Fall through to fuzzy matching if AI fails
    }

    // Build a lookup of AI results by erp_json_path
    const aiByErpPath = new Map<string, AiMappingResult>();
    for (const r of aiResults) {
      if (r.erp_json_path) {
        aiByErpPath.set(r.erp_json_path, r);
      }
    }

    for (const erpField of batch) {
      const aiResult = aiByErpPath.get(erpField.jsonPath);

      if (aiResult && aiResult.canonical_xpath && !usedCanonicalPaths.has(aiResult.canonical_xpath) && aiResult.confidence > 0.3) {
        const canonical = canonicalByXpath.get(aiResult.canonical_xpath);
        if (canonical) {
          usedCanonicalPaths.add(aiResult.canonical_xpath);
          results.push({
            canonicalXpath: canonical.xpath,
            dialectTerm: canonical.dialectTerm,
            erpJsonPath: erpField.jsonPath,
            erpFieldKey: erpField.fieldKey,
            confidence: aiResult.confidence,
            matchStrategy: "ai_semantic",
            rationale: aiResult.rationale,
            smrConstruct: canonical.smrConstruct,
            compositeRef: canonical.compositeRef ?? "",
            needsReview: aiResult.confidence < 0.65,
          });
          continue;
        }
      }

      // Layer 3: Fuzzy / String Similarity Fallback
      const candidates = batchCandidates.get(erpField.fieldKey) ?? [];
      if (candidates.length > 0) {
        const best = candidates[0];
        const simScore = tokenSimilarity(erpField.fieldKey, best.dialectTerm + " " + (best.functionEnum ?? ""));
        if (simScore > 0.2 && !usedCanonicalPaths.has(best.xpath)) {
          usedCanonicalPaths.add(best.xpath);
          const fuzzyConf = Math.min(0.55, 0.3 + simScore * 0.5);
          results.push({
            canonicalXpath: best.xpath,
            dialectTerm: best.dialectTerm,
            erpJsonPath: erpField.jsonPath,
            erpFieldKey: erpField.fieldKey,
            confidence: fuzzyConf,
            matchStrategy: "fuzzy",
            rationale: `Fuzzy string similarity match (score: ${simScore.toFixed(2)}) between "${erpField.fieldKey}" and "${best.dialectTerm}"`,
            smrConstruct: best.smrConstruct,
            compositeRef: best.compositeRef ?? "",
            needsReview: true,
          });
          continue;
        }
      }

      // No match
      results.push({
        canonicalXpath: "",
        dialectTerm: "",
        erpJsonPath: erpField.jsonPath,
        erpFieldKey: erpField.fieldKey,
        confidence: 0,
        matchStrategy: "unmapped",
        rationale: "No suitable canonical field found for this ERP field.",
        smrConstruct: "Field",
        compositeRef: "",
        needsReview: true,
      });
    }
  }

  return results;
}
