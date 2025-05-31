type AutosRow = {
  id_autos: number;
  id_ctxt: number;
  id_nat: number;
  id_pje: string;
  dt_pje: Date;
  autos_json: string;
  dt_inc: Date;
  status: string;
};

type TempAutosRow = {
  id_doc: number;
  id_ctxt: number;
  nm_file_new: string;
  nm_file_ori: string;
  txt_doc: string;
  dt_inc: Date;
  status: string;
};

type UploadFilesRow = {
  id_file: number;
  id_ctxt: number; // ID do contexto (chave estrangeira para a tabela contexto)
  nm_file_new: string;
  nm_file_ori: string;
  sn_autos: string;
  dt_inc: Date; // Data de inclusão do documento
  status: string; // Status do documento (caracter com valor padrão 'S')
};

interface SessionRow {
  session_id: number;
  user_id: number;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

type ContextoRow = {
  id_ctxt: number; // ID do processo
  nr_proc: string; // Número do processo (até 24 caracteres)
  juizo: string;
  classe: string;
  assunto: string;
  prompt_tokens: number;
  completion_tokens: number;
  dt_inc: Date; // Data de inclusão do processo
  status: string;
};

type ModelosRow = {
  id: string;
  natureza: string;
  ementa: string;
  inteiro_teor: string;
};
type PromptsRow = {
  id_prompt: number;
  id_nat: number;
  id_doc: number;
  id_classe: number;
  id_assunto: number;
  nm_desc: string;
  txt_prompt: string;
  dt_inc: Date;
  status: string;
};

export type {
  AutosRow,
  TempAutosRow,
  UploadFilesRow,
  SessionRow,
  ContextoRow,
  ModelosRow,
  PromptsRow,
};
