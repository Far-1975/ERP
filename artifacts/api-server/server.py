import base64
import json
import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from lib.db import close_pool, fetch_all, fetch_one, insert_returning, to_json
from lib.erp.registry import ERP_SYSTEMS, get_erp_system, get_known_mappings
from lib.erp.parser import parse_erp_json
from lib.canonical.schemas import get_all_schemas, get_schema_by_doc_type
from lib.ai.mapper import run_mapping
from lib.excel.writer import build_excel_rows, rows_to_csv


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_pool()


BASE_PATH = os.environ.get("BASE_PATH", "/api").rstrip("/")

app = FastAPI(root_path=BASE_PATH, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunMappingRequest(BaseModel):
    erpSystemId: str
    documentType: str
    erpJson: dict[str, Any]


class ExportMappingRequest(BaseModel):
    sessionId: str


@app.get("/mapping/erp-systems")
async def list_erp_systems():
    return {
        "erpSystems": [
            {"id": e.id, "name": e.name, "description": e.description}
            for e in ERP_SYSTEMS
        ]
    }


@app.get("/mapping/canonical-schemas")
async def list_canonical_schemas():
    schemas = get_all_schemas()
    return {
        "schemas": [
            {
                "id": s.id,
                "name": s.name,
                "documentType": s.document_type,
                "version": s.version,
                "description": s.description,
            }
            for s in schemas
        ]
    }


@app.post("/mapping/run")
async def run_mapping_endpoint(req: RunMappingRequest):
    erp_system = get_erp_system(req.erpSystemId)
    if not erp_system:
        raise HTTPException(status_code=400, detail=f"Unknown ERP system: {req.erpSystemId}")

    schema = get_schema_by_doc_type(req.documentType)
    if not schema:
        raise HTTPException(status_code=400, detail=f"Unknown document type: {req.documentType}")

    erp_fields = parse_erp_json(req.erpJson)
    known_mappings = get_known_mappings(req.erpSystemId)

    mappings = await run_mapping(
        req.erpSystemId,
        req.documentType,
        erp_fields,
        schema.fields,
        known_mappings,
    )

    mapping_dicts = [m.to_dict() for m in mappings]
    field_mappings = [m for m in mappings if m.canonical_xpath]
    unmapped_count = sum(1 for m in mappings if not m.canonical_xpath)
    confidences = [m.confidence for m in field_mappings]

    stats = {
        "totalErpFields": len(erp_fields),
        "totalCanonicalFields": sum(1 for f in schema.fields if f.smr_construct == "Field"),
        "mappedFields": len(field_mappings),
        "unmappedFields": unmapped_count,
        "highConfidence": sum(1 for m in field_mappings if m.confidence >= 0.85),
        "mediumConfidence": sum(1 for m in field_mappings if 0.65 <= m.confidence < 0.85),
        "lowConfidence": sum(1 for m in field_mappings if m.confidence < 0.65),
        "needsReview": sum(1 for m in mappings if m.needs_review),
        "averageConfidence": round(sum(confidences) / len(confidences), 2) if confidences else 0,
    }

    erp_fields_json = [
        {
            "fieldKey": f.field_key,
            "jsonPath": f.json_path,
            "level": f.level,
            "sampleValue": str(f.sample_value) if f.sample_value is not None else None,
            "dataType": f.data_type,
        }
        for f in erp_fields
    ]

    session = await insert_returning(
        """
        INSERT INTO mapping_sessions
            (erp_system_id, erp_system_name, document_type, erp_fields, mappings, stats)
        VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb)
        RETURNING id, created_at
        """,
        req.erpSystemId,
        erp_system.name,
        req.documentType,
        to_json(erp_fields_json),
        to_json(mapping_dicts),
        to_json(stats),
    )

    return {
        "sessionId": str(session["id"]),
        "erpSystemId": req.erpSystemId,
        "documentType": req.documentType,
        "erpFields": erp_fields_json,
        "mappings": mapping_dicts,
        "stats": stats,
        "createdAt": session["created_at"].isoformat(),
    }


@app.post("/mapping/export")
async def export_mapping(req: ExportMappingRequest):
    try:
        session_id = int(req.sessionId)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    session = await fetch_one(
        "SELECT * FROM mapping_sessions WHERE id = $1",
        session_id,
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    schema = get_schema_by_doc_type(session["document_type"])
    if not schema:
        raise HTTPException(status_code=400, detail="Unknown document type")

    mappings = json.loads(session["mappings"]) if isinstance(session["mappings"], str) else session["mappings"]
    canonical_field_dicts = schema.fields_as_dicts()
    rows = build_excel_rows(mappings, canonical_field_dicts)
    erp_name = session["erp_system_id"].upper()
    filename = f"SMR_CANONICAL_TO_{erp_name}_V1.csv"
    csv_content = rows_to_csv(rows)

    b64 = base64.b64encode(csv_content.encode("utf-8")).decode("utf-8")
    download_url = f"data:text/csv;base64,{b64}"
    return {"downloadUrl": download_url, "filename": filename}


@app.get("/mapping/sessions")
async def list_sessions():
    sessions = await fetch_all(
        "SELECT * FROM mapping_sessions ORDER BY created_at DESC LIMIT 50"
    )
    result = []
    for s in sessions:
        stats = json.loads(s["stats"]) if isinstance(s["stats"], str) else s["stats"]
        result.append({
            "id": str(s["id"]),
            "erpSystemId": s["erp_system_id"],
            "erpSystemName": s["erp_system_name"],
            "documentType": s["document_type"],
            "totalFields": stats.get("totalErpFields", 0),
            "mappedFields": stats.get("mappedFields", 0),
            "averageConfidence": stats.get("averageConfidence", 0),
            "createdAt": s["created_at"].isoformat(),
        })
    return {"sessions": result}


@app.get("/mapping/sessions/{session_id}")
async def get_session(session_id: int):
    session = await fetch_one(
        "SELECT * FROM mapping_sessions WHERE id = $1",
        session_id,
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    erp_fields = json.loads(session["erp_fields"]) if isinstance(session["erp_fields"], str) else session["erp_fields"]
    mappings = json.loads(session["mappings"]) if isinstance(session["mappings"], str) else session["mappings"]
    stats = json.loads(session["stats"]) if isinstance(session["stats"], str) else session["stats"]

    return {
        "id": str(session["id"]),
        "erpSystemId": session["erp_system_id"],
        "erpSystemName": session["erp_system_name"],
        "documentType": session["document_type"],
        "erpFields": erp_fields,
        "mappings": mappings,
        "stats": stats,
        "createdAt": session["created_at"].isoformat(),
    }


@app.get("/mapping/stats")
async def get_stats():
    sessions = await fetch_all("SELECT * FROM mapping_sessions")

    total_fields_mapped = 0
    total_confidence = 0.0
    confidence_count = 0
    erp_counts: dict[str, dict] = {}
    doc_type_counts: dict[str, int] = {}

    for s in sessions:
        stats = json.loads(s["stats"]) if isinstance(s["stats"], str) else s["stats"]
        total_fields_mapped += stats.get("mappedFields", 0)
        avg_conf = stats.get("averageConfidence", 0)
        if avg_conf:
            total_confidence += avg_conf
            confidence_count += 1

        eid = s["erp_system_id"]
        if eid not in erp_counts:
            erp_counts[eid] = {"name": s["erp_system_name"], "count": 0}
        erp_counts[eid]["count"] += 1

        dt = s["document_type"]
        doc_type_counts[dt] = doc_type_counts.get(dt, 0) + 1

    return {
        "totalSessions": len(sessions),
        "totalFieldsMapped": total_fields_mapped,
        "averageConfidenceOverall": round(total_confidence / confidence_count, 2) if confidence_count else 0,
        "sessionsByErp": [
            {"erpSystemId": k, "erpSystemName": v["name"], "count": v["count"]}
            for k, v in erp_counts.items()
        ],
        "sessionsByDocType": [
            {"documentType": k, "count": v}
            for k, v in doc_type_counts.items()
        ],
    }
