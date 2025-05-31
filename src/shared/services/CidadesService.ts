import { Environment } from "../enviroments";
import { Api } from "./api/axios/ApiAxios";

export interface IListagemCidade {
  id: string;
  nome: string;
}

export interface IDetalheCidade {
  id: string;
  nome: string;
}

type TCidadesComTotalCount = {
  data: IListagemCidade[];
  first: number;
  prev: number;
  next: number;
  last: number;
  pages: number;
  items: number;
};

const getAll = async (
  page = 1,
  filter = "",
  id = ""
): Promise<TCidadesComTotalCount | Error> => {
  try {
    //console.log(filter);
    const urlRel = `/cidades?_page=${page}&_per_page=${Environment.LIMITE_DE_LINHAS}&nome=${filter}&id=${id}`;
    const { data } = await Api.get(urlRel);
    //console.log(data);

    if (data) {
      return data;
    }
    return new Error("Erro ao listar os registros");
  } catch (error) {
    console.log(error);
    return new Error(
      (error as { message: string }).message || "Erro ao listar os registros"
    );
  }
};

const getById = async (id: string): Promise<IDetalheCidade | Error> => {
  try {
    const { data } = await Api.get(`/cidades/${id}`);

    if (data) {
      return data;
    }

    return new Error("Erro ao consultar o registro.");
  } catch (error) {
    console.error(error);
    return new Error(
      (error as { message: string }).message || "Erro ao consultar o registro."
    );
  }
};
const create = async (
  dados: Omit<IDetalheCidade, "id">
): Promise<string | Error> => {
  try {
    const { data } = await Api.post<IDetalheCidade>("/cidades", dados);
    //console.log(data);

    if (data) {
      return data.id;
    }

    return new Error("Erro ao criar o registro.");
  } catch (error) {
    console.error(error);
    return new Error(
      (error as { message: string }).message || "Erro ao criar o registro."
    );
  }
};
const updateById = async (
  id: string,
  dados: IDetalheCidade
): Promise<void | Error> => {
  try {
    await Api.put(`/cidades/${id}`, dados);
  } catch (error) {
    console.error(error);
    return new Error(
      (error as { message: string }).message || "Erro ao atualizar o registro."
    );
  }
};

const deleteById = async (id: string): Promise<void | Error> => {
  try {
    await Api.delete(`/cidades/${id}`);
  } catch (error) {
    console.error(error);
    return new Error(
      (error as { message: string }).message || "Erro ao apagar o registro."
    );
  }
};

export const CidadesService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
