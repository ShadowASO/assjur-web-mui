//import { ResponseStatus } from "./responseTypes";

//interface ApiCnjPublicResponse {
interface _ResponseCnjPublicApi {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: Array<{
      _index: string;
      _id: string;
      _score: number;
      _source: {
        numeroProcesso: string;
        classe: {
          codigo: number;
          nome: string;
        };
        sistema: {
          codigo: number;
          nome: string;
        };
        formato: {
          codigo: number;
          nome: string;
        };
        tribunal: string;
        dataHoraUltimaAtualizacao: string;
        grau: string;
        "@timestamp": string;
        dataAjuizamento: string;
        movimentos: Array<{
          complementosTabelados?: Array<{
            codigo: number;
            valor: number;
            nome: string;
            descricao: string;
          }>;
          codigo: number;
          nome: string;
          dataHora: string;
        }>;
        id: string;
        nivelSigilo: number;
        orgaoJulgador: {
          codigoMunicipioIBGE: number;
          codigo: number;
          nome: string;
        };
        assuntos: Array<{
          codigo: number;
          nome: string;
        }>;
      };
    }>;
  };
}

/* Formato a ser inserido no body de consulta a processo no CNJ. */
interface RequestCnjPublicApi {
  query: {
    match: {
      numeroProcesso: string;
    };
  };
}

export interface ProcessoSource {
  numeroProcesso: string;
  classe: CodigoNome;
  sistema: CodigoNome;
  formato: CodigoNome;
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  grau: string;
  "@timestamp": string;
  dataAjuizamento: string;
  movimentos: Movimento[];
  id: string;
  nivelSigilo: number;
  orgaoJulgador: OrgaoJulgador;
  assuntos: CodigoNome[];
}

export interface CodigoNome {
  codigo: number;
  nome: string;
}

export interface Movimento {
  codigo: number;
  nome: string;
  dataHora: string;
  complementosTabelados?: ComplementoTabelado[];
}

export interface ComplementoTabelado {
  codigo: number;
  valor: number;
  nome: string;
  descricao: string;
}

export interface OrgaoJulgador {
  codigoMunicipioIBGE: number;
  codigo: number;
  nome: string;
}

export type {
  RequestCnjPublicApi,
  _ResponseCnjPublicApi as MetadadosProcessoCnj,
};
