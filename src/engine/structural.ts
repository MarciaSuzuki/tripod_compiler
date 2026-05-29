import Ajv2020Import from "ajv/dist/2020.js";
import addFormatsImport from "ajv-formats";
import type { ErrorObject, ValidateFunction } from "ajv";
import type { Finding } from "./report.js";

// ajv ships CJS with no `exports` map; the runtime default import is the class (verified),
// but tsc/NodeNext types it as a namespace — bridge with a minimal typed cast.
interface AjvLike {
  compile(schema: object): ValidateFunction;
}
const AjvCtor = Ajv2020Import as unknown as new (opts?: Record<string, unknown>) => AjvLike;
const addFormats = addFormatsImport as unknown as (ajv: AjvLike) => void;

export type Validator = ValidateFunction;

/**
 * Compile a JSON Schema (draft 2020-12). `strict: false` because the locked schemas carry
 * descriptive keywords ajv doesn't treat as validation; `allErrors` so we report every issue
 * in one pass rather than bailing on the first.
 */
export function compileSchema(schema: object): Validator {
  const ajv = new AjvCtor({ allErrors: true, strict: false, allowUnionTypes: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

/**
 * Structural validation = Layer 1. ajv enforces the schema shape AND the closed-list enums
 * (GENRE_GROUP, GENRE, REGISTER, SPEECH_ACT, …) that the schema references — so closed-list
 * violations surface here as `block`. An `enum` failure is tagged `closed-list`; everything
 * else `schema`.
 */
export function structuralFindings(validate: Validator, json: unknown): Finding[] {
  if (validate(json)) return [];
  const errs: ErrorObject[] = validate.errors ?? [];
  return errs.map((e): Finding => {
    const location = e.instancePath && e.instancePath.length ? e.instancePath : "(root)";
    const p = (e.params ?? {}) as Record<string, unknown>;
    let extra = "";
    if (e.keyword === "enum" && Array.isArray(p["allowedValues"])) {
      extra = ` (allowed: ${(p["allowedValues"] as string[]).join(", ")})`;
    } else if (e.keyword === "additionalProperties" && p["additionalProperty"]) {
      extra = ` (unexpected property '${String(p["additionalProperty"])}')`;
    } else if (e.keyword === "required" && p["missingProperty"]) {
      extra = ` (missing '${String(p["missingProperty"])}')`;
    }
    return {
      severity: "block",
      code: e.keyword === "enum" ? "closed-list" : "schema",
      location,
      message: `${e.message ?? "invalid"}${extra}`,
    };
  });
}
