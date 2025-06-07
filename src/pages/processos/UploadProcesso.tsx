import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { SelectPecas } from "./SelectPecas";
import { ListaPecas } from "./ListaPecas";
import { useState } from "react";

import {
  extracDocumentWithOCR,
  refreshOcrByContexto,
} from "../../shared/services/api/fetch/apiTools";
import { ListaOCR } from "./ListaOCR";
import { Close, ContentCopy } from "@mui/icons-material";

export const UploadProcesso = () => {
  const { id } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textoOCR, setTextoOCR] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);

  const handleExtrairTexto = async (fileId: number) => {
    await extracDocumentWithOCR(Number(id), fileId);
    await refreshOcrByContexto(Number(id)); // Atualização pode ser otimizada
  };

  const handleAbrirDialog = (texto: string) => {
    setTextoOCR(texto);
    setDialogOpen(true);
  };
  const handleFecharDialog = () => {
    setDialogOpen(false);
    setTextoOCR("");
  };

  const handleCopyText = () => {
    navigator.clipboard
      .writeText(textoOCR)
      .then(() => {
        setSnackbarError(false);
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarError(true);
        setSnackbarOpen(true);
      });
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Upload de Peças Processuais #{id}
      </Typography>

      <Grid container spacing={2}>
        {/* COL-01 - Seleção dos arquivos a transferir */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <SelectPecas processoId={id!} />
          </Paper>
        </Grid>

        {/*COL-2 Arquivos transferidos por upload */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">Peças trasnferidas</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            {/* <Typography variant="subtitle1">Peças Vinculadas</Typography> */}
            <ListaPecas
              processoId={id!}
              onView={() => {}}
              onExtract={handleExtrairTexto}
            />
          </Paper>
        </Grid>

        {/*COL-3 Arquivos transferidos por upload */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">Peças Extraídas por OCR</Typography>
            <ListaOCR
              processoId={id!}
              onViewText={handleAbrirDialog}
              onExtract={handleExtrairTexto}
            />
          </Paper>
        </Grid>
      </Grid>
      {/* Dialog para exibir texto OCR */}
      <Dialog
        open={dialogOpen}
        onClose={handleFecharDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Texto Extraído
          <IconButton
            onClick={handleFecharDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            value={textoOCR}
            multiline
            fullWidth
            minRows={15}
            variant="outlined"
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <IconButton
              onClick={handleCopyText}
              title="Copiar para área de transferência"
            >
              <ContentCopy />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarError ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarError
            ? "Erro ao copiar para a área de transferência."
            : "Texto copiado com sucesso!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};
