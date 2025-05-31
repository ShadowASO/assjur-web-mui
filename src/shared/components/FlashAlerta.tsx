/**
 * File: FlashAlerta.tsx
 * Criação: 13-05-2025
 * Exibe uma mensagem na janela e deve trabalhar em parceria com FlashProvider
 * USO:
 * Deve ser inserido no nível mais alto da pilha de componentes, pois ele é criado e fica
 * oculto, somente sendo exibido quando o usuário deseja exibir uma mensagem, por determi-
 * nado tempo.
 */

import { useFlash } from "../contexts/FlashProvider";
import { Alert, Snackbar } from "@mui/material";
import AlertTitle from "@mui/material/AlertTitle";

export const TIME_FLASH_ALERTA_SEC = 5;

export default function FlashAlerta() {
  const { flashMessage, isShow } = useFlash();

  if (!flashMessage || !isShow) return null;

  return (
    <Snackbar
      open={isShow}
      autoHideDuration={TIME_FLASH_ALERTA_SEC * 1000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ width: "100%" }}
    >
      <Alert severity={flashMessage.type} sx={{ width: "100%" }}>
        <AlertTitle>{flashMessage.type.toUpperCase()}</AlertTitle>
        {flashMessage.message}
      </Alert>
    </Snackbar>
  );
}
