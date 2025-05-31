import type { AxiosError } from "axios";

export const errorInterceptor = (error: AxiosError) => {
  if (error.message === "Networ Error") {
    return Promise.reject(new Error("Erro de conexão"));
  }
  if (error.response?.status === 401) {
    //Faça alguma coisa
  }
  return Promise.reject(error);
};
