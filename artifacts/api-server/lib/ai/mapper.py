import asyncio
import json
import os
import re
from dataclasses import dataclass, field
from typing import Literal

from openai import AsyncOpenAI

from lib.erp.parser import ErpField
from lib.canonical.schemas import CanonicalField

client = AsyncOpenAI(
    api_key=os.environ["AI_INTEGRATIONS_OPENAI_API_KEY"],
    base_url=os.environ["AI_INTEGRATIONS_OPENAI_BASE_URL"],
)

@dataclass
class MappingResult:
    canonical_xpath: str
    dialect_term: str
    erp_json_path: str
    erp_field_key: str
    confidence: float
    match_strategy: Literal["rule_based", "ai_semantic", "fuzzy", "unmapped"]
    rationale: str
    smr_construct: str
    composite_ref: str
    needs_review: bool

    def to_dict(self) -> dict:
        return {
            "canonicalXpath": self.canonical_xpath,
            "dialectTerm": self.dialect_term,
            "erpJsonPath": self.erp_json_path,
            "erpFieldKey": self.erp_field_key,
            "confidence": self.confidence,
            "matchStrategy": self.match_strategy,
            "rationale": self.rationale,
            "smrConstruct": self.smr_construct,
            "compositeRef": self.composite_ref,
            "needsReview": self.needs_review,
        }


def token_similarity(a: str, b: str) -> float:
    def tokenize(s: str) -> set[str]:
        return set(t for t in re.sub(r"[_\-\.]", " ", s.lower()).split() if t)

    tokens_a = tokenize(a)
    tokens_b = tokenize(b)
    if not tokens_a or not tokens_b:
        return 0.0
    overlap = len(tokens_a & tokens_b)
    return (2 * overlap) / (len(tokens_a) + len(tokens_b))


def get_top_candidates(
    erp_field: ErpField,
    canonical_fields: list[CanonicalField],
    top_k: int = 20,
) -> list[CanonicalField]:
    section_filtered = [
        cf for cf in canonical_fields
        if (erp_field.level == "line" and cf.section == "Lines")
        or (erp_field.level != "line" and cf.section != "Lines")
    ]
    scored = sorted(
        [
            (cf, token_similarity(erp_field.field_key, f"{cf.dialect_term} {cf.function_enum or ''}"))
            for cf in section_filtered
            if cf.smr_construct == "Field"
        ],
        key=lambda x: x[1],
        reverse=True,
    )
    return [cf for cf, _ in scored[:top_k]]


async def run_ai_batch(
    erp_system_id: str,
    document_type: str,
    erp_fields: list[ErpField],
    candidates: dict[str, list[CanonicalField]],
) -> list[dict]:
    erp_fields_prompt = [
        {
            "field_key": f.field_key,
            "json_path": f.json_path,
            "level": f.level,
            "sample_value": str(f.sample_value)[:100] if f.sample_value is not None else None,
            "data_type": f.data_type,
        }
        for f in erp_fields
    ]

    candidates_prompt = [
        {
            "field_key": f.field_key,
            "candidates": [
                {
                    "xpath": c.xpath,
                    "dialect_term": c.dialect_term,
                    "function_enum": c.function_enum,
                    "data_type": c.data_type,
                    "is_required": c.is_required,
                }
                for c in candidates.get(f.field_key, [])
            ],
        }
        for f in erp_fields
    ]

    system_prompt = (
        "You are an expert EDI and ERP integration engineer specializing in OpenText TrustedLink/BNStandard canonical schemas.\n"
        "Your task is to map ERP JSON fields to OpenText BNStandard Canonical XPaths.\n\n"
        "Rules:\n"
        "1. Focus on BUSINESS MEANING, not just field name similarity.\n"
        "2. One ERP field can map to MULTIPLE canonical paths.\n"
        "3. One canonical path can map to ONLY ONE ERP field (no duplicates).\n"
        "4. For line-level canonical fields, only match to items[] ERP fields.\n"
        "5. Output ONLY valid JSON array. No commentary outside the JSON block.\n"
        "6. If no good match exists, set erp_json_path to empty string and confidence to 0.\n"
        "7. ALWAYS provide a short rationale for each mapping decision.\n"
        "8. Confidence scale: 0.9-1.0=very certain, 0.7-0.89=likely, 0.5-0.69=plausible, below 0.5=uncertain."
    )

    user_prompt = (
        f"ERP System: {erp_system_id}\nDocument Type: {document_type}\n\n"
        f"ERP Fields to Map:\n{json.dumps(erp_fields_prompt, indent=2)}\n\n"
        f"Canonical Field Candidates per ERP field:\n{json.dumps(candidates_prompt, indent=2)}\n\n"
        "Return a JSON array. Each object must have:\n"
        "- canonical_xpath: full XPath from candidates (empty string if no match)\n"
        "- erp_json_path: the ERP field's json_path value\n"
        "- confidence: number 0-1\n"
        "- rationale: one sentence explaining the match\n"
        "Only one mapping per canonical_xpath."
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_completion_tokens=8192,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return parsed
        for v in parsed.values():
            if isinstance(v, list):
                return v
        return []
    except Exception:
        return []


BATCH_SIZE = 30


async def run_mapping(
    erp_system_id: str,
    document_type: str,
    erp_fields: list[ErpField],
    canonical_fields: list[CanonicalField],
    known_mappings: dict[str, str],
) -> list[MappingResult]:
    results: list[MappingResult] = []
    used_canonical_paths: set[str] = set()

    canonical_by_xpath = {cf.xpath: cf for cf in canonical_fields}

    unmatched: list[ErpField] = []
    for erp_field in erp_fields:
        known_xpath = known_mappings.get(erp_field.field_key)
        if known_xpath and known_xpath not in used_canonical_paths:
            canonical = canonical_by_xpath.get(known_xpath)
            if canonical:
                used_canonical_paths.add(known_xpath)
                results.append(MappingResult(
                    canonical_xpath=canonical.xpath,
                    dialect_term=canonical.dialect_term,
                    erp_json_path=erp_field.json_path,
                    erp_field_key=erp_field.field_key,
                    confidence=0.97,
                    match_strategy="rule_based",
                    rationale=f"Known mapping from {erp_system_id} adapter: {erp_field.field_key} → {canonical.dialect_term}",
                    smr_construct=canonical.smr_construct,
                    composite_ref=canonical.composite_ref or "",
                    needs_review=False,
                ))
                continue
        unmatched.append(erp_field)

    field_candidates: dict[str, list[CanonicalField]] = {
        f.field_key: get_top_candidates(f, canonical_fields)
        for f in unmatched
    }

    batches = [unmatched[i:i + BATCH_SIZE] for i in range(0, len(unmatched), BATCH_SIZE)]

    ai_results_per_batch = await asyncio.gather(*[
        run_ai_batch(erp_system_id, document_type, batch, {
            f.field_key: field_candidates[f.field_key] for f in batch
        })
        for batch in batches
    ])

    for batch, ai_results in zip(batches, ai_results_per_batch):
        ai_by_erp_path = {r["erp_json_path"]: r for r in ai_results if r.get("erp_json_path")}

        for erp_field in batch:
            ai_result = ai_by_erp_path.get(erp_field.json_path)

            if (
                ai_result
                and ai_result.get("canonical_xpath")
                and ai_result["canonical_xpath"] not in used_canonical_paths
                and ai_result.get("confidence", 0) > 0.3
            ):
                canonical = canonical_by_xpath.get(ai_result["canonical_xpath"])
                if canonical:
                    used_canonical_paths.add(ai_result["canonical_xpath"])
                    results.append(MappingResult(
                        canonical_xpath=canonical.xpath,
                        dialect_term=canonical.dialect_term,
                        erp_json_path=erp_field.json_path,
                        erp_field_key=erp_field.field_key,
                        confidence=ai_result["confidence"],
                        match_strategy="ai_semantic",
                        rationale=ai_result.get("rationale", ""),
                        smr_construct=canonical.smr_construct,
                        composite_ref=canonical.composite_ref or "",
                        needs_review=ai_result["confidence"] < 0.65,
                    ))
                    continue

            candidates = field_candidates.get(erp_field.field_key, [])
            if candidates:
                best = candidates[0]
                sim_score = token_similarity(
                    erp_field.field_key,
                    f"{best.dialect_term} {best.function_enum or ''}",
                )
                if sim_score > 0.2 and best.xpath not in used_canonical_paths:
                    used_canonical_paths.add(best.xpath)
                    fuzzy_conf = min(0.55, 0.3 + sim_score * 0.5)
                    results.append(MappingResult(
                        canonical_xpath=best.xpath,
                        dialect_term=best.dialect_term,
                        erp_json_path=erp_field.json_path,
                        erp_field_key=erp_field.field_key,
                        confidence=fuzzy_conf,
                        match_strategy="fuzzy",
                        rationale=f"Fuzzy string similarity match (score: {sim_score:.2f}) between \"{erp_field.field_key}\" and \"{best.dialect_term}\"",
                        smr_construct=best.smr_construct,
                        composite_ref=best.composite_ref or "",
                        needs_review=True,
                    ))
                    continue

            results.append(MappingResult(
                canonical_xpath="",
                dialect_term="",
                erp_json_path=erp_field.json_path,
                erp_field_key=erp_field.field_key,
                confidence=0.0,
                match_strategy="unmapped",
                rationale="No suitable canonical field found for this ERP field.",
                smr_construct="Field",
                composite_ref="",
                needs_review=True,
            ))

    return results
