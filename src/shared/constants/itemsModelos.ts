import { type Item } from "./items";

export const MODELO_NATUREZA_DESPACHO = 1;
export const MODELO_NATUREZA_DECISAO = 2;
export const MODELO_NATUREZA_SENTENCA = 3;
export const MODELO_NATUREZA_EXPEDIENTE = 4;
export const MODELO_NATUREZA_ACORDAO = 5;
export const MODELO_NATUREZA_SUMULA = 6;
export const MODELO_NATUREZA_CONSTITUICAO = 7;
export const MODELO_NATUREZA_LEI = 8;
export const MODELO_NATUREZA_DECRETO = 9;
export const MODELO_NATUREZA_REGULAMENTO = 10;
export const MODELO_NATUREZA_DOUTRINA = 11;
export const MODELO_NATUREZA_AUDIENCIA = 12;
export const MODELO_NATUREZA_CERTIDOES = 13;

export const itemsNatureza: Item[] = [
  { key: 0, description: "Selecione a natureza" },
  { key: 1, description: "Despacho" },
  { key: 2, description: "Decisão" },
  { key: 3, description: "Sentença" },
  { key: 4, description: "Expediente" },
  { key: 5, description: "Acórdão" },
  { key: 6, description: "Súmula" },
  { key: 7, description: "Constituição" },
  { key: 8, description: "Lei" },
  { key: 9, description: "Decreto" },
  { key: 10, description: "Regulamento" },
  { key: 11, description: "Doutrina" },
  { key: 12, description: "Termo de Audiência" },
  { key: 13, description: "Certidões" },
];

// Função utilitária genérica
function getItemDescription(items: Item[], key: number): string {
  const item = items.find((i) => i.key === key);
  //console.log(key);
  return item ? item.description : "Item não encontrado";
}

export function getNaturezaModelo(key: number): string {
  return getItemDescription(itemsNatureza, key);
}
