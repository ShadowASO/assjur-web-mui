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
  autuarDocumentos,
  deleteOcrdocByIdDoc,
  deleteUploadFileById,
  extracDocumentWithOCR,
  uploadFileToServer,
} from "../../shared/services/api/fetch/apiTools";
import { ListaOCR } from "./ListaOCR";
import { Close, ContentCopy } from "@mui/icons-material";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { useFlash } from "../../shared/contexts/FlashProvider";

export const UploadProcesso = () => {
  const { id: idCtxt } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textoOCR, setTextoOCR] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  //Refresh das interfaces filhas
  const [refreshKeyPecas, setRefreshKeyPecas] = useState(0);
  const [refreshKeyOCR, setRefreshKeyOCR] = useState(0);
  const { showFlashMessage } = useFlash();
  const [isLoading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    await uploadFileToServer(Number(idCtxt), file);
    setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
  };

  const handleExtrairTexto = async (fileId: number) => {
    try {
      setLoading(true);
      const ok = await extracDocumentWithOCR(Number(idCtxt), fileId);
      setLoading(false);

      if (ok) {
        setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
        setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
        showFlashMessage(
          "OCR realizado com sucesso!",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
      } else {
        console.log("houve um erro na transferência do arquivo!");
        showFlashMessage(
          "Erro ao realizar OCR!",
          "error",
          TIME_FLASH_ALERTA_SEC
        );
      }
    } catch (error) {
      console.log(error);
      showFlashMessage("Erro ao realizar OCR!", "error", TIME_FLASH_ALERTA_SEC);
    } finally {
      setLoading(false);
    }
  };
  //Deleta o registro extraído com OCR
  const handleDeleteOCR = async (fileId: number) => {
    try {
      setLoading(true);
      const ok = await deleteOcrdocByIdDoc(fileId);
      setLoading(false);
      if (ok) {
        setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
        showFlashMessage(
          "Texto OCR excluído com sucesso!",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      showFlashMessage(
        "Erro ao reqalizar a exclusão do OCR!",
        "error",
        TIME_FLASH_ALERTA_SEC
      );
    } finally {
      setLoading(false);
    }
  };

  //Deleta o arquivo PDF
  const handleDeletePDF = async (fileId: number) => {
    try {
      setLoading(true);
      const ok = await deleteUploadFileById(fileId);
      if (ok) {
        setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
        showFlashMessage(
          "PDF excluído com sucesso!",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
        //console.log("Deletado com sucesso!");
      } else {
        showFlashMessage(
          "Erro ao exccluir PDF!",
          "error",
          TIME_FLASH_ALERTA_SEC
        );
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      showFlashMessage("Erro ao exccluir PDF!", "error", TIME_FLASH_ALERTA_SEC);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirDialog = (texto: string) => {
    setTextoOCR(texto);
    setDialogOpen(true);
  };
  const handleJuntarOCR = async (idFile: number) => {
    try {
      setLoading(true);
      const rsp = await autuarDocumentos([
        { IdContexto: Number(idCtxt), IdDoc: idFile },
      ]);
      setLoading(false);
      if (rsp) {
        showFlashMessage(
          "Documento juntado com sucesso!",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
        setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
      } else {
        showFlashMessage(
          "Erro ao juntar documento!",
          "error",
          TIME_FLASH_ALERTA_SEC
        );
      }
    } catch (err) {
      setLoading(false);
      console.error("Erro ao juntar o documento:", err);
      showFlashMessage(
        "Erro ao juntar o documento",
        "error",
        TIME_FLASH_ALERTA_SEC
      );
    } finally {
      setLoading(false);
    }
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
        Formação do Contexto Processual - Upload de Peças - Contexto nº {idCtxt}
      </Typography>

      <Grid container spacing={2}>
        {/* COL-01 - Seleção dos arquivos a transferir */}
        <Grid size={{ xs: 11, sm: 10, md: 7, lg: 4, xl: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <SelectPecas onUpload={handleUpload} loading={isLoading} />
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
              processoId={idCtxt!}
              onView={() => {}}
              onExtract={handleExtrairTexto}
              refreshKey={refreshKeyPecas}
              onDelete={handleDeletePDF}
              loading={isLoading}
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
              processoId={idCtxt!}
              onView={handleAbrirDialog}
              onJuntada={handleJuntarOCR}
              onDelete={handleDeleteOCR}
              refreshKey={refreshKeyOCR}
              loading={isLoading}
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
            <Typography variant="body2">Copiar</Typography>
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
