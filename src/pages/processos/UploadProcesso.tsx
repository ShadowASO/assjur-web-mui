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
  deleteOcrdocByIdDoc,
  deleteUploadFileById,
  extracDocumentWithOCR,
  uploadFileToServer,
} from "../../shared/services/api/fetch/apiTools";
import { ListaOCR } from "./ListaOCR";
import { Close, ContentCopy } from "@mui/icons-material";

export const UploadProcesso = () => {
  const { id } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textoOCR, setTextoOCR] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  //Refresh das interfaces filhas
  const [refreshKeyPecas, setRefreshKeyPecas] = useState(0);
  const [refreshKeyOCR, setRefreshKeyOCR] = useState(0);

  const handleUpload = async (file: File) => {
    await uploadFileToServer(Number(id), file);
    setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
  };

  const handleExtrairTexto = async (fileId: number) => {
    const ok = await extracDocumentWithOCR(Number(id), fileId);

    if (ok) {
      setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
      setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
      //console.log("transferido");
    } else {
      console.log("houve um erro na transferência do arquivo!");
    }
  };
  //Deleta o registro extraído com OCR
  const handleDeleteOCR = async (fileId: number) => {
    try {
      const sucesso = await deleteOcrdocByIdDoc(fileId);
      if (sucesso) {
        setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
        //console.log("Deletado com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  //Deleta o registro extraído com OCR
  const handleDeletePDF = async (fileId: number) => {
    try {
      const sucesso = await deleteUploadFileById(fileId);
      if (sucesso) {
        //setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
        setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
        //console.log("Deletado com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
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
        Formação do Contexto Processual - Upload de Peças - Contexto nº {id}
      </Typography>

      <Grid container spacing={2}>
        {/* COL-01 - Seleção dos arquivos a transferir */}
        <Grid size={{ xs: 11, sm: 10, md: 7, lg: 4, xl: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <SelectPecas onUpload={handleUpload} />
          </Paper>
        </Grid>

        {/*COL-2 Arquivos transferidos por upload */}
        <Grid size={{ xs: 11, sm: 10, md: 7, lg: 4, xl: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">Documentos transferidos</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            {/* <Typography variant="subtitle1">Peças Vinculadas</Typography> */}
            <ListaPecas
              processoId={id!}
              onView={() => {}}
              onExtract={handleExtrairTexto}
              refreshKey={refreshKeyPecas}
              onDelete={handleDeletePDF}
            />
          </Paper>
        </Grid>

        {/*COL-3 Arquivos transferidos por upload */}
        <Grid size={{ xs: 11, sm: 10, md: 7, lg: 4, xl: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">
              Documentos extraídos por OCR
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            {/* <Typography variant="subtitle1">Peças Extraídas por OCR</Typography> */}
            <ListaOCR
              processoId={id!}
              onView={handleAbrirDialog}
              onExtract={handleExtrairTexto}
              onDelete={handleDeleteOCR}
              refreshKey={refreshKeyOCR}
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
          {/* Botão de cópia no topo, à direita */}
          <IconButton
            onClick={handleCopyText}
            title="Copiar para área de transferência"
            sx={{ position: "absolute", right: 48, top: 8 }}
          >
            <ContentCopy />
          </IconButton>
          {/* Botão de fechar no topo, à direita */}
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
