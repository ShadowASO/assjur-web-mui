import { type Item } from "./items";

export const NATU_DOC_INICIAL = 1;
export const NATU_DOC_CONTESTACAO = 2;
export const NATU_DOC_REPLICA = 3;
export const NATU_DOC_DESPACHO = 4;
export const NATU_DOC_PETICAO = 5;
export const NATU_DOC_DECISAO = 6;
export const NATU_DOC_SENTENCA = 7;
export const NATU_DOC_EMBARGOS = 8;
export const NATU_DOC_APELACAO = 9;
export const NATU_DOC_CONTRA_RAZOES = 10;
export const NATU_DOC_PROCURACAO = 11;
export const NATU_DOC_ROL_TESTEMUNHAS = 12;
export const NATU_DOC_CONTRATO = 13;
export const NATU_DOC_LAUDO_PERICIAL = 14;
export const NATU_DOC_TERMO_AUDIENCIA = 15;
export const NATU_DOC_PARECER_MP = 16;
export const NATU_DOC_AUTOS = 1000;
export const NATU_DOC_OUTROS = 1001;
export const NATU_DOC_CERTIDOES = 1002;
export const NATU_DOC_MOVIMENTACAO = 1003;
export const NATU_DOC_IA_ANALISE = 2000;
export const NATU_DOC_IA_SENTENCA = 2001;

export const itemsDocumento: Item[] = [
  { key: 0, description: "Selecione o documento" },
  { key: NATU_DOC_INICIAL, description: "Petição inicial" },
  { key: NATU_DOC_CONTESTACAO, description: "Contestação" },
  { key: NATU_DOC_REPLICA, description: "Réplica" },
  { key: NATU_DOC_DESPACHO, description: "Despacho" },
  { key: NATU_DOC_PETICAO, description: "Petição" },
  { key: NATU_DOC_DECISAO, description: "Decisão" },
  { key: NATU_DOC_SENTENCA, description: "Sentença" },
  { key: NATU_DOC_EMBARGOS, description: "Embargos de declaração" },
  { key: NATU_DOC_APELACAO, description: "Recurso de Apelação" },
  { key: NATU_DOC_CONTRA_RAZOES, description: "Contra-razões" },
  { key: NATU_DOC_PROCURACAO, description: "Procuração" },
  { key: NATU_DOC_ROL_TESTEMUNHAS, description: "Rol de Testemunhas" },
  { key: NATU_DOC_CONTRATO, description: "Contrato" },
  { key: NATU_DOC_LAUDO_PERICIAL, description: "Laudo Pericial" },
  { key: NATU_DOC_TERMO_AUDIENCIA, description: "Termo de Audiência" },
  {
    key: NATU_DOC_PARECER_MP,
    description: "Manifestação do Ministério Público",
  },
  { key: NATU_DOC_AUTOS, description: "Autos Processuais" },

  { key: NATU_DOC_IA_ANALISE, description: "Análise por IA" },
  { key: NATU_DOC_IA_SENTENCA, description: "Sentença por IA" },
];

// Função utilitária genérica
function getItemDescription(items: Item[], key: number): string {
  const item = items.find((i) => i.key === key);
  //console.log(key);
  return item ? item.description : "Item não encontrado";
}

// Funções específicas
export function getDocumentoName(key: number): string {
  //console.log(key);
  return getItemDescription(itemsDocumento, key);
}
