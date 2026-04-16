export interface ErpField {
  fieldKey: string;
  jsonPath: string;
  level: "header" | "line";
  sampleValue: unknown;
  dataType: string;
}

function detectDataType(value: unknown): string {
  if (value === null || value === undefined) return "string";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "decimal";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) return "datetime";
    if (/^\d+$/.test(value)) return "integer";
    if (/^\d+\.\d+$/.test(value)) return "decimal";
    return "string";
  }
  return "string";
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix: string,
  level: "header" | "line",
  results: ErpField[]
): void {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}|${key}` : key;
    const fullJsonPath = `JSON|JSON|${currentPath}`.replace(/\|/g, "|");

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      // Recurse into nested objects — but add the parent as well for context
      flattenObject(value as Record<string, unknown>, currentPath, level, results);
    } else if (Array.isArray(value)) {
      // Skip nested arrays of objects (they are the items array — handled separately)
      // But include arrays of primitives
      if (value.length > 0 && typeof value[0] !== "object") {
        results.push({
          fieldKey: currentPath,
          jsonPath: `JSON|JSON|${currentPath}`,
          level,
          sampleValue: value[0],
          dataType: detectDataType(value[0]),
        });
      }
    } else {
      results.push({
        fieldKey: currentPath,
        jsonPath: `JSON|JSON|${currentPath}`,
        level,
        sampleValue: value,
        dataType: detectDataType(value),
      });
    }
  }
}

export function parseErpJson(rawJson: Record<string, unknown>): ErpField[] {
  const results: ErpField[] = [];

  // Find the items/lines array — common names
  const itemsKeys = ["items", "lines", "orderlines", "LineItems", "SalesLines", "orderItems", "lineItems", "entries"];
  let itemsKey: string | null = null;
  let itemsArray: Record<string, unknown>[] | null = null;

  for (const key of itemsKeys) {
    const lowerKey = Object.keys(rawJson).find(k => k.toLowerCase() === key.toLowerCase());
    if (lowerKey && Array.isArray(rawJson[lowerKey]) && (rawJson[lowerKey] as unknown[]).length > 0) {
      itemsKey = lowerKey;
      itemsArray = rawJson[lowerKey] as Record<string, unknown>[];
      break;
    }
  }

  // Flatten header fields (exclude the items array)
  const headerObj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawJson)) {
    if (key !== itemsKey) {
      headerObj[key] = value;
    }
  }
  flattenObject(headerObj, "", "header", results);

  // Flatten line items using the first item as a template
  if (itemsArray && itemsArray.length > 0) {
    flattenObject(itemsArray[0], `${itemsKey}`, "line", results);
  }

  return results;
}
