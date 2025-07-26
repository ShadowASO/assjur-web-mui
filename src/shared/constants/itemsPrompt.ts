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
