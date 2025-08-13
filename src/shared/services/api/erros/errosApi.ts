// --- helpers/erro.ts ---
export class ApiError extends Error {
  public readonly code?: number; // use "code" em vez de "status"
  public readonly endpoint?: string;

  constructor(message: string, code?: number, endpoint?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.endpoint = endpoint;
  }
}
// Mostre detalhes técnicos apenas em dev:
export const SHOW_TECH_ERRORS = import.meta.env?.MODE !== "production";

export const codeToFriendly = (code?: number): string => {
  switch (code) {
    case 0:
    case undefined:
      return "Falha ao se comunicar com o servidor.";
    case 400:
      return "Requisição inválida.";
    case 401:
      return "Sessão expirada. Faça login novamente.";
    case 403:
      return "Você não tem permissão para executar esta ação.";
    case 404:
      return "Recurso não encontrado.";
    case 408:
      return "Tempo de resposta esgotado. Tente novamente.";
    case 409:
      return "Conflito de dados.";
    case 422:
      return "Dados inválidos. Verifique os campos e tente novamente.";
    case 429:
      return "Muitas solicitações. Aguarde um instante.";
    case 500:
      return "Erro interno do servidor.";
    case 502:
      return "Gateway/Proxy retornou erro.";
    case 503:
      return "Serviço indisponível no momento.";
    case 504:
      return "Tempo de resposta do servidor excedido.";
    default:
      return "Ocorreu um erro inesperado.";
  }
};

// Mantém compatibilidade com sua ApiError
export const describeApiError = (
  err: unknown
): {
  userMsg: string; // mensagem amigável para o usuário
  techMsg: string; // detalhes técnicos para log/tooltip
} => {
  if (err instanceof ApiError) {
    const friendly = codeToFriendly(err.code);
    const tech: string[] = [err.message];
    if (typeof err.code === "number") tech.push(`código=${err.code}`);
    if (err.endpoint) tech.push(`endpoint=${err.endpoint}`);
    return {
      userMsg: friendly,
      techMsg: tech.join(" | "),
    };
  }

  // Outros tipos de erro (ex.: throw new Error(...))
  const fallback =
    (typeof err === "object" && err && "message" in err && err.message) ||
    (() => {
      try {
        return JSON.stringify(err);
      } catch {
        return String(err);
      }
    })();

  return {
    userMsg: "Não foi possível concluir a operação.",
    techMsg: String(fallback),
  };
};
