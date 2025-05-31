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
import { createContext, useContext, useState, useEffect, useRef } from "react";

import type { ReactNode } from "react";
interface FlashMessage {
  message: string;
  type: "success" | "warning" | "info" | "error";
}

interface FlashContextType {
  showFlashMessage: (
    message: string,
    type: FlashMessage["type"],
    duration?: number
  ) => void;
  flashMessage: FlashMessage | null;
  isShow: boolean;
}

const FlashContext = createContext<FlashContextType | undefined>(undefined);

interface FlashProviderProps {
  children: ReactNode;
}

export default function FlashProvider({ children }: FlashProviderProps) {
  const [flashMessage, setMessage] = useState<FlashMessage | null>(null);
  const [isShow, setShow] = useState<boolean>(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function hiddenFlash() {
    setShow(false);
    setMessage(null); // <- limpa o conteúdo
  }

  const showFlashMessage = (
    message: string,
    type: FlashMessage["type"],
    duration = 5
  ) => {
    if (flashTimer.current) {
      clearTimeout(flashTimer.current);
    }

    setMessage({ message, type });
    setShow(true);

    if (duration > 0) {
      flashTimer.current = setTimeout(hiddenFlash, duration * 1000);
    }
  };

  // Limpa o timer ao desmontar o componente
  useEffect(() => {
    return () => {
      if (flashTimer.current) {
        clearTimeout(flashTimer.current);
      }
    };
  }, []);

  return (
    <FlashContext.Provider value={{ showFlashMessage, flashMessage, isShow }}>
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
