//import { number } from "yup";
import { Environment } from "../enviroments";
import { Api } from "./api/axios/ApiAxios";

export interface IListagemPessoa {
  id: string;
  email: string;
  cidadeId: string;
  nomeCompleto: string;
}

export interface IDetalhePessoa {
  id: string;
  email: string;
  cidadeId: string;
  nomeCompleto: string;
}

type TPessoasComTotalCount = {
  data: IListagemPessoa[];
  first: number;
  prev: number;
  next: number;
  last: number;
  pages: number;
  items: number;
};

const getAll = async (
  page = 1,
  filter = ""
): Promise<TPessoasComTotalCount | Error> => {
  try {
    const urlRel = `/pessoas?_page=${page}&_per_page=${Environment.LIMITE_DE_LINHAS}&nomeCompleto=${filter}`;
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

const getById = async (id: string): Promise<IDetalhePessoa | Error> => {
  try {
    const { data } = await Api.get(`/pessoas/${id}`);

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
  dados: Omit<IDetalhePessoa, "id">
): Promise<string | Error> => {
  try {
    const { data } = await Api.post<IDetalhePessoa>("/pessoas", dados);
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
  dados: IDetalhePessoa
): Promise<void | Error> => {
  try {
    await Api.put(`/pessoas/${id}`, dados);
  } catch (error) {
    console.error(error);
    return new Error(
      (error as { message: string }).message || "Erro ao atualizar o registro."
    );
  }
};

const deleteById = async (id: string): Promise<void | Error> => {
  try {
    await Api.delete(`/pessoas/${id}`);
  } catch (error) {
    console.error(error);
    return new Error(
      (error as { message: string }).message || "Erro ao apagar o registro."
    );
  }
};

export const PessoasService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
