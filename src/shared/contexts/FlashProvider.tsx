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

/**
 * File: FlashProvider.tsx  (corrige nome do arquivo)
 * Criação: 13-05-2025
 * Revisão: 12-08-2025
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const TIME_FLASH_ALERTA_SEC = 3;

type FlashType = "success" | "warning" | "info" | "error";

export interface FlashMessage {
  id: number;
  message: ReactNode | string;
  type: FlashType;
  /** Título opcional exibido em negrito no Alert */
  title?: string;
  /** Detalhes técnicos (ex.: stack, JSON de erro) exibidos em seção colapsável */
  details?: string;
  /** Duração em segundos (por mensagem). Se ausente, usa TIME_FLASH_ALERTA_SEC */
  durationSec?: number;
  /** Se true, não fecha automaticamente */
  persist?: boolean;
}

interface FlashContextType {
  /**
   * API legada (mantida): showFlashMessage(message, type, durationSec?, options?)
   * options: { title?, details?, persist? }
   */
  showFlashMessage: (
    message: string | ReactNode,
    type: FlashType,
    durationSec?: number,
    options?: Pick<FlashMessage, "title" | "details" | "persist">
  ) => void;

  /**
   * API por objeto (nova): showFlash({ message, type, ... })
   */
  showFlash: (msg: Omit<FlashMessage, "id">) => void;

  /** Fecha o alerta atual */
  closeFlash: () => void;

  flashMessage: FlashMessage | null;
  isShow: boolean;
}

const FlashContext = createContext<FlashContextType | undefined>(undefined);

interface FlashProviderProps {
  children: ReactNode;
}

export default function FlashProvider({ children }: FlashProviderProps) {
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);
  const [isShow, setIsShow] = useState(false);
  const idRef = useRef(0);

  const closeFlash = useCallback(() => setIsShow(false), []);

  const showFlash = useCallback((msg: Omit<FlashMessage, "id">) => {
    const id = ++idRef.current;
    setFlashMessage({ ...msg, id });
    setIsShow(true);
  }, []);

  const showFlashMessage = useCallback(
    (
      message: string | ReactNode,
      type: FlashType,
      durationSec: number = TIME_FLASH_ALERTA_SEC,
      options?: Pick<FlashMessage, "title" | "details" | "persist">
    ) => {
      showFlash({
        message,
        type,
        durationSec,
        ...options,
      });
    },
    [showFlash]
  );

  const value = useMemo(
    () => ({
      showFlashMessage,
      showFlash,
      closeFlash,
      flashMessage,
      isShow,
    }),
    [showFlashMessage, showFlash, closeFlash, flashMessage, isShow]
  );

  return (
    <FlashContext.Provider value={value}>{children}</FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error("useFlash must be used within a FlashProvider");
  }
  return context;
}
