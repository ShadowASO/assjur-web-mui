/**
 * File: CriarContexto.tsx
 * Criação:  15/06/2025
 * Exibe uma janela Dialog para que seja informado o número do processo para o qual se
 * deseja criar um novo contexto.
 *
 */
import { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { MetadadosProcessoCnj } from "../../shared/types/cnjTypes";
import {
  insertContexto,
  searchMetadadosCNJ,
} from "../../shared/services/api/fetch/apiTools";
import ShowMetadadosCnj from "./ShowMetadados";
import { useFlash } from "../../shared/contexts/FlashProvider";

interface CriarContextoProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CriarContexto = ({
  open,
  onClose,
  onSuccess,
}: CriarContextoProps) => {
  const [numeroProcesso, setNumeroProcesso] = useState<string>("");
  const [metaCnj, setMetaCnj] = useState<MetadadosProcessoCnj | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { showFlashMessage } = useFlash();

  const regexCNJ = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

  const fieldProcessoRef = useRef<HTMLInputElement | null>(null);

  const handleClose = () => {
    handleLimpar();
    onClose();
  };

  const handleLimpar = () => {
    setNumeroProcesso("");
    setMetaCnj(null);
    if (fieldProcessoRef.current) fieldProcessoRef.current.value = "";
  };

  const handleBuscarMetadadosCnj = async () => {
    const numeroProcessoLimpo = numeroProcesso.replace(/\D/g, ""); // Remove pontos, traços, espaços etc.

    if (numeroProcessoLimpo.length !== 20) {
      showFlashMessage(
        "Número do processo deve ter exatamente 20 dígitos.",
        "error"
      );

      return;
    }
    if (!regexCNJ.test(numeroProcesso)) {
      showFlashMessage("Número do processo fora do formato CNJ!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const metaDados = await searchMetadadosCNJ(numeroProcessoLimpo);
      if (metaDados) {
        setMetaCnj(metaDados);
        console.log("Processo confirmado no CNJ:", numeroProcessoLimpo);
      } else {
        showFlashMessage("Processo não encontrado na base do CNJ!", "error");
      }
    } catch (error) {
      console.error("Erro ao buscar metadados CNJ:", error);

      showFlashMessage("Processo não encontrado na base do CNJ!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCriarContexto = async () => {
    if (!metaCnj) return;

    try {
      const hit = metaCnj.hits.hits[0]?._source;
      const juizo = hit?.orgaoJulgador.nome;
      const classe = hit?.classe.nome;
      const assunto = hit?.assuntos[0]?.nome ?? "Assunto não identificado";
      const numeroProcessoLimpo = numeroProcesso.replace(/\D/g, ""); // Remove pontos, traços, espaços etc.

      const rsp = await insertContexto(
        numeroProcessoLimpo,
        juizo,
        classe,
        assunto
      );

      if (rsp) {
        showFlashMessage("Contexto criado com sucesso!", "success");
        onClose();
        if (onSuccess) onSuccess(); // <<---- Callback para forçar refresh
      } else {
        showFlashMessage("Não foi possível criar o contexto.", "error");
      }
    } catch (error) {
      console.error("Erro ao criar contexto:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Criar Novo Contexto</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box mt={1} mb={2}>
            <TextField
              inputRef={fieldProcessoRef}
              fullWidth
              label="Número do Processo"
              placeholder="Digite o número do processo"
              value={numeroProcesso}
              onChange={(e) => setNumeroProcesso(e.target.value)}
              variant="outlined"
              size="small"
              disabled={isLoading || creating}
            />
          </Box>

          {isLoading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          )}

          {metaCnj && <ShowMetadadosCnj processoCnj={metaCnj} />}
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleBuscarMetadadosCnj}
            disabled={numeroProcesso.length === 0 || isLoading}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            onClick={handleLimpar}
            disabled={numeroProcesso.length === 0 && !metaCnj}
          >
            Limpar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCriarContexto}
            disabled={!metaCnj || creating}
          >
            Confirmar
          </Button>
          <Button variant="text" onClick={handleClose}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
