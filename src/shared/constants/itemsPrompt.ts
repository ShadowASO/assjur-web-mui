// export interface Item {
// 	key: number;
// 	description: string;
// }

import { type Item } from "./items";

export const itemsNatureza: Item[] = [
  { key: 0, description: "Selecione a natureza" },
  { key: 1, description: "Análise de documento" },
  { key: 2, description: "Análise de Contexto" },
  { key: 3, description: "Análise da Inicial" },
  { key: 4, description: "Análise do Saneador" },
  { key: 5, description: "Análise de Tutela" },
  { key: 6, description: "Análise de Julgamento" },
  { key: 100, description: "Mascara Dados Pessoais" },
  { key: 101, description: "Formata Respostas" },
];

export const itemsDocumento: Item[] = [
  { key: 0, description: "Selecione o documento" },
  { key: 1, description: "Petição inicial" },
  { key: 2, description: "Contestação" },
  { key: 3, description: "Réplica" },
  { key: 4, description: "Despacho inicial" },
  { key: 5, description: "Despacho ordinatório" },
  { key: 6, description: "Petição diversa" },
  { key: 7, description: "Decisão interlocutória" },
  { key: 8, description: "Sentença" },
  { key: 9, description: "Embargos de declaração" },
  { key: 10, description: "Contra-razões" },
  { key: 11, description: "Recurso de Apelação" },
  { key: 12, description: "Procuração" },
  { key: 13, description: "Rol de Testemunhas" },
  { key: 14, description: "Contrato" },
  { key: 15, description: "Laudo Pericial" },
  { key: 16, description: "Ata de Audiência" },
  { key: 17, description: "Manifestação do Ministério Público" },
  { key: 1000, description: "Autos Processuais" },
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
  return item ? item.description : "Item não encontrado";
}

// Funções específicas
export function getDocumentoName(key: number): string {
  return getItemDescription(itemsDocumento, key);
}

export function getClasseName(key: number): string {
  return getItemDescription(itemsClasse, key);
}

export function getAssuntoName(key: number): string {
  return getItemDescription(itemsAssunto, key);
}
