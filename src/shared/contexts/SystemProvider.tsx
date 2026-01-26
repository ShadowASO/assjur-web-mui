/**
 * File: SystemProvider.tsx
 * Contexto para manter os valores globais relacionados ao aplicativo, tais como o id do
 * contexto processual em uso e etc.
 * Data: 31-05-2025
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getApiObjeto } from "../services/api/fetch/ApiCliente";

// Define a interface do tipo que o contexto fornecerá
type SystemContextType = {
  versionApp: string;
  setVersionApp: (ver: string) => void;
  versionApi: string;
  setVersionApi: (ver: string) => void;
  contexto: number;
  setContexto: (id: number) => void;
  isAuth: boolean;
  setAuth: (log: boolean) => void;
};

// Criação do contexto com tipo genérico e inicialização com undefined
const SystemContext = createContext<SystemContextType>({
  versionApp: "",
  setVersionApp: () => {},
  versionApi: "",
  setVersionApi: () => {},
  contexto: 0,
  setContexto: () => {},
  isAuth: false,
  setAuth: () => {},
});

// Props esperadas para o provider
interface SystemProviderProps {
  children: ReactNode;
}

type VersionAPI = {
  version: string;
};

export default function SystemProvider({ children }: SystemProviderProps) {
  const [contexto, setContexto] = useState(0);
  const [isAuth, setAuth] = useState(false);
  const [versionApi, setVersionApi] = useState("3.3.3");
  const [versionApp, setVersionApp] = useState("3.3.3");
  const Api = getApiObjeto(); //Obtém a instância global da API

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const rsp = await Api.get("/sys/version");
        if (rsp.ok) {
          const data = rsp.data as VersionAPI;
          setVersionApi(data.version);
        } else {
          console.error("Versão não encontrada");
        }
      } catch (err) {
        console.error("Erro ao buscar versão:", err);
      }
    };

    fetchVersion();
  }, [versionApi, Api]);

  return (
    <SystemContext.Provider
      value={{
        isAuth,
        setAuth,
        contexto,
        setContexto,
        setVersionApi,
        versionApi,
        setVersionApp,
        versionApp,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

// Hook com verificação de uso correto do contexto
export function useSystem(): SystemContextType {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error("useSystem deve ser chamado dentro de um SystemProvider!");
  }
  return context;
}
