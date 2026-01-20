export interface BaseRow {
  id: string;

  id_ctxt?: string;
  id_pje?: string;
  hash_texto?: string;
  username_inc?: string;

  /**
   * Data de inclusão.
   * Normalmente vem da API como ISO-8601 string.
   * Ex.: "2025-10-05T14:32:10Z"
   */
  dt_inc?: string | Date;

  /**
   * Status lógico do registro
   * Ex.: "S", "N", "A"
   */
  status?: string;

  classe?: string;
  assunto?: string;
  natureza?: string;
  tipo?: string;
  tema?: string;

  fonte?: string;

  /**
   * Conteúdo textual do documento / chunk
   */
  texto?: string;

  /**
   * Vetor de embeddings (knn_vector – dimensão 3072)
   */
  //texto_embedding?: number[];
}

// Tipo que representa o corpo esperado pelo backend
export interface BodyBaseInsert {
  id_ctxt: string;
  id_pje: string;
  classe: string;
  assunto: string;
  natureza: string;
  tipo: string;
  tema: string;
  fonte: string;
  texto: string;
  //data_embedding: number[]; // float32[] em Go → number[] em JS
}
