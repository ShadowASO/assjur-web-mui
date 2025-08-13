/**
 * File: FlashAlerta.tsx
 * Criação: 13-05-2025
 * Revisão: 15/06/2025
 * Exibe uma mensagem na janela e deve trabalhar em parceria com FlashProvider
 * USO:
 * Deve ser inserido no nível mais alto da pilha de componentes, pois ele é criado e fica
 * oculto, somente sendo exibido quando o usuário deseja exibir uma mensagem, por determi-
 * nado tempo.
 */

/**
 * File: FlashAlerta.tsx
 * Revisão: 12/08/2025
 */

import { useState } from "react";
import { useFlash, TIME_FLASH_ALERTA_SEC } from "../contexts/FlashProvider";
import { Alert, Snackbar, Collapse, IconButton } from "@mui/material";
import AlertTitle from "@mui/material/AlertTitle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";

export default function FlashAlerta() {
  const { flashMessage, isShow, closeFlash } = useFlash();
  const [showDetails, setShowDetails] = useState(false);

  if (!flashMessage) return null;

  const {
    id,
    type,
    message,
    title,
    details,
    durationSec = TIME_FLASH_ALERTA_SEC,
    persist,
  } = flashMessage;

  const autoHideDuration = persist
    ? undefined
    : Math.max(500, durationSec * 1000);

  const handleClose = (_e?: unknown, reason?: string) => {
    if (reason === "clickaway") return; // evita fechar ao clicar fora
    setShowDetails(false);
    closeFlash();
  };

  return (
    <Snackbar
      key={id}
      open={isShow}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={type}
        sx={{ width: "100%" }}
        onClose={handleClose}
        action={
          <>
            {details && (
              <IconButton
                aria-label="Ver detalhes"
                size="small"
                onClick={() => setShowDetails((s) => !s)}
              >
                <InfoOutlinedIcon fontSize="inherit" />
              </IconButton>
            )}
            <IconButton aria-label="Fechar" size="small" onClick={handleClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </>
        }
      >
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        {message}
        {details && (
          <Collapse in={showDetails} unmountOnExit>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                margin: 0,
                marginTop: 8,
                fontFamily: "monospace",
                fontSize: 12,
                opacity: 0.9,
              }}
            >
              {details}
            </pre>
          </Collapse>
        )}
      </Alert>
    </Snackbar>
  );
}
