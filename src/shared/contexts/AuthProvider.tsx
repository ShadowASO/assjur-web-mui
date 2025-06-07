import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getApiObjeto } from "../services/api/fetch/ApiCliente";

interface IAuthContextData {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuth: boolean;
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<IAuthContextData | undefined>(undefined);

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: IAuthProviderProps) => {
  const [isAuth, setAuth] = useState<boolean>(false);
  const Api = getApiObjeto(); //Obtém a instância global da API

  useEffect(() => {
    /**  Este effect é executado apenas na inicialização da aplicação. Nesse moemnto,
     *   fazemos uma verificação da conexão, fazendo uma chamada à API. Se tivermos uma
     *   resposta válida, significa que o token armazenado no localStorage ainda é váli-
     *   do. Não precisamos nos preocupar em limpar o localStorage, pois a ApiCliente
     *   faz isso quando recebe um código de erro 401.
     */
    (async () => {
      const isValid = await Api.verify();
      //Na inicialização, o estado é falso
      setAuth(isValid ? true : false);
      if (!isValid) {
        Api.logout();
      }
    })();

    const syncToken = async () => {
      const isValid = await Api.verify();
      setAuth(isValid ? true : false);
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  /**
   * Solução criada pelo GPT para permitir a adição de um listener à instância de
   * Api e disparar uma alteração quando houve mudanças no estado da conexão, pro-
   * vocando uma modificação em um stado do componente atual para recriá-lo e revali-
   * dar a conexão..
   */
  useEffect(() => {
    const handleAuthChange = () => {
      setAuth(Api.isAuthenticated() ? true : false);
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
        setAuth(true);
      }
      return ok;
    } catch (e) {
      console.error("Erro durante login:", e);
    }
    return false;
  };

  const handleLogout = () => {
    Api.logout();
    setAuth(false);
  };

  return (
    <AuthContext.Provider
      value={{
        setAuth,
        isAuth,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
