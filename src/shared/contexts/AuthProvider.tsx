import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { TokenStorage } from "../services/api/fetch/TokenStorage";
import { getApiObjeto } from "../services/api/fetch/ApiCliente";

interface IAuthContextData {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<IAuthContextData | undefined>(undefined);

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: IAuthProviderProps) => {
  const [, setToken] = useState<string | null>(null);
  const Api = getApiObjeto(); //Obtém a instância global da API

  useEffect(() => {
    const stored = Api.getAcessToken();
    setToken(stored ? stored : null);

    const syncToken = () => {
      const updated = Api.getAcessToken();
      setToken(updated ? updated : null);
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, [Api]);

  /**
   * Solução criada pelo GPT para permitir a adição de um listener à instância de
   * Api e disparar uma alteração quando houve mudanças no estado da conexão, pro-
   * vocando uma modificação em um stado do componente atual para recriá-lo e revali-
   * dar a conexão..
   */
  useEffect(() => {
    const handleAuthChange = () => {
      const token = Api.getAcessToken();
      setToken(token ?? null);
    };

    Api.addListener(handleAuthChange);
    return () => Api.removeListener(handleAuthChange);
  }, []);

  const handleLogin = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const ok = await Api.login(username, password);
      if (ok) {
        const stored = Api.getAcessToken();
        setToken(stored ? stored : null);
      }
      return ok;
    } catch (e) {
      console.error("Erro durante login:", e);
    }
    return false;
  };

  const handleLogout = () => {
    Api.logout();
    setToken(null);
    TokenStorage.accessToken = null;
  };

  const isAuthenticated = Api.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login: handleLogin, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
