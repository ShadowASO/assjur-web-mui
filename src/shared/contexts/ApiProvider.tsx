import { createContext, useContext, type ReactNode } from "react";
import { getApiObjeto, ApiCliente } from "../services/api/fetch/ApiCliente";

// Define a interface do tipo que o contexto fornecerá
type ApiContextType = ApiCliente;

// Criação do contexto com tipo genérico e inicialização com undefined ---
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Props esperadas para o provider
interface ApiProviderProps {
  children: ReactNode;
}

export default function ApiProvider({ children }: ApiProviderProps) {
  const Api = getApiObjeto(); //Obtém a instância global da API
  return <ApiContext.Provider value={Api}>{children}</ApiContext.Provider>;
}

// Hook com verificação de uso correto do contexto
export function useApi(): ApiCliente {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi deve ser usado dentro de um ApiProvider");
  }
  return context;
}
