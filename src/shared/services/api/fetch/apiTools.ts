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
function parseApiResponseDataRows<T>(
  rspApi: StandardBodyResponse
): T[] | Error {
  if (rspApi.ok && rspApi.data) {
    const data = rspApi.data as IResponseDataRows<T>;
    return data.rows || new Error("Erro ao fazer parse do Response.");
  }
  return new Error("Erro ao fazer parse do Response.");
}
function parseApiResponseDataRow<T>(rspApi: StandardBodyResponse): T | Error {
  if (rspApi.ok && rspApi.data) {
    const data = rspApi.data as IResponseDataRows<T>;
    return data.row || new Error("Erro ao fazer parse do Response.");
  }
  return new Error("Erro ao fazer parse do Response.");
}

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
): Promise<UploadFilesRow[] | Error> => {
  // Validação inicial do contexto --
  if (newContexto === "") {
    return new Error("ID do contexto ausente.");
  }

  try {
    // Faz a chamada à API
    const rspApi = await api.get(`/contexto/documentos/upload/${newContexto}`);
    return parseApiResponseDataRows<UploadFilesRow>(rspApi);
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Erro ao acessar a API:", error);
    throw error;
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
export const refreshOcrByContexto = async (
  idContexto: number
): Promise<DocsOcrRow[] | Error> => {
  if (idContexto === 0) {
    return new Error("ID do registro ausente.");
  }
  try {
    const rspApi = await api.get(
      `/contexto/documentos/all/${String(idContexto)}`
    );
    return parseApiResponseDataRows<DocsOcrRow>(rspApi);
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Erro ao acessar a API:", error);
    return new Error(
      (error as { message: string }).message ||
        "Erro ao selecionar os registros."
    );
  }
  return new Error("Erro não identificado.");
};

export const deleteOcrdocByIdDoc = async (IdDoc: number): Promise<boolean> => {
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
): Promise<DocsOcrRow | Error> => {
  if (idDoc === 0) {
    return new Error("ID do registro ausente.");
  }
  try {
    const rspApi = await api.get(`/contexto/documentos/${String(idDoc)}`);
    return parseApiResponseDataRow<DocsOcrRow>(rspApi);
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Erro ao acessar a API:", error);
    return new Error(
      (error as { message: string }).message ||
        "Erro ao selecionar os registros."
    );
  }
  return new Error("Erro não identificado.");
};

export const autuarDocumentos = async (
  fileAutuar: {
    IdContexto: number;
    IdDoc: number;
  }[]
) => {
  if (fileAutuar.length > 0) {
    await api.post("/contexto/documentos/analise", fileAutuar);
  }
};

export const refreshAutos = async (idContexto: number) => {
  const regs: AutosRow[] = [];
  if (idContexto === 0) {
    return regs;
  }
  try {
    const rspApi = await api.get(`/contexto/autos/all/${String(idContexto)}`);
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
export const selectAutos = async (idDoc: number): Promise<AutosRow | Error> => {
  if (idDoc === 0) {
    return new Error("ID do registro ausente.");
  }
  try {
    const rspApi = await api.get(`/contexto/autos/${String(idDoc)}`);
    return parseApiResponseDataRow<AutosRow>(rspApi);
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("erro ao acessa a API:", error);
    return new Error(
      (error as { message: string }).message ||
        "Erro ao selecionar os registros."
    );
  }
  return new Error("Erro não identificado.");
};

/**
 * Deleta uma peça dos autos pelo idDoc
 * @param idDoc
 * @returns
 */
export const deleteAutos = async (
  idAutos: number
): Promise<StandardBodyResponse | null> => {
  if (idAutos === 0) {
    return null;
  }
  try {
    const rspApi = await api.delete(`/contexto/autos/${String(idAutos)}`);

    if (rspApi.ok) {
      return rspApi;
    }
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("erro ao acessa a API:", error);
  }
  return null;
};

export const getContexto = async (
  strProcesso: string
): Promise<ContextoRow | Error> => {
  try {
    const rspApi = await api.get(`/contexto/processo/${strProcesso}`);
    return parseApiResponseDataRow<ContextoRow>(rspApi);
  } catch (error) {
    console.error("Erro", error);
  }
  return new Error("Erro não identificado.");
};

export const refreshContextos = async (): Promise<ContextoRow[] | Error> => {
  try {
    const rspApi = await api.get("/contexto");
    return parseApiResponseDataRows<ContextoRow>(rspApi);
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Error accessing the API:", error);
    //throw new Error("Failed to fetch contextos from the API");
    return new Error(
      (error as { message: string }).message ||
        "Erro ao selecionar os registros."
    );
  }
};
/**
 * Aparentemente a API não foi implementada ainda
 
 */
export const deleteContexto = async (
  IdDoc: string
): Promise<boolean | Error> => {
  try {
    const rspApi = await api.delete(`/contexto/${IdDoc}`, {});

    if (rspApi.ok) {
      return rspApi.ok;
    } else {
      console.error(`Contexto Id: ${IdDoc} não foi deletado!`);
    }
  } catch (error) {
    console.error("Erro ao deletar o registro: " + error);
    return new Error(
      (error as { message: string }).message || "Erro ao deletar o registro."
    );
  }
  return false;
};

//PromptRow
export const updatePrompt = async (
  idPrompt: number,
  nmDesc: string,
  txtPrompt: string
): Promise<PromptsRow | Error> => {
  const prompt = {
    IdPrompt: idPrompt,
    NmDesc: nmDesc,
    TxtPrompt: txtPrompt,
  };
  try {
    console.log("prompt=", idPrompt);

    const rspApi = await api.put("/tabelas/prompts", prompt);
    return parseApiResponseDataRow<PromptsRow>(rspApi);
  } catch (error) {
    console.error("Erro ao alterar o prompt: " + error);
  }
  return new Error("Erro não identificado.");
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

export const refreshPrompts = async (): Promise<PromptsRow[] | Error> => {
  try {
    const rspApi = await api.get("/tabelas/prompts");
    return parseApiResponseDataRows<PromptsRow>(rspApi);
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Error accessing the API:", error);
    throw new Error("Failed to fetch prompts from the API");
  }
  return new Error("Erro não identificado.");
};

export const selectPrompt = async (
  idPrompt: number
): Promise<PromptsRow | Error> => {
  try {
    const rspApi = await api.get(`/tabelas/prompts/${String(idPrompt)}`);
    return parseApiResponseDataRow<PromptsRow>(rspApi);
  } catch (error) {
    // Lida com erros da chamada à API
    console.error("Error accessing the API:", error);
    throw new Error("Failed to fetch prompts from the API");
  }
  return new Error("Erro não identificado.");
};
// // ** Modelos rows

export const insertModelos = async (
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
    const rspApi = await api.post("/tabelas/modelos", modelos);

    if (rspApi.ok) {
      const data = rspApi.data as IResponseDataDocs<ModelosRow>;
      return data.doc || null;
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
    //console.log(modelos);
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
): Promise<ModelosRow[] | Error> => {
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
        new Error("Nenhum valor retornado");
      }
    }
    return new Error(rspApi.error?.message);
  } catch (error) {
    console.error("Erro ao buscar modelos:", error);
    // Lança o erro para ser tratado por quem chamou
    throw error instanceof Error
      ? error
      : new Error("Erro inesperado ao buscar modelos");
  }
};

export const deleteModelos = async (
  IdDoc: string
): Promise<boolean | Error> => {
  try {
    const rspApi = await api.delete(`/tabelas/modelos/${IdDoc}`, {});

    if (rspApi.ok) {
      return rspApi.ok;
    } else {
      console.error(`Modelo Id: ${IdDoc} não foi deletado!`);
      return new Error("Erro ao deletar registro.");
    }
  } catch (error) {
    //console.error("Erro ao deletar o modelo: " + error);
    return new Error(
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
