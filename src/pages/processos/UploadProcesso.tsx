/**
 * File: UploadProcesso.tsx
 * Criação:  14/06/2025
 * Revisão:  13/08/2025
 * Janela para formação do contexto processual.
 */

import { useNavigate, useParams } from "react-router-dom";
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
  Stack,
  Tooltip,
} from "@mui/material";
import { SelectPecas } from "./SelectPecas";
import { ListaPecas } from "./ListaPecas";
import { useEffect, useRef, useState } from "react";

import {
  autuarDocumentos,
  deleteOcrdocByIdDoc,
  deleteUploadFileById,
  extractDocumentWithOCR,
  formatNumeroProcesso,
  getContextoByIdCtxt,
  uploadFileToServer,
} from "../../shared/services/api/fetch/apiTools";
import { ListaDocumentos } from "./ListaDocumentos";
import {
  Balance,
  ChevronLeft,
  ChevronRight,
  Close,
  ContentCopy,
  Delete,
  PostAdd,
} from "@mui/icons-material";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import { useDrawerContext } from "../../shared/contexts/DrawerProvider";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

type AutuarResponse = {
  extractedErros?: string[];
  extractedFiles?: string[];
};

export const UploadProcesso = () => {
  const { id: idCtxt } = useParams();
  const idCtxtNum = idCtxt;
  const [processo, setProcesso] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textoOCR, setTextoOCR] = useState("");
  const [idPJE, setIdPJE] = useState("");
  const [idDoc, setIdDoc] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);

  const [docsList, setDocsList] = useState<
    { id: string; pje: string; texto: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Refresh das listas
  const [refreshKeyPecas, setRefreshKeyPecas] = useState(0);
  const [refreshKeyOCR, setRefreshKeyOCR] = useState(0);

  const { showFlashMessage } = useFlash();
  const [isLoading, setLoading] = useState(false);
  const { setTituloJanela } = useDrawerContext();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // IDs em processamento (evita duplo clique / repetição)
  const [autuandoIds, setAutuandoIds] = useState<Record<string, boolean>>({});

  // Travas e cache anti-duplicidade
  const mountedRef = useRef(true);
  const callLockRef = useRef(false); // trava síncrona para lote
  const recentlyProcessedIdsRef = useRef<Set<string>>(new Set()); // cache sessão

  // dentro do componente UploadProcesso
  const navigate = useNavigate(); // ✅ instância de navegação

  useEffect(() => {
    if (currentIndex >= docsList.length) {
      setCurrentIndex(docsList.length - 1);
    }
  }, [docsList]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // título
  useEffect(() => {
    //console.log(processo);
    setTituloJanela(
      `Formação do Contexto - Processo ${formatNumeroProcesso(processo)}`
    );
  }, [processo, setTituloJanela]);

  // foco inicial no botão fechar do dialog
  useEffect(() => {
    if (dialogOpen) {
      const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [dialogOpen]);

  // carrega dados do contexto
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        if (!idCtxt) {
          if (!cancelled && mountedRef.current) setProcesso("");
          return;
        }
        const rsp = await getContextoByIdCtxt(idCtxt);
        //console.log(rsp);
        if (rsp) {
          if (!cancelled && mountedRef.current) {
            //console.log(rsp[0].nr_proc);
            setProcesso(rsp[0].nr_proc ?? "");
          }
        }
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg,
        });
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idCtxt, showFlashMessage]);

  function markAutuando(ids: string[], value: boolean) {
    setAutuandoIds((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = value));
      return next;
    });
  }

  // Upload
  async function handleUpload(file: File) {
    try {
      if (!idCtxtNum) return; // ✅ garante string
      setLoading(true);
      await uploadFileToServer(idCtxtNum, file);
      if (mountedRef.current) {
        setRefreshKeyPecas((prev) => prev + 1);
        showFlashMessage("Arquivo enviado com sucesso!", "success");
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API:", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro no upload",
        details: techMsg,
      });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // OCR
  async function handleExtrairTexto(fileId: number) {
    try {
      if (!idCtxtNum) return; // ✅ garante string
      setLoading(true);
      const ok = await extractDocumentWithOCR(idCtxtNum, fileId);
      if (mountedRef.current) {
        if (ok) {
          setRefreshKeyOCR((p) => p + 1);
          setRefreshKeyPecas((p) => p + 1);
          showFlashMessage("OCR realizado com sucesso!", "success");
        } else {
          showFlashMessage("Erro ao realizar OCR!", "error");
        }
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API:", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro",
        details: techMsg,
      });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // Deleta o registro extraído com OCR
  async function handleDeleteOCR(fileId: string) {
    try {
      setLoading(true);
      const ok = await deleteOcrdocByIdDoc(fileId);
      if (mountedRef.current) {
        if (ok) {
          setRefreshKeyOCR((prev) => prev + 1);
          handleNext();

          showFlashMessage("Texto OCR excluído com sucesso!", "success");
        }
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API:", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro",
        details: techMsg,
      });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // Deleta o arquivo PDF
  async function handleDeletePDF(fileId: number) {
    try {
      setLoading(true);
      const ok = await deleteUploadFileById(fileId);
      if (mountedRef.current) {
        if (ok) {
          setRefreshKeyPecas((prev) => prev + 1);

          showFlashMessage("PDF excluído com sucesso!", "success");
        } else {
          showFlashMessage("Erro ao excluir PDF!", "error");
        }
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API:", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro",
        details: techMsg,
      });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // Abrir/fechar dialog
  // function handleAbrirDialog(idDocX: string, pje: string, texto: string) {
  //   setIdDoc(idDocX);
  //   setTextoOCR(texto);
  //   setIdPJE(pje);
  //   setDialogOpen(true);
  // }
  function handleAbrirDialog(idDocX: string, pje: string, texto: string) {
    setIdDoc(idDocX);
    setTextoOCR(texto);
    setIdPJE(pje);

    const index = docsList.findIndex((d) => d.id === idDocX);
    setCurrentIndex(index);

    setDialogOpen(true);
  }

  function handleFecharDialog() {
    setDialogOpen(false);
    //setTextoOCR("");
  }

  // Copiar/fechar snackbar
  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(textoOCR);
      if (mountedRef.current) {
        setSnackbarError(false);
        setSnackbarOpen(true);
      }
    } catch {
      if (mountedRef.current) {
        setSnackbarError(true);
        setSnackbarOpen(true);
      }
    }
  }
  function handleSnackbarClose() {
    setSnackbarOpen(false);
  }

  // Autuar 1 (com cache “recentemente processado”)
  async function handleAutuar(idFile: string) {
    if (autuandoIds[idFile] || recentlyProcessedIdsRef.current.has(idFile))
      return;

    markAutuando([idFile], true);
    try {
      if (!idCtxtNum) return; // ✅ garante string
      setLoading(true);
      const payload = [{ IdContexto: idCtxtNum, IdDoc: idFile }];
      const rsp = (await autuarDocumentos(payload)) as AutuarResponse | null;

      if (!mountedRef.current) return;

      if (rsp && Array.isArray(rsp.extractedErros)) {
        if (rsp.extractedErros.length === 0) {
          showFlashMessage("Documento juntado com sucesso!", "success");
          setRefreshKeyOCR((p) => p + 1);

          // marca como processado recentemente (janela anti-reenvio)
          recentlyProcessedIdsRef.current.add(idFile);
          setTimeout(
            () => recentlyProcessedIdsRef.current.delete(idFile),
            30_000
          );

          if (idDoc === idFile) setDialogOpen(false);
        } else {
          showFlashMessage(
            `Falha ao autuar: ${rsp.extractedErros.join(", ")}`,
            "warning"
          );
          setRefreshKeyOCR((p) => p + 1);
        }
      } else if (rsp) {
        showFlashMessage("Nenhum documento juntado!", "warning");
      } else {
        showFlashMessage("Erro ao juntar documento!", "error");
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API:", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro",
        details: techMsg,
      });
    } finally {
      if (mountedRef.current) {
        markAutuando([idFile], false);
        setLoading(false);
      }
    }
  }

  // Autuar múltipla (com trava síncrona)
  async function handleAutuarMultipla(ids: string[]) {
    if (callLockRef.current) return; // trava anti duplo-clique
    callLockRef.current = true;

    const initial = [...ids];

    try {
      const pendentes = initial.filter(
        (id) => !autuandoIds[id] && !recentlyProcessedIdsRef.current.has(id)
      );
      if (pendentes.length === 0) return;

      // ✅ GARANTE que IdContexto é string
      if (!idCtxtNum) {
        showFlashMessage(
          "Contexto inválido (id ausente).",
          "error",
          TIME_FLASH_ALERTA_SEC * 5
        );
        return;
      }

      markAutuando(pendentes, true);
      setLoading(true);

      const payload = pendentes.map((id) => ({
        IdContexto: idCtxtNum,
        IdDoc: id,
      }));

      const rsp = (await autuarDocumentos(payload)) as AutuarResponse | null;

      if (!mountedRef.current) return;

      if (rsp && Array.isArray(rsp.extractedErros)) {
        const failed = new Set(rsp.extractedErros);
        const okIds = pendentes.filter((id) => !failed.has(id));

        okIds.forEach((id) => recentlyProcessedIdsRef.current.add(id));
        setTimeout(
          () =>
            okIds.forEach((id) => recentlyProcessedIdsRef.current.delete(id)),
          30_000
        );

        if (failed.size === 0) {
          showFlashMessage("Documentos juntados com sucesso!", "success");
        } else {
          showFlashMessage(
            `Alguns documentos falharam: ${[...failed].join(", ")}`,
            "warning"
          );
        }
        setRefreshKeyOCR((p) => p + 1);
      } else if (rsp) {
        showFlashMessage("Nenhum documento juntado.", "warning");
      } else {
        showFlashMessage("Erro ao juntar documentos!", "error");
      }

      // cooldown para ES/OpenSearch refletirem a deleção em autos_temp
      await new Promise((r) => setTimeout(r, 250));
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API:", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro",
        details: techMsg,
      });
    } finally {
      if (mountedRef.current) {
        markAutuando(initial, false);
        setLoading(false);
      }
      setTimeout(() => {
        callLockRef.current = false;
      }, 200);
    }
  }

  const handleAnalisesClick = () => {
    if (idCtxt) navigate(`/processos/analises/${idCtxt}`);
  };

  //Janela Dialog
  function handleNext() {
    if (docsList.length === 0) return;
    const next = currentIndex + 1;
    if (next < 0 || next >= docsList.length) return;
    const d = docsList[next];
    if (!d) return;
    setCurrentIndex(next);
    setIdDoc(d.id);
    setIdPJE(d.pje);
    setTextoOCR(d.texto);
  }
  //Janela Dialog
  function handlePrev() {
    if (docsList.length === 0) return;
    const prev = currentIndex - 1;
    if (prev < 0 || prev >= docsList.length) return;
    const d = docsList[prev];
    if (!d) return;
    setCurrentIndex(prev);
    setIdDoc(d.id);
    setIdPJE(d.pje);
    setTextoOCR(d.texto);
  }

  const isAutuandoAtual = !!(idDoc && autuandoIds[idDoc]);

  return (
    <Box p={2}>
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

        {/* COL-2 Arquivos transferidos por upload */}
        <Grid size={{ xs: 11, sm: 10, md: 7, lg: 3, xl: 3 }}>
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

        {/* COL-3 Peças processuais */}
        <Grid size={{ xs: 11, sm: 10, md: 7, lg: 5, xl: 5 }}>
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
            {/* ✅ Botão para abrir janela de análise */}
            <Tooltip title="Análise Jurídica">
              <IconButton color="inherit" onClick={handleAnalisesClick}>
                <Balance /> {/* ou outro ícone, como <Send /> */}
              </IconButton>
            </Tooltip>
          </Paper>

          <Paper sx={{ p: 2, mb: 2, maxHeight: 720, overflow: "hidden" }}>
            <ListaDocumentos
              idCtxt={idCtxt!}
              onView={handleAbrirDialog}
              onJuntada={handleAutuar}
              onJuntadaMultipla={handleAutuarMultipla}
              onDelete={handleDeleteOCR}
              refreshKey={refreshKeyOCR}
              loading={isLoading}
              onLoadList={setDocsList} // ✅ Adicionado
              currentId={idDoc} // ✅ Aqui
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog para exibir texto OCR */}
      <Dialog
        open={dialogOpen}
        onClose={handleFecharDialog}
        maxWidth={false} // ❗ importante para permitir largura customizada
        fullWidth={false} // evita que ocupe a tela toda
        PaperProps={{
          sx: {
            position: "fixed",
            left: 0,
            top: 0,
            height: "100vh",
            width: "55vw",
            m: 5,
            borderRadius: 0,
            transform: dialogOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s ease-in-out",
          },
        }}
      >
        <DialogTitle id="ocr-dialog-title" sx={{ pr: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" sx={{ mr: 1 }}>
              ID:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {idPJE}
            </Typography>
            <IconButton
              onClick={handlePrev}
              disabled={currentIndex <= 0 || docsList.length === 0}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={handleNext}
              disabled={
                currentIndex === -1 || currentIndex >= docsList.length - 1
              }
            >
              <ChevronRight />
            </IconButton>
          </Stack>

          {/* Ações no título */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Tooltip title="Excluir texto OCR">
              <span>
                <IconButton
                  onClick={() => handleDeleteOCR(idDoc)}
                  aria-label="Excluir texto OCR"
                  disabled={isLoading}
                >
                  <Delete />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Copiar texto">
              <span>
                <IconButton
                  onClick={handleCopyText}
                  aria-label="Copiar texto OCR"
                >
                  <ContentCopy />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Autuar nos autos">
              <span>
                <IconButton
                  onClick={() => handleAutuar(idDoc)}
                  aria-label="Juntar aos autos"
                  disabled={isLoading || isAutuandoAtual}
                >
                  <PostAdd />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Fechar">
              <span>
                <IconButton
                  onClick={handleFecharDialog}
                  aria-label="Fechar"
                  ref={closeBtnRef}
                >
                  <Close />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </DialogTitle>

        <DialogContent id="ocr-dialog-content" dividers>
          <TextField
            value={textoOCR}
            multiline
            fullWidth
            minRows={15}
            variant="outlined"
            slotProps={{
              input: { readOnly: true },
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar de cópia */}
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
