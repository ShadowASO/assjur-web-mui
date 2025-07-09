/**
 * File: UploadProcesso.tsx
 * Criação:  14/06/2025
 * Janela para formação do contexto processual, permitindo ao usuário
 * selecionar arquivos pdf, enviá-los para o servidor(upload), extrair
 * o texto com o uso de OCR e fazer a juntada do documentos aos autos,
 * com prévia análise pela IA.
 *
 */

import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
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
  juntadaByContexto,
  uploadFileToServer,
} from "../../shared/services/api/fetch/apiTools";
import { ListaOCR } from "./ListaOCR";
import { Close, ContentCopy, DocumentScanner } from "@mui/icons-material";
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

  // const handleExtrairByContexto = async () => {
  //   try {
  //     setLoading(true);
  //     const ok = await extracWithOCRByContexto(Number(idCtxt));
  //     setLoading(false);

  //     if (ok) {
  //       setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
  //       setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
  //       showFlashMessage("OCR realizado com sucesso!", "success");
  //     } else {
  //       console.log("houve um erro na transferência do arquivo!");
  //       showFlashMessage("Erro ao realizar OCR!", "error");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     showFlashMessage("Erro ao realizar OCR!", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleJuntadaByContexto = async () => {
    try {
      setLoading(true);
      const ok = await juntadaByContexto(Number(idCtxt));
      setLoading(false);

      if (ok) {
        setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
        setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
        showFlashMessage("OCR realizado com sucesso!", "success");
      } else {
        console.log("houve um erro na transferência do arquivo!");
        showFlashMessage("Erro ao realizar OCR!", "error");
      }
    } catch (error) {
      console.log(error);
      showFlashMessage("Erro ao realizar OCR!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExtrairTexto = async (fileId: number) => {
    try {
      setLoading(true);
      const ok = await extracDocumentWithOCR(Number(idCtxt), fileId);
      setLoading(false);

      if (ok) {
        setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
        setRefreshKeyPecas((prev) => prev + 1); // Força refresh da lista de peças
        showFlashMessage("OCR realizado com sucesso!", "success");
      } else {
        console.log("houve um erro na transferência do arquivo!");
        showFlashMessage("Erro ao realizar OCR!", "error");
      }
    } catch (error) {
      console.log(error);
      showFlashMessage("Erro ao realizar OCR!", "error");
    } finally {
      setLoading(false);
    }
  };
  //Deleta o registro extraído com OCR
  const handleDeleteOCR = async (fileId: string) => {
    try {
      setLoading(true);
      const ok = await deleteOcrdocByIdDoc(fileId);
      setLoading(false);
      if (ok) {
        setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
        showFlashMessage("Texto OCR excluído com sucesso!", "success");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      showFlashMessage("Erro ao reqalizar a exclusão do OCR!", "error");
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
        showFlashMessage("PDF excluído com sucesso!", "success");
        //console.log("Deletado com sucesso!");
      } else {
        showFlashMessage("Erro ao exccluir PDF!", "error");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      showFlashMessage("Erro ao exccluir PDF!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirDialog = (texto: string) => {
    setTextoOCR(texto);
    setDialogOpen(true);
  };
  const handleJuntarOCR = async (idFile: string) => {
    try {
      setLoading(true);
      const rsp = await autuarDocumentos([
        { IdContexto: Number(idCtxt), IdDoc: idFile },
      ]);
      setLoading(false);
      if (rsp) {
        showFlashMessage("Documento juntado com sucesso!", "success");
        setRefreshKeyOCR((prev) => prev + 1); // Força refresh da lista OCR
      } else {
        showFlashMessage("Erro ao juntar documento!", "error");
      }
    } catch (err) {
      setLoading(false);
      console.error("Erro ao juntar o documento:", err);
      showFlashMessage("Erro ao juntar o documento", "error");
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
            <Typography variant="subtitle1">Arquivos selecionados</Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 2, maxHeight: 720, overflow: "hidden" }}>
            <SelectPecas onUpload={handleUpload} loading={isLoading} />
          </Paper>
        </Grid>

        {/*COL-2 Arquivos transferidos por upload */}
        <Grid size={{ xs: 11, sm: 10, md: 7, lg: 4, xl: 4 }}>
          <Paper
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1">Documentos transferidos</Typography>
          </Paper>

          <Paper sx={{ p: 2, mb: 2, maxHeight: 720, overflow: "hidden" }}>
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
          <Paper
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1">Peças processuais</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={handleJuntadaByContexto}
              disabled={isLoading}
            >
              <Typography variant="body2">Juntada</Typography>
              <DocumentScanner fontSize="small" sx={{ ml: 2 }} />
            </Button>
          </Paper>

          <Paper sx={{ p: 2, mb: 2, maxHeight: 720, overflow: "hidden" }}>
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
