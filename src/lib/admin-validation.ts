import { CONTENT_SCHEMAS, type ContentField } from "./content-schema";
import type { CollectionDef, FieldDef } from "./collections";

export const CONTENT_STATUSES = ["published", "draft", "needs_review"] as const;
export type ContentStatusValue = (typeof CONTENT_STATUSES)[number];

export function isContentStatus(value: unknown): value is ContentStatusValue {
  return typeof value === "string" && (CONTENT_STATUSES as readonly string[]).includes(value);
}

/* --------------------------------------------------------------- content */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateField(field: ContentField, value: unknown, path: string): string[] {
  const at = path ? `${path} → ${field.label}` : field.label;
  const empty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);

  if (empty) {
    return field.required ? [`${at} is required.`] : [];
  }

  switch (field.kind) {
    case "text":
    case "textarea":
    case "richtext":
    case "url":
    case "image":
      if (typeof value !== "string") return [`${at} must be text.`];
      if (value.length > 20000) return [`${at} is too long.`];
      return [];
    case "number":
      if (typeof value !== "number" || Number.isNaN(value)) return [`${at} must be a number.`];
      return [];
    case "boolean":
      if (typeof value !== "boolean") return [`${at} must be true or false.`];
      return [];
    case "select": {
      if (typeof value !== "string") return [`${at} must be a choice.`];
      if (field.options && !field.options.some((o) => o.value === value)) {
        return [`${at} has an unknown choice.`];
      }
      return [];
    }
    case "string-list": {
      if (!Array.isArray(value)) return [`${at} must be a list.`];
      const errors: string[] = [];
      value.forEach((item, index) => {
        if (typeof item !== "string") errors.push(`${at} item ${index + 1} must be text.`);
        else if (item.length > 2000) errors.push(`${at} item ${index + 1} is too long.`);
      });
      return errors;
    }
    case "object": {
      if (!isPlainObject(value)) return [`${at} must be a group of fields.`];
      return validateFields(field.fields ?? [], value, at);
    }
    case "object-list": {
      if (!Array.isArray(value)) return [`${at} must be a list.`];
      if (field.max && value.length > field.max) {
        return [`${at} can contain at most ${field.max} items.`];
      }
      const errors: string[] = [];
      value.forEach((item, index) => {
        if (!isPlainObject(item)) {
          errors.push(`${at} item ${index + 1} is malformed.`);
          return;
        }
        errors.push(...validateFields(field.fields ?? [], item, `${at} ${index + 1}`));
      });
      return errors;
    }
    default:
      return [`${at} has an unknown field type.`];
  }
}

function validateFields(fields: ContentField[], value: Record<string, unknown>, path: string): string[] {
  const errors: string[] = [];
  for (const field of fields) {
    errors.push(...validateField(field, value[field.name], path));
  }
  return errors;
}

/**
 * Validate a content block against its editor schema. The special
 * `__items__` root field means the stored value is a bare array.
 */
export function validateContentValue(schemaKey: string, value: unknown): string[] {
  const schema = CONTENT_SCHEMAS[schemaKey];
  if (!schema) return ["Unknown content block."];

  if (schema.shape === "text") {
    if (typeof value !== "string") return ["This block must be a single line of text."];
    if (value.length > 500) return ["This block is too long."];
    return [];
  }

  const fields = schema.fields ?? [];
  if (fields.length === 1 && fields[0].name === "__items__") {
    return validateField(fields[0], value, "");
  }

  if (!isPlainObject(value)) return ["This content block is malformed."];
  return validateFields(fields, value, "");
}

/* ------------------------------------------------------------ collections */

export type CollectionWrite = {
  data: Record<string, unknown>;
  errors: string[];
};

function coerceField(field: FieldDef, value: unknown): unknown {
  switch (field.type) {
    case "checkbox":
      return value === 1 || value === true || value === "1" || value === "on" || value === "true";
    case "number":
    case "order": {
      if (value === "" || value === null || value === undefined) return field.required ? NaN : 0;
      const n = Number(value);
      return Number.isFinite(n) ? Math.trunc(n) : NaN;
    }
    case "tags": {
      if (Array.isArray(value)) return value.map(String).join(", ");
      return value === null || value === undefined ? null : String(value).trim() || null;
    }
    default: {
      if (value === null || value === undefined) return null;
      const text = String(value).trim();
      return text === "" ? null : text;
    }
  }
}

/**
 * Validate + normalise an admin collection submission.
 * Only declared fields are ever written; unknown keys are ignored.
 */
export function validateCollectionInput(
  def: CollectionDef,
  input: unknown,
  opts: { create: boolean }
): CollectionWrite {
  const errors: string[] = [];
  if (!isPlainObject(input)) {
    return { data: {}, errors: ["The submitted form was malformed. Please try again."] };
  }

  const data: Record<string, unknown> = {};
  for (const field of def.fields) {
    const present = Object.prototype.hasOwnProperty.call(input, field.name);
    if (!present && !opts.create) continue;
    let value = coerceField(field, input[field.name]);

    if (field.name === "status") {
      if (!isContentStatus(value)) {
        errors.push("Choose a valid status.");
        value = def.defaultStatus;
      }
    }

    const empty =
      value === null ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value)) ||
      (field.type === "checkbox" && value === 0);

    if (field.required && empty) {
      errors.push(`${field.label} is required.`);
      continue;
    }

    if (typeof value === "string" && value.length > 20000) {
      errors.push(`${field.label} is too long.`);
      continue;
    }

    if ((field.type === "number" || field.type === "order") && typeof value === "number" && Number.isNaN(value)) {
      if (field.required) {
        errors.push(`${field.label} must be a number.`);
        continue;
      }
      value = 0;
    }

    if ((field.type === "number" || field.type === "order") && typeof value === "number") {
      if (field.min !== undefined && value < field.min) errors.push(`${field.label} is too small.`);
      if (field.max !== undefined && value > field.max) errors.push(`${field.label} is too large.`);
    }

    if (field.type === "select" && value !== null && field.options?.length) {
      const allowed = field.options.some((o) => o.value === value);
      if (!allowed) errors.push(`${field.label} has an unknown choice.`);
    }

    data[field.name] = value;
  }

  return { data, errors };
}
