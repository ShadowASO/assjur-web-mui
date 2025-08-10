import { TokenStorage } from "./TokenStorage";

export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method: HTTPMethod;
  url: string;
  query?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal; // <— novo
}

interface ErrorDetail {
  code: number;
  message: string;
  description?: string;
}

export interface StandardBodyResponse {
  ok?: boolean;
  data?: unknown | null;
  error?: ErrorDetail;
  timestamp?: Date;
  requestID?: string;
}

interface RefreshResponseInterface {
  access_token: string;
}

type ErrorHandler = (response: StandardBodyResponse) => void;

export class ApiCliente {
  private base_url: string;
  private onError?: ErrorHandler;
  /**
   * Crio um listener para recebe uma ou mais callBack a serem chamadas quando houve
   * alterações no estado da conexão, tais como login, logout, perda de validade do toke etc.
   */
  private listenerNotify: (() => void)[] = [];

  constructor(onError?: ErrorHandler) {
    this.onError = onError;
    this.base_url = BASE_API_URL;
  }

  async request(options: RequestOptions): Promise<StandardBodyResponse> {
    let internalResponse = await this.requestInternal(options);

    if (
      internalResponse.ok === false &&
      internalResponse.status === 401 &&
      options.url !== "/auth/login" &&
      options.url !== "/auth/token/refresh" &&
      options.url !== "/auth/token/verify"
    ) {
      const refreshResponse = await this.post("/auth/token/refresh", {
        token: TokenStorage.refreshToken,
      });

      if (refreshResponse.ok) {
        const data = refreshResponse.data as RefreshResponseInterface;
        //console.log("Token revalidado!");

        TokenStorage.accessToken = data.access_token;
        internalResponse = await this.requestInternal(options);
      } else {
        console.log("Refresh vencida!");
        this.logout();
        return refreshResponse;
      }
    }
    if (
      internalResponse.status === 401 &&
      options.url !== "/auth/token/verify"
    ) {
      console.log("Token falhou na verificação!");
      this.logout();
    }

    let body: StandardBodyResponse = {};
    if (internalResponse.status !== 204) {
      body = await internalResponse.json();
    } else {
      body = { data: null, ok: internalResponse.ok };
    }
    // ✅ garanta que ok exista sempre, mesmo que o backend não mande
    if (typeof body.ok !== "boolean") body.ok = internalResponse.ok;
    return body;
  }

  private async requestInternal(options: RequestOptions): Promise<Response> {
    let query = new URLSearchParams(options.query || {}).toString();
    if (query !== "") {
      query = "?" + query;
    }

    try {
      const response = await fetch(this.base_url + options.url + query, {
        method: options.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + TokenStorage.accessToken,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : null,
        signal: options.signal, // <— novo
      });
      //console.log(response);

      return response;
    } catch (error: unknown) {
      const errorBody: StandardBodyResponse = {
        ok: false,
        error: {
          code: 500,
          message: "O servidor não está respondendo.",
          description: error instanceof Error ? error.message : String(error),
        },
      };
      this.onError?.(errorBody);

      return new Response(JSON.stringify(errorBody), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  async get(
    url: string,
    query?: Record<string, string>,
    options?: Partial<RequestOptions>
  ): Promise<StandardBodyResponse> {
    return this.request({ method: "GET", url, query, ...options });
  }

  async post(
    url: string,
    body?: unknown,
    options?: Partial<RequestOptions>
  ): Promise<StandardBodyResponse> {
    return this.request({ method: "POST", url, body, ...options });
  }

  async put(
    url: string,
    body?: unknown,
    options?: Partial<RequestOptions>
  ): Promise<StandardBodyResponse> {
    return this.request({ method: "PUT", url, body, ...options });
  }

  async delete(
    url: string,
    options?: Partial<RequestOptions>
  ): Promise<StandardBodyResponse> {
    return this.request({ method: "DELETE", url, ...options });
  }

  async login(username: string, password: string): Promise<boolean> {
    const user = { username, password };

    interface LoginResponse {
      access_token: string;
      refresh_token: string;
      message?: string;
    }

    const response = await this.post("/auth/login", user);

    if (response.ok) {
      const data = response.data as LoginResponse;
      if (data.access_token && data.refresh_token) {
        TokenStorage.accessToken = data.access_token;
        TokenStorage.refreshToken = data.refresh_token;
        return true;
      }
    }
    return false;
  }

  async verify(): Promise<boolean> {
    const token = { token: TokenStorage.accessToken };
    //console.log(token);

    try {
      const response = await this.post("/auth/token/verify", token);

      return response?.ok === true;
    } catch (error) {
      console.error(
        "Erro inesperado ao verificar a validade da conexão: ",
        error
      );
      throw error instanceof Error
        ? error
        : new Error("Erro inesperado ao verificar a validade da conexão");
    }
  }

  logout(): void {
    TokenStorage.clear();
    this.notify();
  }

  isAuthenticated(): boolean {
    return TokenStorage.accessToken !== null;
  }

  getAcessToken(): string | null {
    return TokenStorage.accessToken;
  }

  /**
   * Rotinas para manipulação do listener
   * @param listener
   *
   */
  /**
   * Solução criada pelo GPT para permitir a adição de um listener à instância de
   * Api e disparar uma alteração quando houve mudanças no estado da conexão, pro-
   * vocando uma modificação em um stado do componente atual para recriá-lo e revali-
   * dar a conexão. O seguinte useEffect deve ser insierod no componente que se de-
   * seja reaja às modificações no estado da conexão.
   * -------------------------------------------------
   *  useEffect(() => {
   *    const handleAuthChange = () => {
   *      const token = Api.getAcessToken();
   *      setToken(token ?? null);
   *    };
   *    Api.addListener(handleAuthChange);
   *    return () => Api.removeListener(handleAuthChange);
   *  }, []);
   * -------------------------------------------------
   */

  addListener(listener: () => void) {
    this.removeListener(listener);
    this.listenerNotify.push(listener);
  }

  removeListener(listener: () => void) {
    this.listenerNotify = this.listenerNotify.filter((l) => l !== listener);
  }

  private notify() {
    if (this.listenerNotify.length > 0) {
      this.listenerNotify.forEach((l) => l());
    }
  }
  //************************************************ */
}
//Instância única e global de ApiCliente para ser utilizada em toda a aplicação.
const Api = new ApiCliente((r) => console.error("Erro:", r));

/**
 *
 * Devolve uma instância global de ApiCliente e deve ser utilizada por toda a aplicação
 * para acessos à API.
 */
export const getApiObjeto = () => {
  if (!Api) {
    throw new Error("Não houve a criação de uma instância de ApiCliente!");
  }
  return Api;
};

export const useApiCliente = () => {
  if (!Api) {
    throw new Error("Não houve a criação de uma instância de ApiCliente!");
  }
  return { Api, ApiCliente };
};
