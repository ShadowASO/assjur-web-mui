/**
 * apiTools.ts (consolidado, sem any)
 * - Helpers genéricos
 * - Erros padronizados (ApiError)
 * - Retornos consistentes
 * - Inserts normalizados (sempre retorna id/message/row)
 */

import { BASE_API_URL, getApiObjeto } from "./ApiCliente";
import type { StandardBodyResponse } from "./ApiCliente";

import type {
  AutosRow,
  ContextoRow,
  DocsRow,
  EventosRow,
  ModelosRow,
  PromptsRow,
  UploadFilesRow,
} from "./../../../types/tabelas";

import { TokenStorage } from "./TokenStorage";
import type { MetadadosProcessoCnj } from "../../../types/cnjTypes";
import { ApiError } from "../erros/errosApi";

import type { BaseRow, BodyBaseInsert } from "../../../../pages/rag/typeRAG";

// ======================= Infra de API =======================

const api = getApiObjeto();

type OkResponse<T> = StandardBodyResponse & { ok: true; data: T };

function ensureOk<T>(
  rsp: StandardBodyResponse,
  endpoint: string
): asserts rsp is StandardBodyResponse & { ok: true; data: T } {
  if (rsp?.ok === true) return;

  const code = rsp?.error?.code ?? 0;
  const msg = rsp?.error?.message || `Falha na chamada à API (${endpoint}).`;

  throw new ApiError(msg, code, endpoint);
}

// Payloads comuns do backend
export type RowsPayload<T> = { rows?: T[]; row?: T | null; message?: string };
export type DocsPayload<T> = { docs?: T[]; doc?: T | null; message?: string };

// Envelope típico de inserts (varia por endpoint)
type InsertPayload<T> = {
  message?: string;
  id?: string;
  row?: T | null;
  doc?: T | null;
  _id?: string;
  id_doc?: string;
  id_rag?: string;
};

export interface InsertResult<T> {
  id: string;
  message?: string;
  row?: T | null;
}

/** type guard sem any */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getStringProp(
  obj: Record<string, unknown>,
  key: string
): string | null {
  const v = obj[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function pickIdFromUnknown(data: unknown): string | null {
  if (!isRecord(data)) return null;

  // id na raiz
  const id = getStringProp(data, "id");
  if (id) return id;

  // row.id
  const row = data["row"];
  if (isRecord(row)) {
    const rid = getStringProp(row, "id");
    if (rid) return rid;
  }

  // doc.id
  const doc = data["doc"];
  if (isRecord(doc)) {
    const did = getStringProp(doc, "id");
    if (did) return did;
  }

  // variações comuns
  const _id = getStringProp(data, "_id");
  if (_id) return _id;

  const id_doc = getStringProp(data, "id_doc");
  if (id_doc) return id_doc;

  const id_rag = getStringProp(data, "id_rag");
  if (id_rag) return id_rag;

  return null;
}

function normalizeInsertResult<T>(
  payload: InsertPayload<T>,
  endpoint: string
): InsertResult<T> {
  const id = pickIdFromUnknown(payload);
  if (!id) {
    throw new ApiError(
      "Registro inserido, mas a API não retornou o ID do novo registro.",
      0,
      endpoint
    );
  }

  const row = (payload.row ?? payload.doc ?? null) as T | null;

  return { id, message: payload.message, row };
}

function getRows<T>(rsp: StandardBodyResponse, endpoint: string): T[] {
  ensureOk<RowsPayload<T>>(rsp, endpoint);
  const data = rsp.data;
  return Array.isArray(data?.rows) ? data.rows : [];
}

function getRow<T>(rsp: StandardBodyResponse, endpoint: string): T | null {
  ensureOk<RowsPayload<T>>(rsp, endpoint);
  const data = rsp.data;
  return (data?.row ?? null) as T | null;
}

function getDocs<T>(rsp: StandardBodyResponse, endpoint: string): T[] {
  ensureOk<DocsPayload<T>>(rsp, endpoint);
  const data = rsp.data;
  return Array.isArray(data?.docs) ? data.docs : [];
}

function getDoc<T>(rsp: StandardBodyResponse, endpoint: string): T | null {
  ensureOk<DocsPayload<T>>(rsp, endpoint);
  const data = rsp.data;
  return (data?.doc ?? null) as T | null;
}

// Opcional: suporte a AbortController/timeout em buscas
export interface CallOptions {
  signal?: AbortSignal;
}

async function apiGet<T>(
  url: string,
  opts?: CallOptions
): Promise<OkResponse<T>> {
  const rsp = await api.get(url, undefined, { signal: opts?.signal });
  ensureOk<T>(rsp, url);
  return rsp as OkResponse<T>;
}

async function apiPost<T>(
  url: string,
  body?: unknown,
  opts?: CallOptions
): Promise<OkResponse<T>> {
  const rsp = await api.post(url, body, { signal: opts?.signal });
  ensureOk<T>(rsp, url);
  return rsp as OkResponse<T>;
}

async function apiPut<T>(
  url: string,
  body?: unknown,
  opts?: CallOptions
): Promise<OkResponse<T>> {
  const rsp = await api.put(url, body, { signal: opts?.signal });
  ensureOk<T>(rsp, url);
  return rsp as OkResponse<T>;
}

async function apiDelete<T>(
  url: string,
  opts?: CallOptions
): Promise<OkResponse<T>> {
  const rsp = await api.delete(url, { signal: opts?.signal });
  ensureOk<T>(rsp, url);
  return rsp as OkResponse<T>;
}

// ======================= CNJ =======================

interface IResponseMetadadosCNJ {
  metadados?: MetadadosProcessoCnj;
  message?: string;
}

/** Confirma se o processo existe e devolve metadados do CNJ */
export async function searchMetadadosCNJ(
  strProcesso: string,
  opts?: CallOptions
): Promise<MetadadosProcessoCnj | null> {
  try {
    const rsp = await apiPost<IResponseMetadadosCNJ>(
      "/cnj/processo",
      { numeroProcesso: strProcesso },
      opts
    );

    const meta = rsp.data.metadados;
    const total = meta?.hits?.total?.value ?? 0;

    return total > 0 && meta ? meta : null;
  } catch (err) {
    console.error("Erro na busca do processo no CNJ!", err);
    throw new ApiError(
      "Erro na busca do processo no CNJ!",
      undefined,
      "/cnj/processo"
    );
  }
}

// ======================= Tokens =======================

export interface DataTokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export async function getConsumoTokens(
  opts?: CallOptions
): Promise<DataTokenUsage> {
  try {
    const rsp = await apiGet<DataTokenUsage>("/sessions/uso", opts);
    return rsp.data;
  } catch (err) {
    console.error("Erro ao acessar consumo de tokens:", err);
    throw new ApiError(
      "Erro ao acessar consumo de tokens.",
      undefined,
      "/sessions/uso"
    );
  }
}

// ======================= Upload  =======================

export async function uploadFileToServer(
  idContexto: string,
  file: File
): Promise<boolean> {
  if (!file) return false;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("idContexto", String(idContexto));
  formData.append("filename_ori", file.name);

  try {
    const rsp = await fetch(`${BASE_API_URL}/contexto/documentos/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TokenStorage.accessToken ?? ""}`,
      },
      body: formData,
    });

    if (!rsp.ok) {
      const msg = await safeReadText(rsp);
      throw new ApiError(
        msg || "Falha no upload do arquivo.",
        rsp.status,
        "/contexto/documentos/upload"
      );
    }
    return true;
  } catch (err) {
    console.error("Erro no upload do arquivo:", err);
    throw err instanceof ApiError
      ? err
      : new ApiError(
          "Erro no upload do arquivo.",
          undefined,
          "/contexto/documentos/upload"
        );
  }
}

async function safeReadText(rsp: Response) {
  try {
    return await rsp.text();
  } catch {
    return "";
  }
}

export async function refreshUploadFiles(
  idContexto: string,
  opts?: CallOptions
): Promise<UploadFilesRow[]> {
  if (!idContexto) throw new ApiError("ID do contexto ausente.");
  const rsp = await apiGet<RowsPayload<UploadFilesRow>>(
    `/contexto/documentos/upload/${idContexto}`,
    opts
  );
  return getRows<UploadFilesRow>(rsp, "/contexto/documentos/upload/:id");
}

export async function deleteUploadFileById(id: number): Promise<boolean> {
  await apiDelete<unknown>(`/contexto/documentos/upload/${id}`);
  return true;
}

export async function extractDocument(
  idCtxt: string,
  idDoc: number
): Promise<boolean> {
  await apiPost<unknown>("/contexto/documentos", [
    { IdContexto: idCtxt, IdFile: idDoc },
  ]);
  return true;
}

export async function extractByContexto(idContexto: string): Promise<boolean> {
  await apiPost<unknown>(`/contexto/documentos/${idContexto}`);
  return true;
}

export async function consolidarAutosByContexto(
  idContexto: string
): Promise<boolean> {
  await apiPost<unknown>(`/contexto/documentos/saneador/${idContexto}`);
  return true;
}

export async function refreshByContexto(
  idContexto: string,
  opts?: CallOptions
): Promise<DocsRow[]> {
  if (!idContexto) throw new ApiError("ID do registro ausente.");
  const rsp = await apiGet<RowsPayload<DocsRow>>(
    `/contexto/documentos/all/${idContexto}`,
    opts
  );
  return getRows<DocsRow>(rsp, "/contexto/documentos/all/:id");
}

export async function deleteDocByIdDoc(idDoc: string): Promise<boolean> {
  await apiDelete<unknown>(`/contexto/documentos/${idDoc}`);
  return true;
}

export async function selectAutosTemp(idDoc: number): Promise<DocsRow | null> {
  if (!idDoc) throw new ApiError("ID do registro ausente.");
  const rsp = await apiGet<RowsPayload<DocsRow>>(
    `/contexto/documentos/${idDoc}`
  );
  return getRow<DocsRow>(rsp, "/contexto/documentos/:id");
}

// ======================= Autuação =======================

export interface DataAutuaDocumento {
  sucesso: boolean;
  extractedFiles: string[];
  extractedErros: string[];
  message: string;
}

export async function autuarDocumentos(
  body: { IdContexto: string; IdDoc: string }[]
): Promise<DataAutuaDocumento | null> {
  if (body.length === 0) return null;
  const rsp = await apiPost<DataAutuaDocumento>(
    "/contexto/documentos/autua",
    body
  );
  return rsp.data ?? null;
}

// ======================= Autos =======================

export async function refreshAutos(idContexto: string): Promise<AutosRow[]> {
  if (!idContexto) return [];
  const rsp = await apiGet<RowsPayload<AutosRow>>(
    `/contexto/autos/all/${idContexto}`
  );
  return getRows<AutosRow>(rsp, "/contexto/autos/all/:id");
}

export async function selectAutos(idDoc: number): Promise<AutosRow | null> {
  if (!idDoc) throw new ApiError("ID do registro ausente.");
  const rsp = await apiGet<RowsPayload<AutosRow>>(`/contexto/autos/${idDoc}`);
  return getRow<AutosRow>(rsp, "/contexto/autos/:id");
}

export async function insertDocumentoAutos(
  IdCtxt: string,
  IdNatu: number,
  IdPje: string,
  Doc: string,
  DocJson: string
): Promise<AutosRow | null> {
  const rsp = await apiPost<RowsPayload<AutosRow>>("/contexto/autos", {
    id_ctxt: IdCtxt,
    id_natu: IdNatu,
    id_pje: IdPje,
    doc: Doc,
    doc_json: DocJson,
  });
  return getRow<AutosRow>(rsp, "/contexto/autos");
}

export async function deleteAutos(id: string): Promise<boolean> {
  await apiDelete<unknown>(`/contexto/autos/${id}`);
  return true;
}

// ======================= Contexto =======================

export async function insertContexto(
  nrProcesso: string,
  juizo: string,
  classe: string,
  assunto: string
): Promise<ContextoRow | null> {
  const rsp = await apiPost<RowsPayload<ContextoRow>>("/contexto", {
    NrProc: nrProcesso,
    Juizo: juizo,
    Classe: classe,
    Assunto: assunto,
  });
  return getRow<ContextoRow>(rsp, "/contexto");
}

export async function updateContexto(
  id: string,
  juizo: string,
  classe: string,
  assunto: string
): Promise<ContextoRow | null> {
  const rsp = await apiPut<RowsPayload<ContextoRow>>(`/contexto/${id}`, {
    Id: id,
    Juizo: juizo,
    Classe: classe,
    Assunto: assunto,
  });
  return getRow<ContextoRow>(rsp, "/contexto");
}

export async function getContexto(
  strProcesso: string
): Promise<ContextoRow | null> {
  const rsp = await apiGet<RowsPayload<ContextoRow>>(
    `/contexto/processo/${strProcesso}`
  );
  return getRow<ContextoRow>(rsp, "/contexto/processo/:nr");
}

export async function searchContexto(
  strProcesso: string,
  opts?: CallOptions
): Promise<ContextoRow[]> {
  const rsp = await apiPost<RowsPayload<ContextoRow>>(
    "/contexto/processo/search",
    { search_processo: strProcesso },
    opts
  );
  return getRows<ContextoRow>(rsp, "/contexto/processo/search");
}

export async function getContextoById(
  idCtxt: string
): Promise<ContextoRow | null> {
  const rsp = await apiGet<RowsPayload<ContextoRow>>(`/contexto/${idCtxt}`);
  return getRow<ContextoRow>(rsp, "/contexto/:id");
}

/**
 * ✅ Mantida (como você pediu)
 * Observação: seu backend aparentemente devolve "row" como um ARRAY aqui (por isso T = ContextoRow[])
 */
export async function getContextoByIdCtxt(
  idCtxt: string
): Promise<ContextoRow[] | null> {
  const rsp = await apiGet<RowsPayload<ContextoRow[]>>(
    `/contexto/search/${idCtxt}`
  );
  return getRow<ContextoRow[]>(rsp, "/contexto/search/:id");
}

export async function getContextosAll(): Promise<ContextoRow[] | null> {
  const rsp = await apiGet<RowsPayload<ContextoRow>>(`/contexto`);
  return getRows<ContextoRow>(rsp, "/contexto");
}

/**
 * ✅ Mantida (como você pediu)
 * Mesmo padrão: "row" pode estar vindo como array
 */
export async function getContextoTokensUso(
  idCtxt: string
): Promise<ContextoRow[] | null> {
  const rsp = await apiGet<RowsPayload<ContextoRow[]>>(
    `/contexto/tokens/uso/${idCtxt}`
  );
  return getRow<ContextoRow[]>(rsp, "/contexto/tokens/uso/:id");
}

export async function deleteContexto(id: string): Promise<boolean> {
  try {
    await apiDelete<unknown>(`/contexto/${id}`);
    return true;
  } catch (err) {
    console.error("Erro ao deletar contexto:", err);
    throw new ApiError(
      "Exclusão rejeitada! Exclua primeiro os documentos autuados!",
      undefined,
      "/contexto/:id"
    );
  }
}

// ======================= Prompts =======================

export async function refreshPrompts(): Promise<PromptsRow[]> {
  const rsp = await apiGet<RowsPayload<PromptsRow>>("/tabelas/prompts");
  return getRows<PromptsRow>(rsp, "/tabelas/prompts");
}

export async function selectPrompt(
  idPrompt: number
): Promise<PromptsRow | null> {
  const rsp = await apiGet<RowsPayload<PromptsRow>>(
    `/tabelas/prompts/${idPrompt}`
  );
  return getRow<PromptsRow>(rsp, "/tabelas/prompts/:id");
}

export async function updatePrompt(
  idPrompt: number,
  nmDesc: string,
  txtPrompt: string
): Promise<PromptsRow | null> {
  const rsp = await apiPut<RowsPayload<PromptsRow>>("/tabelas/prompts", {
    id_prompt: idPrompt,
    nm_desc: nmDesc,
    txt_prompt: txtPrompt,
  });
  return getRow<PromptsRow>(rsp, "/tabelas/prompts");
}

export async function deletePrompt(idPrompt: number): Promise<boolean> {
  await apiDelete<unknown>(`/tabelas/prompts/${idPrompt}`);
  return true;
}

export async function insertPrompt(
  idNat: number,
  idDoc: number,
  idClasse: number,
  idAssunto: number,
  nmDesc: string,
  txtPrompt: string
): Promise<PromptsRow | null> {
  const rsp = await apiPost<RowsPayload<PromptsRow>>("/tabelas/prompts", {
    id_nat: idNat,
    id_doc: idDoc,
    id_classe: idClasse,
    id_assunto: idAssunto,
    nm_desc: nmDesc,
    txt_prompt: txtPrompt,
  });
  return getRow<PromptsRow>(rsp, "/tabelas/prompts");
}

// ======================= Modelos =======================

export async function insertModelos(
  natureza: string,
  ementa: string,
  inteiro_teor: string
): Promise<InsertResult<ModelosRow>> {
  const rsp = await apiPost<InsertPayload<ModelosRow>>("/tabelas/modelos", {
    natureza,
    ementa,
    inteiro_teor,
  });
  return normalizeInsertResult<ModelosRow>(rsp.data, "/tabelas/modelos");
}

export async function updateModelos(
  id: string,
  natureza: string,
  ementa: string,
  inteiro_teor: string
): Promise<ModelosRow | null> {
  const rsp = await apiPut<DocsPayload<ModelosRow>>(`/tabelas/modelos/${id}`, {
    natureza,
    ementa,
    inteiro_teor,
  });
  return getDoc<ModelosRow>(rsp, "/tabelas/modelos/:id");
}

export async function searchModelos(
  consulta: string,
  natureza: string,
  opts?: CallOptions
): Promise<ModelosRow[]> {
  const rsp = await apiPost<DocsPayload<ModelosRow>>(
    "/tabelas/modelos/search",
    {
      Index_name: "ml-modelos-msmarco",
      Natureza: natureza,
      Search_texto: consulta,
    },
    opts
  );
  return getDocs<ModelosRow>(rsp, "/tabelas/modelos/search");
}

export async function deleteModelos(id: string): Promise<boolean> {
  await apiDelete<unknown>(`/tabelas/modelos/${id}`);
  return true;
}

export async function selectModelo(id: string): Promise<ModelosRow | null> {
  const rsp = await apiGet<DocsPayload<ModelosRow>>(`/tabelas/modelos/${id}`);
  return getDoc<ModelosRow>(rsp, "/tabelas/modelos/:id");
}

// ======================= RAG =======================

export async function insertRAG(
  id_ctxt: string,
  id_pje: string,
  classe: string,
  assunto: string,
  natureza: string,
  tipo: string,
  tema: string,
  fonte: string,
  texto: string
): Promise<InsertResult<BaseRow>> {
  const body: BodyBaseInsert = {
    id_ctxt,
    id_pje,
    classe,
    assunto,
    natureza,
    tipo,
    tema,
    fonte,
    texto,
  };

  const rsp = await apiPost<InsertPayload<BaseRow>>("/tabelas/rag", body);
  return normalizeInsertResult<BaseRow>(rsp.data, "/tabelas/rag");
}

export async function updateRAG(
  id: string,
  id_pje: string,
  classe: string,
  assunto: string,
  natureza: string,
  tipo: string,
  tema: string,
  fonte: string,
  texto: string
): Promise<BaseRow | null> {
  // ✅ padrão consistente: envia "texto". Se seu backend exige "data_texto", troque a chave.
  const rsp = await apiPut<DocsPayload<BaseRow>>(`/tabelas/rag/${id}`, {
    id_pje,
    classe,
    assunto,
    natureza,
    tipo,
    tema,
    fonte,
    texto,
  });

  return getDoc<BaseRow>(rsp, "/tabelas/rag/:id");
}

export async function searchRAG(
  consulta: string,
  natureza: string,
  opts?: CallOptions
): Promise<BaseRow[]> {
  const rsp = await apiPost<DocsPayload<BaseRow>>(
    "/tabelas/rag/search",
    {
      Index_name: "ml-rag-msmarco",
      Natureza: natureza,
      Search_texto: consulta,
    },
    opts
  );
  return getDocs<BaseRow>(rsp, "/tabelas/rag/search");
}

export async function deleteRAG(id: string): Promise<boolean> {
  await apiDelete<unknown>(`/tabelas/rag/${id}`);
  return true;
}

export async function selectRAG(id: string): Promise<BaseRow | null> {
  const safeId = String(id ?? "").trim();
  const lower = safeId.toLowerCase();
  if (!safeId || lower === "undefined" || lower === "null") {
    throw new ApiError(
      "ID inválido para consulta do RAG.",
      0,
      "/tabelas/rag/:id"
    );
  }

  const rsp = await apiGet<DocsPayload<BaseRow>>(`/tabelas/rag/${safeId}`);
  return getDoc<BaseRow>(rsp, "/tabelas/rag/:id");
}

// ======================= Eventos =======================

export async function refreshEventos(
  idContexto: string
): Promise<EventosRow[]> {
  if (!idContexto) return [];
  const rsp = await apiGet<RowsPayload<EventosRow>>(
    `/contexto/eventos/all/${idContexto}`
  );
  return getRows<EventosRow>(rsp, "/contexto/eventos/all/:id");
}

export async function selectEvento(idDoc: number): Promise<EventosRow | null> {
  if (!idDoc) throw new ApiError("ID do registro ausente.");
  const rsp = await apiGet<RowsPayload<EventosRow>>(
    `/contexto/eventos/${idDoc}`
  );
  return getRow<EventosRow>(rsp, "/contexto/eventos/:id");
}

export async function insertEvento(
  IdCtxt: string,
  IdNatu: number,
  IdEvento: string,
  Doc: string,
  DocJson: string
): Promise<EventosRow | null> {
  const rsp = await apiPost<RowsPayload<EventosRow>>("/contexto/eventos", {
    id_ctxt: IdCtxt,
    id_natu: IdNatu,
    id_evento: IdEvento,
    doc: Doc,
    doc_json_raw: DocJson,
  });
  return getRow<EventosRow>(rsp, "/contexto/eventos");
}

export async function deleteEvento(id: string): Promise<boolean> {
  await apiDelete<unknown>(`/contexto/eventos/${id}`);
  return true;
}

// ======================= Utilitários =======================

/** 99999 -> "099999" */
export function formatContexto(contexto: string): string {
  return String(contexto).padStart(5, "0");
}

/** Formata CNJ: 9999999-99.9999.9.99.9999 */
export function formatNumeroProcesso(numero: string): string {
  const digits = (numero ?? "").replace(/\D/g, "");
  const numeroStr = digits.slice(-20).padStart(20, "0");
  return `${numeroStr.slice(0, 7)}-${numeroStr.slice(7, 9)}.${numeroStr.slice(
    9,
    13
  )}.${numeroStr.slice(13, 14)}.${numeroStr.slice(14, 16)}.${numeroStr.slice(
    16
  )}`;
}
