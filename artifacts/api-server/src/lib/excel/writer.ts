import type { MappingResult } from "../ai/mapper.js";
import type { CanonicalField } from "../canonical/schemas.js";

export interface ExcelRow {
  smrConstruct: string;
  compositeMappingReference: string;
  dialectTerm: string;
  canonicalXpath: string;
  erpJsonPath: string;
}

export function buildExcelRows(
  mappings: MappingResult[],
  canonicalFields: CanonicalField[]
): ExcelRow[] {
  const rows: ExcelRow[] = [];

  // Group by section to produce Record rows
  const sections = new Map<string, CanonicalField[]>();
  for (const cf of canonicalFields) {
    if (cf.smrConstruct === "Record") {
      if (!sections.has(cf.section)) {
        sections.set(cf.section, []);
      }
    }
  }

  // Add record rows for sections
  const recordFields = canonicalFields.filter(cf => cf.smrConstruct === "Record");
  for (const rf of recordFields) {
    rows.push({
      smrConstruct: "Record",
      compositeMappingReference: "",
      dialectTerm: "",
      canonicalXpath: rf.xpath,
      erpJsonPath: "",
    });
  }

  // Add composite rows
  const compositeFields = canonicalFields.filter(cf => cf.smrConstruct === "Composite");
  for (const cf of compositeFields) {
    // Find all ERP fields that mapped to children of this composite
    const compositeRef = cf.compositeRef ?? "";
    const childXpathPrefix = cf.xpath.replace(/\[.*?\]$/, "");
    const mappedChildren = mappings.filter(m =>
      m.canonicalXpath.startsWith(childXpathPrefix) && m.erpJsonPath
    );
    const erpPaths = mappedChildren.map(m => m.erpJsonPath).join(", ");

    rows.push({
      smrConstruct: "Composite",
      compositeMappingReference: compositeRef,
      dialectTerm: "",
      canonicalXpath: cf.xpath,
      erpJsonPath: erpPaths,
    });
  }

  // Add field rows
  for (const mapping of mappings) {
    if (!mapping.canonicalXpath) {
      // Unmapped — add a row with empty canonical fields
      rows.push({
        smrConstruct: "Field",
        compositeMappingReference: "",
        dialectTerm: "",
        canonicalXpath: "",
        erpJsonPath: mapping.erpJsonPath,
      });
      continue;
    }
    rows.push({
      smrConstruct: mapping.smrConstruct,
      compositeMappingReference: mapping.compositeRef,
      dialectTerm: mapping.dialectTerm,
      canonicalXpath: mapping.canonicalXpath,
      erpJsonPath: mapping.erpJsonPath,
    });
  }

  // Sort: Records first, then Composites, then Fields
  rows.sort((a, b) => {
    const order = { Record: 0, Composite: 1, Field: 2 };
    return (order[a.smrConstruct as keyof typeof order] ?? 2) - (order[b.smrConstruct as keyof typeof order] ?? 2);
  });

  return rows;
}

export function rowsToCsv(rows: ExcelRow[]): string {
  const headers = ["SMR Construct", "Composite Mapping Reference", "Dialect Term", "Canonical XPath", "ERP Json Path"];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = [
      row.smrConstruct,
      row.compositeMappingReference,
      row.dialectTerm,
      row.canonicalXpath,
      row.erpJsonPath,
    ].map(v => `"${(v ?? "").replace(/"/g, '""')}"`);
    lines.push(values.join(","));
  }
  return lines.join("\n");
}
