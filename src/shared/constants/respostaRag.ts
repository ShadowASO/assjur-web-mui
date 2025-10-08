export const RAG_EVENTO_PREANALISE = 200;
export const RAG_EVENTO_ANALISE = 201;
export const RAG_EVENTO_SENTENCA = 202;
export const RAG_EVENTO_DECISAO = 203;
export const RAG_EVENTO_DESPACHO = 204;
//-----  Comp

export const RAG_EVENTO_CONFIRMACAO = 300;
export const RAG_EVENTO_COMPLEMENTO = 301;
export const RAG_EVENTO_ADD_BASE = 302;

export const RAG_EVENTO_OUTROS = 999;

// Representa o tipo identificador do evento jurídico.
export interface TipoEvento {
  evento: number; // Código numérico do evento jurídico
  descricao: string; // Descrição textual do evento
}

// Estrutura base genérica que contém o identificador de tipo.
export interface BaseObjeto {
  tipo: TipoEvento; // Identificador do evento
}
export interface RespostaBaseRAG {
  tipo: TipoEvento; // Identificador do evento
}

export function isRespostaBaseRAG(obj: unknown): obj is RespostaBaseRAG {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "tipo" in obj &&
    typeof (obj as { tipo?: { codigo?: unknown; descricao?: unknown } }).tipo
      ?.codigo === "number" &&
    typeof (obj as { tipo?: { codigo?: unknown; descricao?: unknown } }).tipo
      ?.descricao === "string"
  ) {
    return true;
  }
  return false;
}

//------- ANÁLISE PROCESSUAL

export type AnaliseProcessoRAG = RespostaBaseRAG & {
  tipo: TipoEvento;

  identificacao: {
    numero_processo: string;
    natureza: string;
  };

  partes: {
    autor: {
      nome: string;
      qualificacao: string;
      endereco: string;
    };
    reu: {
      nome: string;
      cnpj: string;
      endereco: string;
    };
  };

  sintese_fatos: {
    autor: string;
    reu: string;
  };

  pedidos_autor: string[];

  defesas_reu: {
    preliminares: string[];
    prejudiciais_merito: string[];
    defesa_merito: string[];
    pedidos_subsidiarios: string[];
  };

  questoes_controvertidas: {
    descricao: string;
    pergunta_ao_usuario: string;
  }[];

  provas: {
    autor: string[];
    reu: string[];
  };

  fundamentacao_juridica: {
    autor: string[];
    reu: string[];
    jurisprudencia: {
      tribunal: string;
      processo: string;
      tema: string;
      ementa: string;
    }[];
  };

  decisoes_interlocutorias: {
    id_decisao: string;
    conteudo: string;
    magistrado: string;
    fundamentacao: string;
  }[];

  andamento_processual: string[];

  valor_da_causa: string;

  observacoes: string[];
};

//********* SENTENÇA  */

export type SentencaRAG = RespostaBaseRAG & {
  tipo: TipoEvento;

  processo?: {
    numero?: string;
    classe?: string;
    assunto?: string;
  };

  partes?: {
    autor?: string[];
    reu?: string[];
  };

  relatorio?: string[];

  fundamentacao?: {
    preliminares?: string[];
    merito?: string[];
    doutrina?: string[];
    jurisprudencia?: {
      sumulas?: string[];
      acordaos?: {
        tribunal?: string;
        processo?: string;
        ementa?: string;
        relator?: string;
        data?: string;
      }[];
    };
  };

  dispositivo?: {
    decisao?: string;
    condenacoes?: string[];
    honorarios?: string;
    custas?: string;
  };

  observacoes?: string[];

  assinatura?: {
    juiz?: string;
    cargo?: string;
  };
};
//*** FIM SENTENÇA */

// // Item com múltiplas descrições (sinônimos)
export interface itemRespostaRAG {
  TipoResp: number;
  Texto: string;
}
export const itemsResposta: itemRespostaRAG[] = [
  { TipoResp: RAG_EVENTO_ANALISE, Texto: "Análise jurídica" },
  { TipoResp: RAG_EVENTO_SENTENCA, Texto: "Minuta de sentença" },
  { TipoResp: RAG_EVENTO_DECISAO, Texto: "Minuta de decisão" },
  { TipoResp: RAG_EVENTO_DESPACHO, Texto: "Minuta de despacho" },
  { TipoResp: RAG_EVENTO_COMPLEMENTO, Texto: "Complemento solicitado" },
  { TipoResp: RAG_EVENTO_PREANALISE, Texto: "Pré-análise jurídica" },
  { TipoResp: RAG_EVENTO_OUTROS, Texto: "Outros" },
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
