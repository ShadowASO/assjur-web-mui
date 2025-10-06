import { type Item } from "../../shared/constants/items";

export const RAG_NATUREZA_SENTENCA = 1;

export const itemsNatureza: Item[] = [
  { key: 0, description: "Selecione a natureza" },
  { key: 1, description: "Sentença" },
];

// Função utilitária genérica
function getItemDescription(items: Item[], key: number): string {
  const item = items.find((i) => i.key === key);
  //console.log(key);
  return item ? item.description : "Item não encontrado";
}

export function getNaturezaRAG(key: number): string {
  return getItemDescription(itemsNatureza, key);
}

//Classes CNJ

export const CLASSE_CON_COMUM_CIVEL = 7;
export const CLASSE_CON_JUIZADO_CIVEL = 436;
export const CLASSE_CON_JUIZADO_FAZENDA = 14695;
export const CLASSE_ESP_BUSCA_APREENSAO = 81;

export const itemsClasse: Item[] = [
  { key: 0, description: "Selecione a classe" },
  { key: CLASSE_CON_COMUM_CIVEL, description: "Procedimento Comum Cível" },
  {
    key: CLASSE_CON_JUIZADO_CIVEL,
    description: "Procedimento do Juizado Especial CíveL",
  },
  {
    key: CLASSE_CON_JUIZADO_FAZENDA,
    description: "Procedimento do Juizado Especial da Fazenda Pública",
  },
  {
    key: CLASSE_ESP_BUSCA_APREENSAO,
    description: "Busca e Apreensão em Alienação Fiduciária",
  },
];
// Função utilitária genérica
function getClasseDescription(items: Item[], key: number): string {
  const item = items.find((i) => i.key === key);
  //console.log(key);
  return item ? item.description : "Item não encontrado";
}

export function getClasse(key: number): string {
  return getClasseDescription(itemsClasse, key);
}

//------    Assunto CNJ

export const ASSUNTO_CONSUMIDOR_CARTAO_CREDITO = 7772;
export const ASSUNTO_CONSUMIDOR_CONSORCIO = 7619;
export const ASSUNTO_CONSUMIDOR_FORNECIMENTO_AGUA = 7761;
export const ASSUNTO_CONSUMIDOR_FORNECIMENTO_ENERGIA = 7760;
export const ASSUNTO_CONSUMIDOR_SEGURO = 7621;
export const ASSUNTO_CONSUMIDOR_SERV_HOSPITALAR = 7775;
export const ASSUNTO_CONSUMIDOR_SERV_PROFISSIONAL = 7774;

//Contratos de Consumo/Bancários
export const ASSUNTO_CONSUMIDOR_CDC = 14757;
export const ASSUNTO_CONSUMIDOR_CREDITO_ROTATIVO = 14758;
export const ASSUNTO_CONSUMIDOR_EMPRESTIMO_CONSIGNADO = 11806;
export const ASSUNTO_CONSUMIDOR_FRAUDE_BANCARIA = 15546;
export const ASSUNTO_CONSUMIDOR_TARIFAS = 11807;

//Outros
export const ASSUNTO_BUSCA_APREENSAO = 10677;

export const itemsAssunto: Item[] = [
  { key: 0, description: "Selecione o Assunto" },
  { key: ASSUNTO_CONSUMIDOR_CARTAO_CREDITO, description: "Cartão de Crédito" },
  { key: ASSUNTO_CONSUMIDOR_CONSORCIO, description: "Consórcio" },
  {
    key: ASSUNTO_CONSUMIDOR_FORNECIMENTO_AGUA,
    description: "Fornecimento de Água",
  },
  {
    key: ASSUNTO_CONSUMIDOR_FORNECIMENTO_ENERGIA,
    description: "Fornecimento de Energia Elétrica",
  },
  { key: ASSUNTO_CONSUMIDOR_SEGURO, description: "Seguro" },
  {
    key: ASSUNTO_CONSUMIDOR_SERV_HOSPITALAR,
    description: "Serviços Hospitalares",
  },
  {
    key: ASSUNTO_CONSUMIDOR_SERV_PROFISSIONAL,
    description: "Serviços Profissionais",
  },
  {
    key: ASSUNTO_CONSUMIDOR_CDC,
    description: "Crédito Direto ao Consumidor - CDC",
  },
  {
    key: ASSUNTO_CONSUMIDOR_CREDITO_ROTATIVO,
    description: "Crédito Rotativo",
  },
  {
    key: ASSUNTO_CONSUMIDOR_EMPRESTIMO_CONSIGNADO,
    description: "Empréstimo Rotativo",
  },
  { key: ASSUNTO_CONSUMIDOR_FRAUDE_BANCARIA, description: "Fraude Bancária" },
  { key: ASSUNTO_CONSUMIDOR_TARIFAS, description: "Fraude Bancária" },

  { key: ASSUNTO_BUSCA_APREENSAO, description: "Busca e Apreensão" },
];

// Função utilitária genérica
function getAssuntoDescription(items: Item[], key: number): string {
  const item = items.find((i) => i.key === key);
  //console.log(key);
  return item ? item.description : "Item não encontrado";
}

export function getAssunto(key: number): string {
  return getAssuntoDescription(itemsClasse, key);
}
