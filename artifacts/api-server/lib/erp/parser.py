import re
from dataclasses import dataclass
from typing import Any, Literal

@dataclass
class ErpField:
    field_key: str
    json_path: str
    level: Literal["header", "line"]
    sample_value: Any
    data_type: str

def detect_data_type(value: Any) -> str:
    if value is None:
        return "string"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int):
        return "integer"
    if isinstance(value, float):
        return "decimal"
    if isinstance(value, str):
        if re.match(r"^\d{4}-\d{2}-\d{2}(T.*)?$", value):
            return "datetime"
        if re.match(r"^\d+$", value):
            return "integer"
        if re.match(r"^\d+\.\d+$", value):
            return "decimal"
        return "string"
    return "string"

def flatten_object(
    obj: dict[str, Any],
    prefix: str,
    level: Literal["header", "line"],
    results: list[ErpField],
) -> None:
    for key, value in obj.items():
        current_path = f"{prefix}|{key}" if prefix else key

        if isinstance(value, dict):
            flatten_object(value, current_path, level, results)
        elif isinstance(value, list):
            if value and not isinstance(value[0], dict):
                results.append(ErpField(
                    field_key=current_path,
                    json_path=f"JSON|JSON|{current_path}",
                    level=level,
                    sample_value=value[0],
                    data_type=detect_data_type(value[0]),
                ))
        else:
            results.append(ErpField(
                field_key=current_path,
                json_path=f"JSON|JSON|{current_path}",
                level=level,
                sample_value=value,
                data_type=detect_data_type(value),
            ))

def parse_erp_json(raw_json: dict[str, Any]) -> list[ErpField]:
    results: list[ErpField] = []

    items_keys = ["items", "lines", "orderlines", "LineItems", "SalesLines", "orderItems", "lineItems", "entries"]
    items_key: str | None = None
    items_array: list[dict] | None = None

    for key in items_keys:
        matching = next((k for k in raw_json if k.lower() == key.lower()), None)
        if matching and isinstance(raw_json[matching], list) and len(raw_json[matching]) > 0:
            items_key = matching
            items_array = raw_json[matching]
            break

    header_obj = {k: v for k, v in raw_json.items() if k != items_key}
    flatten_object(header_obj, "", "header", results)

    if items_array and len(items_array) > 0 and isinstance(items_array[0], dict):
        flatten_object(items_array[0], items_key, "line", results)

    return results
