export const RESPOSTA_RAG_CHAT = 1;
export const RESPOSTA_RAG_ANALISE = 2000;
export const RESPOSTA_RAG_SENTENCA = 2001;

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
  { TipoResp: RESPOSTA_RAG_CHAT, Texto: "Chat" },
  { TipoResp: RESPOSTA_RAG_ANALISE, Texto: "Análise jurídica" },
  { TipoResp: RESPOSTA_RAG_SENTENCA, Texto: "Sentença" },
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
