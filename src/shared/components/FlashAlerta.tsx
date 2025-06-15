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

import { useFlash } from "../contexts/FlashProvider";
import { Alert, Snackbar } from "@mui/material";
import AlertTitle from "@mui/material/AlertTitle";

export default function FlashAlerta() {
  const { flashMessage, isShow, setShow, duration } = useFlash();

  if (!flashMessage || !isShow) return null;

  return (
    <Snackbar
      open={isShow}
      autoHideDuration={duration * 1000}
      onClose={() => setShow(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={flashMessage.type}
        sx={{ width: "100%" }}
        onClose={() => setShow(false)}
      >
        <AlertTitle>{flashMessage.type.toUpperCase()}</AlertTitle>
        {flashMessage.message}
      </Alert>
    </Snackbar>
  );
}
