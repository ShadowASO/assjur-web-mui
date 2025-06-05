/**
 * File: SystemProvider.tsx
 * Contexto para manter os valores globais relacionados ao aplicativo, tais como o id do
 * contexto processual em uso e etc.
 * Data: 31-05-2025
 */
import { createContext, useContext, useState, type ReactNode } from "react";

// Define a interface do tipo que o contexto fornecerá
type SystemContextType = {
  contexto: number;
  setContexto: (id: number) => void;
  isAuth: boolean;
  setAuth: (log: boolean) => void;
};

// Criação do contexto com tipo genérico e inicialização com undefined
const SystemContext = createContext<SystemContextType>({
  contexto: 0,
  setContexto: () => {},
  isAuth: false,
  setAuth: () => {},
});

// Props esperadas para o provider
interface SystemProviderProps {
  children: ReactNode;
}

export default function SystemProvider({ children }: SystemProviderProps) {
  const [contexto, setContexto] = useState(0);
  const [isAuth, setAuth] = useState(false);
  return (
    <SystemContext.Provider value={{ isAuth, setAuth, contexto, setContexto }}>
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
