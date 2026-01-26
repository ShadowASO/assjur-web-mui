import { type Item } from "./items";

// Constantes para identificação das naturezas de prompts
export const PROMPT_ANALISE_AUTUACAO = 1;
export const PROMPT_ANALISE_CONTEXTO = 2;
export const PROMPT_ANALISE_JULGAMENTO = 3;
export const PROMPT_ANALISE_DOCUMENTO = 4;
// ----------------
export const PROMPT_ANALISE_ANONIMIZA = 100;
// ------ prompts RAG
export const PROMPT_RAG_IDENTIFICA = 101;
export const PROMPT_RAG_ANALISE = 102;
export const PROMPT_RAG_JULGAMENTO = 103;
export const PROMPT_RAG_DECISAO = 104;
export const PROMPT_RAG_DESPACHO = 105;
export const PROMPT_AUTUACAO_SENTENCA = 300;
export const PROMPT_RAG_COMPLEMENTA_JULGAMENTO = 301;
export const PROMPT_AUTUACAO_CERTIDAO = 302;
export const PROMPT_RAG_OUTROS = 999;

// Lista de naturezas (tipos) de prompts
export const itemsNatureza: Item[] = [
  { key: 0, description: "Selecione a natureza" },
  { key: PROMPT_ANALISE_AUTUACAO, description: "Análise de Autuação" },
  { key: PROMPT_ANALISE_CONTEXTO, description: "Análise de Contexto" },
  { key: PROMPT_ANALISE_JULGAMENTO, description: "Análise de Julgamento" },
  { key: PROMPT_ANALISE_DOCUMENTO, description: "Análise do Documento" },
  { key: PROMPT_ANALISE_ANONIMIZA, description: "Análise de Anonimização" },
  // ------ RAG
  { key: PROMPT_RAG_IDENTIFICA, description: "Identifica finalidade RAG" },
  { key: PROMPT_RAG_ANALISE, description: "Análise Jurídica (RAG)" },
  { key: PROMPT_RAG_JULGAMENTO, description: "Análise de Julgamento (RAG)" },
  { key: PROMPT_RAG_DECISAO, description: "Análise de Decisão (RAG)" },
  { key: PROMPT_RAG_DESPACHO, description: "Análise de Despacho (RAG)" },
  {
    key: PROMPT_AUTUACAO_SENTENCA,
    description: "Autuação de sentença",
  },
  {
    key: PROMPT_RAG_COMPLEMENTA_JULGAMENTO,
    description: "Complementa Julgamento(RAG)",
  },
  {
    key: PROMPT_AUTUACAO_CERTIDAO,
    description: "Autuação de certidão",
  },
  {
    key: PROMPT_RAG_OUTROS,
    description: "Outras naturezas(RAG)",
  },
];

export const itemsClasse: Item[] = [
  { key: 0, description: "Selecione a classe" },
  { key: 1, description: "Procedimento comum cível" },
  { key: 1000, description: "Outros" },
];

export const itemsAssunto: Item[] = [
  { key: 0, description: "Selecione o assunto" },
  { key: 1, description: "Contratos de consumo" },
  { key: 1000, description: "Outros" },
];

// Função utilitária genérica
function getItemDescription(items: Item[], key: number): string {
  const item = items.find((i) => i.key === key);
  //console.log(key);
  return item ? item.description : "Item não encontrado";
}

export function getClasseName(key: number): string {
  return getItemDescription(itemsClasse, key);
}

export function getAssuntoName(key: number): string {
  return getItemDescription(itemsAssunto, key);
}
