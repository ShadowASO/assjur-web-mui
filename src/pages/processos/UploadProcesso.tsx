/**
 * File: UploadProcesso.tsx
 * Criação:  14/06/2025
 * Revisão:  13/08/2025
 * Janela para formação do contexto processual.
 *
 * Backend (Gin) retorna:
 * {
 *   sucesso: boolean,
 *   extractedErros: string[],
 *   extractedFiles: string[],
 *   message: string
 * }
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
import { useEffect, useRef, useState } from "react";

import { SelectPecas } from "./SelectPecas";
import { ListaArquivos } from "./ListaArquivos";
import { ListaDocumentos } from "./ListaDocumentos";

import {
  autuarDocumentos,
  deleteDocByIdDoc,
  deleteUploadFileById,
  extractDocument,
  formatNumeroProcesso,
  getContextoByIdCtxt,
  uploadFileToServer,
} from "../../shared/services/api/fetch/apiTools";

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

/** =========================
 * Tipos de resposta (backend)
 * ========================= */

export interface AutuarResponse {
  sucesso: boolean;
  extractedErros: string[];
  extractedFiles: string[];
  message: string;
}

type NormalizedAutuarResult = {
  sucesso: boolean;
  message?: string;
  extractedErros: string[];
  extractedFiles: string[];
};

/** =========================
 * Helpers de normalização
 * ========================= */

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Normaliza:
 * - axios envelope: { data: ... }
 * - resposta direta do backend
 */
function normalizeAutuarResponse(raw: unknown): NormalizedAutuarResult | null {
  const rec0 = asRecord(raw);
  if (rec0 && "data" in rec0) {
    return normalizeAutuarResponse(rec0.data);
  }

  const rec = asRecord(raw);
  if (!rec) return null;

  const sucesso = rec.sucesso;
  if (typeof sucesso !== "boolean") return null;

  const message =
    typeof rec.message === "string"
      ? rec.message
      : typeof rec.mensagem === "string"
        ? rec.mensagem
        : undefined;

  const extractedErros = normalizeStringArray(rec.extractedErros);
  const extractedFiles = normalizeStringArray(rec.extractedFiles);

  return { sucesso, message, extractedErros, extractedFiles };
}

/** =========================
 * Componente
 * ========================= */

export const UploadProcesso = () => {
  const { id: idCtxt } = useParams();
  const idCtxtNum = idCtxt;

  const [processo, setProcesso] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textoDoc, setTextoDoc] = useState("");
  const [idPJE, setIdPJE] = useState("");
  const [idDoc, setIdDoc] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);

  const [docsList, setDocsList] = useState<
    { id: string; pje: string; texto: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const [refreshKeyPecas, setRefreshKeyPecas] = useState(0);
  const [refreshKeyDoc, setRefreshKeyDoc] = useState(0);

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

  // ✅ default: false (desmarcado) => filtra "Outros Documentos"
  //const [exibirOutrosDocs, setExibirOutrosDocs] = useState(false);

  const [exibirOutrosDocs, setExibirOutrosDocs] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (currentIndex >= docsList.length) {
      setCurrentIndex(docsList.length - 1);
    }
  }, [docsList, currentIndex]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setTituloJanela(
      `Formação do Contexto - Processo ${formatNumeroProcesso(processo)}`,
    );
  }, [processo, setTituloJanela]);

  useEffect(() => {
    if (dialogOpen) {
      const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [dialogOpen]);

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
        if (rsp && rsp[0]) {
          if (!cancelled && mountedRef.current) {
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

  useEffect(() => {
    if (!dialogOpen) return;

    const idx = docsList.findIndex((d) => d.id === idDoc);

    if (idx === -1) {
      // o item atual ficou oculto pelo filtro
      // opção 1: fecha o dialog
      setDialogOpen(false);

      // (ou opção 2: vai para o primeiro disponível)
      // if (docsList[0]) {
      //   setCurrentIndex(0);
      //   setIdDoc(docsList[0].id);
      //   setIdPJE(docsList[0].pje);
      //   setTextoDoc(docsList[0].texto);
      // } else {
      //   setDialogOpen(false);
      // }
      return;
    }

    setCurrentIndex(idx);
  }, [docsList, idDoc, dialogOpen]);

  function markAutuando(ids: string[], value: boolean) {
    setAutuandoIds((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = value));
      return next;
    });
  }

  /** =========================
   * Upload
   * ========================= */
  async function handleUpload(file: File) {
    try {
      if (!idCtxtNum) return;
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

  /** =========================
   * Doc
   * ========================= */
  async function handleExtrairTexto(fileId: number) {
    try {
      if (!idCtxtNum) return;
      setLoading(true);
      const ok = await extractDocument(idCtxtNum, fileId);
      if (mountedRef.current) {
        if (ok) {
          setRefreshKeyDoc((p) => p + 1);
          setRefreshKeyPecas((p) => p + 1);
          showFlashMessage("Extração concluída!", "success");
        } else {
          showFlashMessage("Erro ao realizar extração!", "error");
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

  // ✅ delete “puro” (para lote): retorna boolean (pai pode reaproveitar), mas não faz efeitos de UI
  async function deleteDoc(fileId: string): Promise<boolean> {
    const ok = await deleteDocByIdDoc(fileId);
    return !!ok;
  }

  // ✅ delete do Dialog (unitário): estável e sem corrida com handleNext
  async function handleDeleteDoc(fileId: string): Promise<void> {
    const id = (fileId ?? "").trim();
    if (!id) return;

    try {
      setLoading(true);

      const ok = await deleteDoc(id);

      if (!mountedRef.current) return;

      if (ok) {
        showFlashMessage("Texto excluído com sucesso!", "success");

        // força o filho recarregar (useEffect do filho depende do refreshKey)
        setRefreshKeyDoc((prev) => prev + 1);
        handleNext();
        showFlashMessage("Texto excluído com sucesso!", "success");

        // fecha o dialog para evitar apontar para item que sumiu
        //setDialogOpen(false);

        // limpa estado do dialog (evita “fantasma”)
        // setIdDoc("");
        // setIdPJE("");
        // setTextoDoc("");
        // setCurrentIndex(-1);
        return;
      }

      showFlashMessage("Erro ao excluir texto!", "error");
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

  /** =========================
   * Dialog
   * ========================= */
  function handleAbrirDialog(idDocX: string, pje: string, texto: string) {
    setIdDoc(idDocX);
    setTextoDoc(texto);
    setIdPJE(pje);

    const index = docsList.findIndex((d) => d.id === idDocX);
    setCurrentIndex(index);

    setDialogOpen(true);
  }

  function handleFecharDialog() {
    setDialogOpen(false);
  }

  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(textoDoc);
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

  /** =========================
   * Autuar 1
   * ========================= */
  async function handleAutuar(idFile: string) {
    const id = (idFile ?? "").trim();
    if (!id) return;

    if (autuandoIds[id] || recentlyProcessedIdsRef.current.has(id)) return;

    if (!idCtxtNum) {
      showFlashMessage(
        "Contexto inválido. Selecione ou abra um processo antes de autuar.",
        "warning",
      );
      return;
    }

    markAutuando([id], true);
    setLoading(true);

    try {
      const payload = [{ IdContexto: idCtxtNum, IdDoc: id }];
      const raw = await autuarDocumentos(payload);

      if (!mountedRef.current) return;

      const rsp = normalizeAutuarResponse(raw);

      if (!rsp) {
        showFlashMessage(
          "Autuação enviada, mas a resposta do servidor veio em formato inesperado.",
          "warning",
          TIME_FLASH_ALERTA_SEC * 5,
          { title: "Aviso", details: JSON.stringify(raw) },
        );
        setRefreshKeyDoc((p) => p + 1);
        return;
      }

      if (rsp.sucesso) {
        showFlashMessage(
          rsp.message ?? "Documento juntado com sucesso!",
          "success",
        );
        setRefreshKeyDoc((p) => p + 1);

        recentlyProcessedIdsRef.current.add(id);
        setTimeout(() => recentlyProcessedIdsRef.current.delete(id), 30_000);

        if (idDoc === id) setDialogOpen(false);
        return;
      }

      if (rsp.extractedErros.length > 0) {
        showFlashMessage(
          `Falha ao autuar: ${rsp.extractedErros.join(", ")}`,
          "warning",
        );
      } else {
        showFlashMessage(rsp.message ?? "Erro ao juntar documento.", "error");
      }
      setRefreshKeyDoc((p) => p + 1);
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API:", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro",
        details: techMsg,
      });
    } finally {
      if (mountedRef.current) {
        markAutuando([id], false);
        setLoading(false);
      }
    }
  }

  /** =========================
   * Autuar múltipla
   * ========================= */
  async function handleAutuarMultipla(ids: string[]) {
    if (callLockRef.current) return;
    callLockRef.current = true;

    const uniqueIds = Array.from(
      new Set(ids.map((x) => (x ?? "").trim()).filter(Boolean)),
    );

    const pendentes = uniqueIds.filter(
      (id) => !autuandoIds[id] && !recentlyProcessedIdsRef.current.has(id),
    );

    if (pendentes.length === 0) {
      callLockRef.current = false;
      return;
    }

    if (!idCtxtNum) {
      showFlashMessage(
        "Contexto inválido (id ausente).",
        "error",
        TIME_FLASH_ALERTA_SEC * 5,
      );
      callLockRef.current = false;
      return;
    }

    markAutuando(pendentes, true);
    setLoading(true);

    try {
      const payload = pendentes.map((id) => ({
        IdContexto: idCtxtNum,
        IdDoc: id,
      }));

      const raw = await autuarDocumentos(payload);

      if (!mountedRef.current) return;

      const rsp = normalizeAutuarResponse(raw);

      if (!rsp) {
        showFlashMessage(
          "Autuação enviada, mas a resposta do servidor veio em formato inesperado.",
          "warning",
          TIME_FLASH_ALERTA_SEC * 5,
          { title: "Aviso", details: JSON.stringify(raw) },
        );
        setRefreshKeyDoc((p) => p + 1);
        return;
      }

      const failedSet = new Set(rsp.extractedErros);
      const okIds = pendentes.filter((id) => !failedSet.has(id));

      okIds.forEach((id) => recentlyProcessedIdsRef.current.add(id));
      setTimeout(() => {
        okIds.forEach((id) => recentlyProcessedIdsRef.current.delete(id));
      }, 30_000);

      if (rsp.sucesso) {
        if (failedSet.size === 0) {
          showFlashMessage(
            rsp.message ?? "Documentos juntados com sucesso!",
            "success",
          );
        } else {
          showFlashMessage(
            rsp.message ??
              `Alguns documentos falharam: ${[...failedSet].join(", ")}`,
            "warning",
          );
        }
        setRefreshKeyDoc((p) => p + 1);
      } else {
        const details =
          failedSet.size > 0
            ? `Falhas: ${[...failedSet].join(", ")}`
            : undefined;

        showFlashMessage(
          rsp.message ?? "Erro ao juntar documentos.",
          "error",
          TIME_FLASH_ALERTA_SEC * 5,
          details ? { title: "Erro", details } : undefined,
        );

        setRefreshKeyDoc((p) => p + 1);
      }

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
        markAutuando(pendentes, false);
        setLoading(false);
      }
      callLockRef.current = false;
    }
  }

  const handleAnalisesClick = () => {
    if (idCtxt) navigate(`/processos/analises/${idCtxt}`);
  };

  /** =========================
   * Navegação do Dialog
   * ========================= */
  function handleNext() {
    if (docsList.length === 0) return;
    const next = currentIndex + 1;
    if (next < 0 || next >= docsList.length) return;
    const d = docsList[next];
    if (!d) return;
    setCurrentIndex(next);
    setIdDoc(d.id);
    setIdPJE(d.pje);
    setTextoDoc(d.texto);
  }

  function handlePrev() {
    if (docsList.length === 0) return;
    const prev = currentIndex - 1;
    if (prev < 0 || prev >= docsList.length) return;
    const d = docsList[prev];
    if (!d) return;
    setCurrentIndex(prev);
    setIdDoc(d.id);
    setIdPJE(d.pje);
    setTextoDoc(d.texto);
  }

  const isAutuandoAtual = !!(idDoc && autuandoIds[idDoc]);

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {/* COL-01 - Seleção dos arquivos a transferir */}
        <Grid size={{ xs: 11, sm: 10, md: 7, lg: 4, xl: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">Arquivo selecionado</Typography>
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
            <Typography variant="subtitle1">Arquivos transferidos</Typography>
          </Paper>

          <Paper sx={{ p: 2, mb: 2, maxHeight: 720, overflow: "hidden" }}>
            <ListaArquivos
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

            <Tooltip title="Análise Jurídica">
              <IconButton color="inherit" onClick={handleAnalisesClick}>
                <Balance />
              </IconButton>
            </Tooltip>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              height: "calc(100vh - 250px)",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ListaDocumentos
              idCtxt={idCtxt!}
              onView={handleAbrirDialog}
              onJuntada={handleAutuar}
              onJuntadaMultipla={handleAutuarMultipla}
              onDelete={async (id) => {
                await deleteDoc(id); // boolean descartado para cumprir Promise<void>
              }}
              refreshKey={refreshKeyDoc}
              loading={isLoading}
              onLoadList={setDocsList}
              currentId={idDoc}
              exibirOutrosDocumentos={exibirOutrosDocs}
              onChangeExibirOutrosDocumentos={setExibirOutrosDocs}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog para exibir texto Doc */}
      <Dialog
        open={dialogOpen}
        onClose={handleFecharDialog}
        maxWidth={false}
        fullWidth={false}
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
        <DialogTitle id="doc-dialog-title" sx={{ pr: 2 }}>
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

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Tooltip title="Excluir texto">
              <span>
                <IconButton
                  onClick={() => handleDeleteDoc(idDoc)}
                  aria-label="Excluir texto"
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
                  aria-label="Copiar texto"
                  disabled={!textoDoc}
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
                  disabled={isLoading || isAutuandoAtual || !idDoc}
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

        <DialogContent id="doc-dialog-content" dividers>
          <TextField
            value={textoDoc}
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
