export type BaseRow = {
  id: string;
  id_pje?: string;
  classe?: string;
  assunto?: string;
  natureza?: string;
  tipo?: string;
  tema?: string;
  fonte?: string;
  data_texto?: string;
};

// Tipo que representa o corpo esperado pelo backend
export interface BodyBaseInsert {
  id_pje: string;
  classe: string;
  assunto: string;
  natureza: string;
  tipo: string;
  tema: string;
  fonte: string;
  data_texto: string;
  //data_embedding: number[]; // float32[] em Go → number[] em JS
}
