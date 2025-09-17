// export const RESPOSTA_RAG_CHAT = 1;
// export const RESPOSTA_RAG_ANALISE = 2000;
// export const RESPOSTA_RAG_SENTENCA = 2001;

// export const RAG_EVENTO_ANALISE = 102;
// export const RAG_EVENTO_SENTENCA = 103;
// export const RAG_EVENTO_DECISAO = 104;
// export const RAG_EVENTO_DESPACHO = 105;
// export const RAG_EVENTO_OUTROS = 999;

export const RAG_RESPONSE_ANALISE = 201;
export const RAG_RESPONSE_SENTENCA = 202;
export const RAG_RESPONSE_DECISAO = 203;
export const RAG_RESPONSE_DESPACHO = 204;
export const RAG_RESPONSE_COMPLEMENTO = 301;
export const RAG_RESPONSE_OUTROS = 999;

export type RespostaRAG = {
  tipo_resp: number;
  texto: string;
};

// // Item com múltiplas descrições (sinônimos)
export interface itemRespostaRAG {
  TipoResp: number;
  Texto: string;
}
export const itemsResposta: itemRespostaRAG[] = [
  { TipoResp: RAG_RESPONSE_ANALISE, Texto: "Análise jurídica" },
  { TipoResp: RAG_RESPONSE_SENTENCA, Texto: "Minuta de sentença" },
  { TipoResp: RAG_RESPONSE_DECISAO, Texto: "Minuta de decisão" },
  { TipoResp: RAG_RESPONSE_DESPACHO, Texto: "Minuta de despacho" },
  { TipoResp: RAG_RESPONSE_COMPLEMENTO, Texto: "Complemento solicitado" },
  { TipoResp: RAG_RESPONSE_OUTROS, Texto: "Outros" },
];

// Função utilitária genérica
function getItemRespostaDescription(
  items: itemRespostaRAG[],
  key: number
): string {
  const item = items.find((i) => i.TipoResp === key);
  //console.log(key);
  return item ? item.Texto : "Item não encontrado";
}

// Funções específicas
export function getRespostaDescricao(key: number): string {
  //console.log(key);
  return getItemRespostaDescription(itemsResposta, key);
}
