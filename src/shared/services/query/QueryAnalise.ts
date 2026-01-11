export interface AssistantContent {
  type: string;
  text?: string;
}
export interface AssistantOutputItem {
  id: string;
  role: "assistant" | "system" | "user";
  type: "message" | "reasoning" | string;
  status?: string;
  content?: AssistantContent[];
}
export type PipelineStatus = "ok" | "blocked" | "invalid";

export interface PipelineData {
  status: PipelineStatus;
  ok: boolean;
  blocked: boolean;
  invalid: boolean;

  message: string;
  id: string;

  output: AssistantOutputItem[] | null;

  eventCode?: number;
  eventDesc?: string;
}
export interface ErrorDetail {
  code: number;
  message: string;
  description?: string;
}

export interface StandardResponse<T> {
  ok: boolean;
  data?: T;
  error?: ErrorDetail;
  timestamp: string;
  request_id: string;
}
type ParsedPipelineResult =
  | { kind: "ok"; data: PipelineData }
  | { kind: "blocked"; data: PipelineData }
  | { kind: "invalid"; data: PipelineData }
  | { kind: "error"; message: string; debug?: string };

export function parsePipelineResponse(
  resp: StandardResponse<PipelineData>
): ParsedPipelineResult {
  const data = resp.data;

  if (data?.status === "blocked") {
    return { kind: "blocked", data };
  }

  if (data?.status === "invalid") {
    return { kind: "invalid", data };
  }

  if (resp.ok && data) {
    return { kind: "ok", data };
  }

  return {
    kind: "error",
    message: resp.error?.message ?? "Erro inesperado",
    debug: resp.error?.description,
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isAssistantOutputArray(v: unknown): v is PipelineData["output"] {
  if (!Array.isArray(v)) return false;
  // valida minimamente um item (se existir)
  for (const it of v) {
    if (!isRecord(it)) continue;
    if (!isString(it.id)) return false;
    if (!isString(it.type)) return false;
    if (!isString(it.role)) return false;
    // content é opcional
  }
  return true;
}

function isPipelineData(v: unknown): v is PipelineData {
  if (!isRecord(v)) return false;

  // campos mínimos usados no front
  if (!isString(v.status)) return false;
  if (!isBoolean(v.ok)) return false;
  if (!isBoolean(v.blocked)) return false;
  if (!isBoolean(v.invalid)) return false;

  if (!isString(v.message)) return false;
  if (!isString(v.id)) return false;

  //if (!("output" in v) || !isAssistantOutputArray(v.output)) return false;
  if (!("output" in v)) return false;

  const out = v.output;
  if (out !== null && out !== undefined && !isAssistantOutputArray(out))
    return false;

  // opcionais
  if ("eventCode" in v && v.eventCode !== undefined && !isNumber(v.eventCode))
    return false;
  if ("eventDesc" in v && v.eventDesc !== undefined && !isString(v.eventDesc))
    return false;

  return true;
}

export function isPipelineStandardResponse(
  v: unknown
): v is StandardResponse<PipelineData> {
  if (!isRecord(v)) return false;

  if (!isBoolean(v.ok)) return false;

  // data pode existir ou não; mas se existir, deve ser PipelineData
  if ("data" in v && v.data !== undefined && !isPipelineData(v.data))
    return false;

  // error é opcional
  if ("error" in v && v.error !== undefined) {
    const e = v.error;
    if (!isRecord(e)) return false;
    if (!isNumber(e.code)) return false;
    if (!isString(e.message)) return false;
    if (
      "description" in e &&
      e.description !== undefined &&
      !isString(e.description)
    )
      return false;
  }

  if (!isString(v.timestamp)) return false;
  if (!isString(v.request_id)) return false;

  return true;
}
