/**
 * File: FalshProvider.tsx
 * Criação: 13-05-2025
 * Componente para exibir mensagens de alerta, erro, advertência, informações na interface. Este provider
 * dever trabalhar em parceria com um objeto que exiba as mensagens, tal como "FlashAlerta"
 * USO:
 * Insiera em qualquer componente
 * const { showFlashMessage } = useFlash();
 * showFlashMessage(
           "Posts recebidos com sucesso",
           "success",
           TIME_FLASH_ALERTA_SEC
         );
 */
import { createContext, useContext, useState } from "react";

import type { ReactNode } from "react";
interface FlashMessage {
  message: string;
  type: "success" | "warning" | "info" | "error";
  duration: number;
}

interface FlashContextType {
  showFlashMessage: (
    message: string,
    type: FlashMessage["type"],
    duration?: number
  ) => void;
  flashMessage: FlashMessage | null;
  isShow: boolean;
  setShow: (log: boolean) => void;
  duration: number;
  setDuration: (n: number) => void;
}

const FlashContext = createContext<FlashContextType | undefined>(undefined);

export const TIME_FLASH_ALERTA_SEC = 3;

interface FlashProviderProps {
  children: ReactNode;
}

export default function FlashProvider({ children }: FlashProviderProps) {
  const [flashMessage, setMessage] = useState<FlashMessage | null>(null);
  const [isShow, setShow] = useState<boolean>(false);
  const [duration, setDuration] = useState(3);

  const showFlashMessage = (
    message: string,
    type: FlashMessage["type"],
    duration = TIME_FLASH_ALERTA_SEC
  ) => {
    setMessage({ message, type, duration });
    setShow(true);
  };

  return (
    <FlashContext.Provider
      value={{
        showFlashMessage,
        flashMessage,
        isShow,
        setShow,
        duration,
        setDuration,
      }}
    >
      {children}
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error("useFlash must be used within a FlashProvider");
  }
  return context;
}
