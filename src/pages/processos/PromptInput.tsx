/**
 * File: PromptInput.tsx
 * Finalidade: Campo de prompt desacoplado, com overlay de processamento e ações.
 * Autor: Aldenor Oliveira
 * Atualização: 23/10/2025
 */

import React, { useCallback, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  //useTheme,
} from "@mui/material";
import { ContentCopy, Delete, Send } from "@mui/icons-material";
import { useFlash } from "../../shared/contexts/FlashProvider";

export interface PromptInputProps {
  //value: string;
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  isSending?: boolean;
}

/**
 * Componente isolado e memoizado para evitar re-renderizações desnecessárias
 * em AnalisesMain quando o usuário digita no campo.
 */
export const PromptInput: React.FC<PromptInputProps> = React.memo(
  ({ onSubmit, isLoading = false, isSending = false }) => {
    const [localPrompt, setLocalPrompt] = useState("");
    const { showFlashMessage } = useFlash();

    // callback estável
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (!isLoading && !isSending) {
            onSubmit(localPrompt);
            setLocalPrompt("");
          }
        }
      },
      [onSubmit, isLoading, localPrompt, isSending]
    );

    // clipboard
    const copyToClipboard = useCallback(
      (texto: string, msgOk = "Copiado!") => {
        if (!texto) return;
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(texto).then(
            () => showFlashMessage(msgOk, "success"),
            () => showFlashMessage("Não foi possível copiar.", "warning")
          );
        }
      },
      [showFlashMessage]
    );

    return (
      <Box>
        {/* Campo de texto com overlay de processamento */}
        <Box position="relative">
          <TextField
            label="Prompt"
            multiline
            minRows={4}
            fullWidth
            disabled={isLoading || isSending}
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite o prompt aqui..."
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
              "& .MuiInputBase-root": {
                maxHeight: 220,
                overflow: "auto",
                alignItems: "start",
              },
              "& textarea": {
                height: "100% !important",
                overflow: "auto",
              },
            }}
            slotProps={{
              input: { style: { padding: 24 } },
              inputLabel: { shrink: true },
            }}
          />

          {/* Overlay de carregamento */}
          {isSending && (
            <Box
              role="status"
              aria-live="polite"
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(2px)",
                borderRadius: 2,
                zIndex: 1,
              }}
            >
              <CircularProgress size={28} />
              <Typography variant="body2" ml={1.5}>
                Processando…
              </Typography>
            </Box>
          )}
        </Box>

        {/* Barra de ações */}
        <Box
          mt={0.5}
          display="flex"
          justifyContent="flex-end"
          gap={0.5}
          aria-label="Ações do prompt"
        >
          <Tooltip title="Enviar">
            <span>
              <IconButton
                size="small"
                onClick={() => {
                  onSubmit(localPrompt);
                  setLocalPrompt("");
                }}
                disabled={isLoading || isSending || !localPrompt.trim()}
                aria-label="Enviar prompt"
              >
                <Send fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Copiar prompt">
            <span>
              <IconButton
                size="small"
                onClick={() => copyToClipboard(localPrompt, "Prompt copiado!")}
                disabled={isLoading || isSending || !localPrompt.trim()}
                aria-label="Copiar prompt"
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Limpar">
            <span>
              <IconButton
                size="small"
                onClick={() => setLocalPrompt("")}
                disabled={isLoading || isSending || !localPrompt.trim()}
                aria-label="Limpar prompt"
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    );
  }
);
