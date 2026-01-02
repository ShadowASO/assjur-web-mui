/**
 * File: AlterarContexto.tsx
 * Atualização: 21/10/2025
 * Dialog para alterar a classe e o assunto de um contexto existente.
 */

import React, { useCallback, useEffect, useState } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import { useFlash } from "../../shared/contexts/FlashProvider";
import { describeApiError } from "../../shared/services/api/erros/errosApi";
import { updateContexto } from "../../shared/services/api/fetch/apiTools"; // 🔁 nova rota de atualização esperada

interface AlterarContextoProps {
  open: boolean;
  onClose: () => void;
  id: string;
  juizoAtual: string;
  classeAtual: string;
  assuntoAtual: string;
  onSuccess?: () => void;
}

/**
 * Dialog para edição de classe e assunto do contexto.
 */
export const AlterarContexto: React.FC<AlterarContextoProps> = ({
  open,
  onClose,
  id,
  juizoAtual,
  classeAtual,
  assuntoAtual,
  onSuccess,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { showFlashMessage } = useFlash();
  const [juizo, setJuizo] = useState(juizoAtual);
  const [classe, setClasse] = useState(classeAtual);
  const [assunto, setAssunto] = useState(assuntoAtual);
  const [saving, setSaving] = useState(false);

  // Limpa os campos ao abrir
  useEffect(() => {
    if (open) {
      setJuizo(juizoAtual);
      setClasse(classeAtual);
      setAssunto(assuntoAtual);
    }
  }, [open, classeAtual, assuntoAtual]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSalvar = useCallback(async () => {
    if (!classe || !assunto || !juizo) {
      showFlashMessage("Preencha todos os campos.", "warning");
      return;
    }

    setSaving(true);
    try {
      const rsp = await updateContexto(id, juizo, classe, assunto);

      if (rsp) {
        showFlashMessage("Contexto atualizado com sucesso!", "success");
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        showFlashMessage("Falha ao atualizar o contexto.", "error");
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro ao atualizar contexto:", techMsg);
      showFlashMessage(userMsg, "error", 8000, {
        title: "Erro de atualização",
        details: techMsg,
      });
    } finally {
      setSaving(false);
    }
  }, [juizo, classe, assunto, id, handleClose, showFlashMessage, onSuccess]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      aria-labelledby="alterar-contexto-title"
    >
      <DialogTitle id="alterar-contexto-title">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
        >
          <Typography variant="h6">Alterar Contexto</Typography>
          <IconButton aria-label="Fechar" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Atualize as informações do contexto abaixo.
        </Typography>
        <TextField
          fullWidth
          label="Juízo"
          value={juizo}
          onChange={(e) => setJuizo(e.target.value)}
          size="small"
          margin="normal"
          placeholder="Ex: 3ª Vara Cível da Comarca de Sobral"
        />

        <TextField
          fullWidth
          label="Classe"
          value={classe}
          onChange={(e) => setClasse(e.target.value)}
          size="small"
          margin="normal"
          placeholder="Ex: Procedimento Comum Cível"
        />

        <TextField
          fullWidth
          label="Assunto Principal"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          size="small"
          margin="normal"
          placeholder="Ex: Contratos Bancários, Tarifas..."
        />
      </DialogContent>

      <DialogActions sx={{ gap: 1, px: 3, py: 2 }}>
        <LoadingButton
          variant="contained"
          onClick={handleSalvar}
          loading={saving}
        >
          Salvar Alterações
        </LoadingButton>
        <Button variant="text" onClick={handleClose}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
