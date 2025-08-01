/**
 *  tools.jsx
 *
 * Rotinas genéricas e de uso global ficam concentradas neste módulo.
 *
 *
 * */

import { BASE_API_URL, getApiObjeto } from "./ApiCliente";
import type { StandardBodyResponse } from "./ApiCliente";
import type {
  AutosRow,
  ContextoRow,
  DocsOcrRow,
  ModelosRow,
  PromptsRow,
  UploadFilesRow,
} from "./../../../types/tabelas";
import { TokenStorage } from "./TokenStorage";
import type { MetadadosProcessoCnj } from "../../../types/cnjTypes";

/**
 * Obtém a instância global da Api
 */
const api = getApiObjeto();

/**
 * Formato das respostas das chamadas à API
 */
interface IResponseDataRows<T = unknown> {
  row?: T;
  rows?: T[];
  message?: string;
}

interface IResponseDataDocs<T = unknown> {
  doc?: T;
  docs?: T[];
  message?: string;
}
/**
 * Tratamento centralizado das respostas da API
 * @param rspApi
 * @returns
 */
function parseApiResponseDataRows<T>(rspApi: StandardBodyResponse): T[] | null {
  if (rspApi.ok && rspApi.data) {
    const data = rspApi.data as IResponseDataRows<T>;
    if (data.rows) {
      return data.rows;
    }
  }
  return null;
}
function parseApiResponseDataRow<T>(rspApi: StandardBodyResponse): T | null {
  if (rspApi.ok && rspApi.data) {
    const data = rspApi.data as IResponseDataRows<T>;
    if (data.row) {
      return data.row;
    }
  }
  return null;
}
interface IResponseMetadadosCNJ {
  metadados: MetadadosProcessoCnj;
  message?: string;
}
/**
 * Confirma se o processo informado existe e devolve os metadados do CNJ
 * @param strProcesso
 * @returns
 */
export const searchMetadadosCNJ = async (
  strProcesso: string
): Promise<MetadadosProcessoCnj | null> => {
  try {
    const bodyObj = { numeroProcesso: strProcesso };

    const rsp = await api.post("/cnj/processo", bodyObj);
    if (rsp.ok) {
      const data = rsp.data as IResponseMetadadosCNJ;

      if (data) {
        const metaDados = data.metadados as MetadadosProcessoCnj;

        if (metaDados.hits.total.value !== 0) {
          /** Mensagem de debug */
          console.log("Processo confirmado no CNJ: ", strProcesso);
          return metaDados;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Erro na busca do processo no CNJ!", error);
    throw new Error("Erro na busca do processo no CNJ!");
  }
};
export interface DataTokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
export const getConsumoTokens = async (): Promise<DataTokenUsage> => {
  try {
    const rspApi = await api.get("/sessions/uso");
    const data = rspApi.data as DataTokenUsage;
    return data;
  } catch (error) {
    console.error("Erro ao acessar consumo de tokens:", error);
    throw new Error("Erro ao acessar consumo de tokens.");
  }
};

export const uploadFileToServer = async (idContexto: number, file: File) => {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("idContexto", idContexto.toString());
    formData.append("filename_ori", file.name);

    try {
      /** O formato de arquivo é muito importante, pois só funciona com o
       * formato 'multipart/form-data'
       */
      await fetch(BASE_API_URL + "/contexto/documentos/upload", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + TokenStorage.accessToken,
        },
        body: formData,
      });
    } catch (error) {
      console.error(error);
    }
  }
};

export const refreshUploadFiles = async (
  newContexto: string
): Promise<UploadFilesRow[] | null> => {
  if (newContexto === "") {
    throw new Error("ID do contexto ausente.");
  }

  try {
    const rspApi = await api.get(`/contexto/documentos/upload/${newContexto}`);

    const rows = parseApiResponseDataRows<UploadFilesRow>(rspApi);
    if (rows) {
      return rows;
    }
    return null;
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    throw new Error("Erro ao acessar a API.");
  }
};

export const deleteUploadFileById = async (IdReg: number): Promise<boolean> => {
  try {
    const rspApi = await api.delete(
      `/contexto/documentos/upload/${String(IdReg)}`
    );

    if (rspApi.ok) {
      return true;
    } else {
      throw new Error(`Erro ao deletar registro: ID ${IdReg}`);
    }
  } catch (error) {
    throw new Error(
      (error as { message?: string }).message || "Erro ao deletar registros."
    );
  }
};

export const extracDocumentWithOCR = async (
  idCtxt: number,
  idDoc: number
): Promise<boolean> => {
  const objBody: {
    IdContexto: number;
    IdFile: number;
  }[] = [];

  const obj = {
    IdContexto: idCtxt,
    IdFile: idDoc,
  };

  objBody.push(obj);
  try {
    await api.post("/contexto/documentos", objBody);
    return true;
  } catch (error) {
    console.error("Erro ao extrair documento com OCR: " + error);
    throw new Error("Erro ao extrair documento com OCR: ");
  }
};

export const extracWithOCRByContexto = async (
  idContexto: number
): Promise<boolean> => {
  try {
    const rspApi = await api.post(`/contexto/documentos/${String(idContexto)}`);
    //console.log(rspApi);
    if (rspApi.ok) {
      return true;
    }
  } catch (error) {
    console.error("Erro ao extrair documento com OCR: " + error);
    throw new Error("Erro ao extrair documento com OCR: ");
  }
  return false;
};
/**
 * Juntada de todos os docuemntos da tabela Autos_temp na tabela Autos
 * @param idContexto
 * @returns
 */
export const SanearByContexto = async (
  idContexto: number
): Promise<boolean> => {
  try {
    const rspApi = await api.post(
      `/contexto/documentos/saneador/${String(idContexto)}`
    );
    //console.log(rspApi);
    if (rspApi.ok) {
      return true;
    }
  } catch (error) {
    console.error("Erro ao extrair documento com OCR: " + error);
    throw new Error("Erro ao extrair documento com OCR: ");
  }
  return false;
};

export const refreshOcrByContexto = async (
  idContexto: number
): Promise<DocsOcrRow[] | null> => {
  if (idContexto === 0) {
    throw new Error("ID do registro ausente.");
  }
  try {
    const rspApi = await api.get(
      `/contexto/documentos/all/${String(idContexto)}`
    );

    const rows = parseApiResponseDataRows<DocsOcrRow>(rspApi);
    if (rows) {
      return rows;
    }
    return null;
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    throw new Error("Erro ao acessar a API.");
  }
};

export const deleteOcrdocByIdDoc = async (IdDoc: string): Promise<boolean> => {
  try {
    const rspApi = await api.delete(`/contexto/documentos/${String(IdDoc)}`);

    if (rspApi.ok) {
      return true;
    } else {
      throw new Error(`Erro ao deletar registro: ID ${IdDoc}`);
    }
  } catch (error) {
    throw new Error(
      (error as { message?: string }).message || "Erro ao deletar registros."
    );
  }
};

export const selectAutosTemp = async (
  idDoc: number
): Promise<DocsOcrRow | null> => {
  if (idDoc === 0) {
    throw new Error("ID do registro ausente.");
  }
  try {
    const rspApi = await api.get(`/contexto/documentos/${String(idDoc)}`);
    const row = parseApiResponseDataRow<DocsOcrRow>(rspApi);
    if (row) {
      return row;
    }
    return null;
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    throw new Error("Erro ao acessar a API.");
  }
};
/**
 * Juntada dos documentos de forma individualizada
 * @param fileAutuar
 * @returns
 */
export interface DataAutuaDocumento {
  extractedFiles: string[];
  extractedErros: string[];
  message: string;
}
export const autuarDocumentos = async (
  fileAutuar: {
    IdContexto: number;
    IdDoc: string;
  }[]
): Promise<DataAutuaDocumento | null> => {
  try {
    if (fileAutuar.length > 0) {
      const rspApi = await api.post("/contexto/documentos/autua", fileAutuar);
      const data = rspApi.data as DataAutuaDocumento;
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro ao autuar o documento:", error);
    throw new Error("Erro ao autuar o documentos.");
  }
};

export const refreshAutos = async (idContexto: number) => {
  const regs: AutosRow[] = [];
  if (idContexto === 0) {
    return regs;
  }
  try {
    const rspApi = await api.get(`/contexto/autos/all/${String(idContexto)}`);
    //console.log(rspApi);

    return parseApiResponseDataRows<AutosRow>(rspApi);
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Erro ao acessar a API:", error);
    throw error;
  }
};
/**
 * Seleciona uma peça dos autos pelo id
 * @param idDoc
 * @returns
 */
export const selectAutos = async (idDoc: number): Promise<AutosRow | null> => {
  if (idDoc === 0) {
    throw new Error("ID do registro ausente.");
  }
  try {
    const rspApi = await api.get(`/contexto/autos/${String(idDoc)}`);

    const row = parseApiResponseDataRow<AutosRow>(rspApi);
    if (row) {
      return row;
    }
    return null;
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    throw new Error("Erro ao acessar a API.");
  }
};

export const insertDocumentoAutos = async (
  IdCtxt: number,
  IdNatu: number,
  IdPje: string,
  Doc: string,
  DocJson: string
): Promise<AutosRow | null> => {
  try {
    const doc = {
      id_ctxt: IdCtxt,
      id_natu: IdNatu,
      id_pje: IdPje,
      doc: Doc,
      doc_json: DocJson,
    };
    const rspApi = await api.post(`/contexto/autos`, doc);

    const row = parseApiResponseDataRow<AutosRow>(rspApi);
    if (row) {
      return row;
    }
    return null;
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    throw new Error("Erro ao acessar a API.");
  }
};

/**
 * Deleta uma peça dos autos pelo idDoc
 * @param idDoc
 * @returns
 */
export const deleteAutos = async (
  id: string
): Promise<StandardBodyResponse | null> => {
  if (id.length === 0) {
    return null;
  }
  try {
    const rspApi = await api.delete(`/contexto/autos/${id}`);

    if (rspApi.ok) {
      return rspApi;
    }
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("erro ao acessa a API:", error);
  }
  return null;
};
/**
 * Cria um novo contexto
 * @param nrProcesso
 * @param juizo
 * @param classe
 * @param assunto
 * @returns
 */
export const insertContexto = async (
  //metadadosCnj: MetadadosProcessoCnj
  nrProcesso: string,
  juizo: string,
  classe: string,
  assunto: string
): Promise<ContextoRow | null> => {
  try {
    const rspApi = await api.post("/contexto", {
      NrProc: nrProcesso,
      Juizo: juizo,
      Classe: classe,
      Assunto: assunto,
    });

    const row = parseApiResponseDataRow<ContextoRow>(rspApi);
    if (row) {
      return row;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar metadados no CNJ", error);
    throw new Error("Erro ao buscar metadados no CNJ");
  }
};

export const getContexto = async (
  strProcesso: string
): Promise<ContextoRow | null> => {
  try {
    const rspApi = await api.get(`/contexto/processo/${strProcesso}`);

    const row = parseApiResponseDataRow<ContextoRow>(rspApi);
    if (row) {
      return row;
    }
    return null;
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    throw new Error("Erro ao acessar a API.");
  }
};

export const getContextoById = async (
  idCtxt: string
): Promise<ContextoRow | null> => {
  try {
    const rspApi = await api.get(`/contexto/${idCtxt}`);

    const row = parseApiResponseDataRow<ContextoRow>(rspApi);
    if (row) {
      return row;
    }
    return null;
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    throw new Error("Erro ao acessar a API.");
  }
};

export const refreshContextos = async (): Promise<ContextoRow[] | null> => {
  try {
    const rspApi = await api.get("/contexto");

    const rows = parseApiResponseDataRows<ContextoRow>(rspApi);
    if (rows) {
      return rows;
    }
    return null;
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    throw new Error("Erro ao acessar a API.");
  }
};
/**
 * Aparentemente a API não foi implementada ainda
 
 */
export const deleteContexto = async (IdDoc: string): Promise<boolean> => {
  try {
    const rspApi = await api.delete(`/contexto/${IdDoc}`, {});

    if (rspApi.ok) {
      return rspApi.ok;
    } else {
      console.error(`Contexto Id: ${IdDoc} não foi deletado!`);
    }
  } catch (error) {
    console.error("Erro ao deletar o registro: " + error);
    throw new Error("Erro ao deletar o registro:.");
  }
  return false;
};

//PromptRow
export const updatePrompt = async (
  idPrompt: number,
  nmDesc: string,
  txtPrompt: string
): Promise<PromptsRow | null> => {
  const prompt = {
    id_prompt: idPrompt,
    nm_desc: nmDesc,
    txt_prompt: txtPrompt,
  };
  try {
    const rspApi = await api.put("/tabelas/prompts", prompt);

    const row = parseApiResponseDataRow<PromptsRow>(rspApi);
    if (row) {
      return row;
    }
    return null;
  } catch (error) {
    console.error("Erro ao alterar o prompt: " + error);
  }
  throw new Error("Erro não identificado.");
};

export const deletePrompt = async (idPrompt: number): Promise<boolean> => {
  try {
    const rspApi = await api.delete(`/tabelas/prompts/${String(idPrompt)}`);
    return rspApi.ok ? rspApi.ok : false;
  } catch (error) {
    console.error("Erro ao deletar o prompt: " + error);
    throw new Error("Erro ao deletar o registro: ");
  }
};

export const refreshPrompts = async (): Promise<PromptsRow[] | null> => {
  try {
    const rspApi = await api.get("/tabelas/prompts");

    const rows = parseApiResponseDataRows<PromptsRow>(rspApi);
    if (rows) {
      return rows;
    }
    return null;
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Error accessing the API:", error);
    throw new Error("Failed to fetch prompts from the API");
  }
  throw new Error("Erro não identificado.");
};

export const selectPrompt = async (
  idPrompt: number
): Promise<PromptsRow | null> => {
  try {
    const rspApi = await api.get(`/tabelas/prompts/${String(idPrompt)}`);

    const row = parseApiResponseDataRow<PromptsRow>(rspApi);
    if (row) {
      return row;
    }
    return null;
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Error accessing the API:", error);
    throw new Error("Failed to fetch prompts from the API");
  }
  throw new Error("Erro não identificado.");
};
//PromptRow
export const insertPrompt = async (
  idNat: number,
  idDoc: number,
  idClasse: number,
  idAssunto: number,
  nmDesc: string,
  txtPrompt: string
): Promise<PromptsRow | null> => {
  const prompt = {
    id_nat: idNat,
    id_doc: idDoc,
    id_classe: idClasse,
    id_assunto: idAssunto,
    nm_desc: nmDesc,
    txt_prompt: txtPrompt,
  };
  try {
    const rspApi = await api.post("/tabelas/prompts", prompt);

    if (rspApi.ok) {
      const data = rspApi.data as IResponseDataRows<PromptsRow>;
      return data.row || null;
    }
  } catch (error) {
    console.error("Erro ao inserir o prompt: " + error);
    throw new Error("Erro ao inserir o registro: ");
  }
  return null;
};
// // ** Modelos rows
interface ResponseModelosInsert {
  id: string;
  message: string;
}
export const insertModelos = async (
  Natureza: string,
  Ementa: string,
  Inteiro_teor: string
): Promise<ResponseModelosInsert | null> => {
  const modelos = {
    natureza: Natureza,
    ementa: Ementa,
    inteiro_teor: Inteiro_teor,
  };
  try {
    const rspApi = await api.post("/tabelas/modelos", modelos);

    if (rspApi.ok && rspApi.data) {
      const data = rspApi.data as ResponseModelosInsert;
      //console.log(data);
      return data;
    }
  } catch (error) {
    console.error("Erro ao inserir o modelo: " + error);
  }
  return null;
};

export const updateModelos = async (
  Id: string,
  Natureza: string,
  Ementa: string,
  Inteiro_teor: string
): Promise<ModelosRow | null> => {
  const modelos = {
    natureza: Natureza,
    ementa: Ementa,
    inteiro_teor: Inteiro_teor,
  };
  try {
    const rspApi = await api.put(`/tabelas/modelos/${Id}`, modelos);

    if (rspApi.ok) {
      const data = rspApi.data as IResponseDataDocs<ModelosRow>;
      return data.doc || null;
    }
  } catch (error) {
    console.error("Erro ao alterar o modelo: " + error);
  }
  return null;
};

export const searchModelos = async (
  consulta: string,
  natureza: string
): Promise<ModelosRow[] | null> => {
  try {
    const bodyObj = {
      Index_name: "ml-modelos-msmarco",
      Natureza: natureza,
      Search_texto: consulta,
    };

    const rspApi = await api.post("/tabelas/modelos/search", bodyObj);

    if (rspApi.ok) {
      const data = rspApi.data as IResponseDataDocs<ModelosRow>;

      if (data.docs && data.docs.length > 0) {
        return data.docs;
      } else {
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar modelos:", error);
    // Lança o erro para ser tratado por quem chamou
    throw error instanceof Error
      ? error
      : new Error("Erro inesperado ao buscar modelos");
  }
};

export const deleteModelos = async (IdDoc: string): Promise<boolean> => {
  try {
    const rspApi = await api.delete(`/tabelas/modelos/${IdDoc}`, {});

    if (rspApi.ok) {
      return rspApi.ok;
    } else {
      console.error(`Modelo Id: ${IdDoc} não foi deletado!`);
      throw new Error("Erro ao deletar registro.");
    }
  } catch (error) {
    console.error("Erro ao deletar o modelo: " + error);
    throw new Error(
      (error as { message: string }).message || "Erro ao deletar registros."
    );
  }
  return false;
};
/**
 * DEvolve um documento pelo id
 * @param idDoc
 * @returns
 */
export const selectModelo = async (
  idDoc: string
): Promise<ModelosRow | null> => {
  try {
    const rspApi = await api.get(`/tabelas/modelos/${idDoc}`);
    if (rspApi.ok && rspApi.data) {
      const data = rspApi.data as IResponseDataDocs<ModelosRow>;
      return data.doc || null;
    }
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Error accessing the API:", error);
    throw new Error("Failed to fetch prompts from the API");
  }
  return null;
};

/**
 *
 * @param contexto Formata o número de contexto como segue: 99999
 * @returns
 */
export function formatContexto(contexto: number) {
  return String(contexto).padStart(5, "0");
}
/**
 * Formata o número do processo: 9999999-99.9999.9.99.9999
 * @param numero
 * @returns
 */
export function formatNumeroProcesso(numero: string) {
  // Garante que a string tenha no máximo 20 caracteres
  let numeroStr = String(numero).slice(-20);

  // Preenche com zeros à esquerda se tiver menos de 20 caracteres
  numeroStr = numeroStr.padStart(20, "0");

  // Aplica a formatação
  return `${numeroStr.slice(0, 7)}-${numeroStr.slice(7, 9)}.${numeroStr.slice(
    9,
    13
  )}.${numeroStr.slice(13, 14)}.${numeroStr.slice(14, 16)}.${numeroStr.slice(
    16
  )}`;
}
