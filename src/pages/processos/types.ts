export interface AnaliseJuridica {
  tipo: {
    evento: number;
    descricao: string;
  };

  identificacao: {
    numero_processo: string;
    natureza: string;
  };

  partes: TPartes;

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

  /**
   * Campo RAG — Tópicos jurídicos relevantes extraídos das peças processuais
   * Utilizado como base para consultas semânticas posteriores (RAG)
   */
  // rag: {
  //   tema: string;
  //   descricao: string;
  //   relevancia: "alta" | "média" | "baixa" | string;
  // }[];
  rag: TRag[];

  /**
   * Campo opcional — Vetor de embeddings numéricos gerados a partir dos temas do campo `rag`
   * Compatível com o índice OpenSearch `rag_doc_embedding`
   */
  rag_embedding: number[];
}

export interface TRag {
  tema: string;
  descricao: string;
  relevancia: "alta" | "média" | "baixa" | string;
}

//Sentença IA
export interface SentencaIA {
  tipo?: Tipo;
  processo?: Processo;
  partes?: TPartes;
  relatorio?: string[];
  fundamentacao?: Fundamentacao;
  dispositivo?: Dispositivo;
  observacoes?: string[];
  assinatura?: Assinatura;
}

export interface Tipo {
  codigo?: number;
  descricao?: string;
}

export interface Processo {
  numero?: string;
  classe?: string;
  assunto?: string;
}

export interface TPartes {
  autor?: string[];
  reu?: string[];
}

export interface Fundamentacao {
  preliminares?: string[];
  merito?: string[];
  doutrina?: string[];
  jurisprudencia?: Jurisprudencia;
}

export interface Jurisprudencia {
  sumulas?: string[];
  acordaos?: Acordao[];
}

export interface Acordao {
  tribunal?: string;
  processo?: string;
  ementa?: string;
  relator?: string;
  data?: string;
}

export interface Dispositivo {
  decisao?: string;
  condenacoes?: string[];
  honorarios?: string;
  custas?: string;
}

export interface Assinatura {
  juiz?: string;
  cargo?: string;
}

//SentencaAutos
export interface SentencaAutos {
  tipo?: {
    key: number;
    description: string;
  };

  processo: string;
  id_pje: string;
  metadados?: Metadados;

  questoes: Questao[];
  dispositivo: Dispositivo;
}

export interface Metadados {
  classe: string;
  assunto: string;
  juizo: string;
  partes?: TPartes;
}

// export interface Partes {
//   autor: string;
//   reu: string;
// }

export interface Questao {
  tipo: string; // "preliminar" ou "mérito"
  tema: string;
  paragrafos: string[];
  decisao: string;
}

export interface Dispositivo {
  paragrafos: string[];
}
