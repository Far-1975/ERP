import csv
import io
from dataclasses import dataclass

@dataclass
class ExcelRow:
    smr_construct: str
    composite_mapping_reference: str
    dialect_term: str
    canonical_xpath: str
    erp_json_path: str

def build_excel_rows(mappings: list[dict], canonical_fields: list[dict]) -> list[ExcelRow]:
    rows: list[ExcelRow] = []

    record_fields = [cf for cf in canonical_fields if cf["smr_construct"] == "Record"]
    for rf in record_fields:
        rows.append(ExcelRow(
            smr_construct="Record",
            composite_mapping_reference="",
            dialect_term="",
            canonical_xpath=rf["xpath"],
            erp_json_path="",
        ))

    composite_fields = [cf for cf in canonical_fields if cf["smr_construct"] == "Composite"]
    for cf in composite_fields:
        child_prefix = cf["xpath"].split("[")[0] if "[" in cf["xpath"] else cf["xpath"]
        mapped_children = [m for m in mappings if m.get("canonicalXpath", "").startswith(child_prefix) and m.get("erpJsonPath")]
        erp_paths = ", ".join(m["erpJsonPath"] for m in mapped_children)
        rows.append(ExcelRow(
            smr_construct="Composite",
            composite_mapping_reference=cf.get("composite_ref") or "",
            dialect_term="",
            canonical_xpath=cf["xpath"],
            erp_json_path=erp_paths,
        ))

    for mapping in mappings:
        if not mapping.get("canonicalXpath"):
            rows.append(ExcelRow(
                smr_construct="Field",
                composite_mapping_reference="",
                dialect_term="",
                canonical_xpath="",
                erp_json_path=mapping.get("erpJsonPath", ""),
            ))
        else:
            rows.append(ExcelRow(
                smr_construct=mapping.get("smrConstruct", "Field"),
                composite_mapping_reference=mapping.get("compositeRef", ""),
                dialect_term=mapping.get("dialectTerm", ""),
                canonical_xpath=mapping.get("canonicalXpath", ""),
                erp_json_path=mapping.get("erpJsonPath", ""),
            ))

    order = {"Record": 0, "Composite": 1, "Field": 2}
    rows.sort(key=lambda r: order.get(r.smr_construct, 2))
    return rows

def rows_to_csv(rows: list[ExcelRow]) -> str:
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)
    writer.writerow(["SMR Construct", "Composite Mapping Reference", "Dialect Term", "Canonical XPath", "ERP Json Path"])
    for row in rows:
        writer.writerow([
            row.smr_construct,
            row.composite_mapping_reference,
            row.dialect_term,
            row.canonical_xpath,
            row.erp_json_path,
        ])
    return output.getvalue()
