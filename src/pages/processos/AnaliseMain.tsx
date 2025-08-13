/**
 * File: AnaliseMain.tsx
 * Atualização: 12/08/2025
 */
import { ContentCopy, Delete, Save, Send } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import {
  deleteAutos,
  formatNumeroProcesso,
  getContextoById,
  insertDocumentoAutos,
  refreshAutos,
} from "../../shared/services/api/fetch/apiTools";
import type { AutosRow } from "../../shared/types/tabelas";
import { useApi } from "../../shared/contexts/ApiProvider";
import {
  type IOutputResponseItem,
  type IMessageResponseItem,
  type IResponseOpenaiApi,
  useMessageReponse,
} from "../../shared/services/query/QueryResponse";
import {
  getDocumentoName,
  NATU_DOC_IA_ANALISE,
  NATU_DOC_IA_SENTENCA,
} from "../../shared/constants/autosDoc";
import {
  getRespostaDescricao,
  RESPOSTA_RAG_CHAT,
  type RespostaRAG,
} from "../../shared/constants/respostaRag";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import { useDrawerContext } from "../../shared/contexts/DrawerProvider";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

type HSProps = import("react-syntax-highlighter").SyntaxHighlighterProps;
type PrismTheme = Record<string, React.CSSProperties>;

const SyntaxHighlighter = React.lazy<React.ComponentType<HSProps>>(async () => {
  const prismMod = await import("react-syntax-highlighter");
  const { duotoneLight } = (await import(
    "react-syntax-highlighter/dist/esm/styles/prism"
  )) as { duotoneLight: PrismTheme };

  const Comp: React.FC<HSProps> = (props) => (
    <prismMod.Prism style={duotoneLight} {...props} />
  );

  return { default: Comp };
});

/* ============== Hook simples de infinite slice com IntersectionObserver ============== */
function useInfiniteSlice<T>(items: T[], step = 30) {
  const [count, setCount] = useState(step);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // reset quando a lista muda
    setCount(step);
  }, [items, step]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setCount((prev) => Math.min(prev + step, items.length));
        }
      },
      { root: el.parentElement, rootMargin: "200px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items.length, step]);

  const visible = useMemo(() => items.slice(0, count), [items, count]);
  const hasMore = count < items.length;

  return { visible, hasMore, sentinelRef };
}

export const AnalisesMain = () => {
  const { id: idCtxt } = useParams();
  const { showFlashMessage } = useFlash();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const Api = useApi();
  const { setTituloJanela } = useDrawerContext();

  const [isLoading, setLoading] = useState(false);
  const [processo, setProcesso] = useState("");
  const [autos, setAutos] = useState<AutosRow[]>([]);
  const [minuta, setMinuta] = useState("");
  const [dialogo, setDialogo] = useState("");
  const [prompt, setPrompt] = useState("");
  const [prevId, setPrevId] = useState("");
  const [refreshPecas, setRefreshPecas] = useState(0);

  // tokens
  const [ptUso, setPtUso] = useState(0);
  const [ctUso, setCtUso] = useState(0);
  const [ttUso, setTtUso] = useState(0);

  // seleção
  const [selectedIdsAutos, setSelectedIdsAutos] = useState<string[]>([]);
  const [selectedIdsRag, setSelectedIdsRag] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState<null | "autos" | "rag">(null);

  const { addMessage, getMessages, addOutput, clearMessages } =
    useMessageReponse();

  const autosFiltrados = useMemo(
    () =>
      autos.filter(
        (reg) =>
          reg.id_natu !== NATU_DOC_IA_ANALISE &&
          reg.id_natu !== NATU_DOC_IA_SENTENCA
      ),
    [autos]
  );
  const ragFiltrados = useMemo(
    () =>
      autos.filter(
        (reg) =>
          reg.id_natu === NATU_DOC_IA_ANALISE ||
          reg.id_natu === NATU_DOC_IA_SENTENCA
      ),
    [autos]
  );

  // infinite slices
  const {
    visible: autosVisiveis,
    hasMore: autosHasMore,
    sentinelRef: autosSentinel,
  } = useInfiniteSlice(autosFiltrados, 40);
  const {
    visible: ragVisiveis,
    hasMore: ragHasMore,
    sentinelRef: ragSentinel,
  } = useInfiniteSlice(ragFiltrados, 40);

  // título
  useEffect(() => {
    setTituloJanela(
      `Análise Jurídica - Processo ${formatNumeroProcesso(processo)}`
    );
  }, [processo, setTituloJanela]);

  // carregar autos
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await refreshAutos(Number(idCtxt));
        setAutos(response?.length ? response : []);
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);
        console.error("API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg, // aparece no botão (i)
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [idCtxt, refreshPecas]);

  // processo + tokens
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!idCtxt) {
          setProcesso("");
          setPtUso(0);
          setCtUso(0);
          setTtUso(0);
          return;
        }
        const rsp = await getContextoById(idCtxt);
        if (rsp) {
          setPtUso(rsp.prompt_tokens ?? 0);
          setCtUso(rsp.completion_tokens ?? 0);
          setProcesso(rsp?.nr_proc ?? "");
        }
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);
        console.error("API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg, // aparece no botão (i)
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [idCtxt]);

  useEffect(() => {
    setTtUso((ptUso ?? 0) + (ctUso ?? 0));
  }, [ptUso, ctUso]);

  // seleção
  const handleSelectRowAutos = useCallback((id: string, checked: boolean) => {
    setSelectedIdsAutos((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  }, []);
  const handleSelectRowRag = useCallback((id: string, checked: boolean) => {
    setSelectedIdsRag((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  }, []);

  const allAutosIds = useMemo(
    () => autosFiltrados.map((r) => r.id),
    [autosFiltrados]
  );
  const allRagIds = useMemo(
    () => ragFiltrados.map((r) => r.id),
    [ragFiltrados]
  );

  const autosAllChecked =
    selectedIdsAutos.length === allAutosIds.length && allAutosIds.length > 0;
  const autosIndeterminate =
    selectedIdsAutos.length > 0 && selectedIdsAutos.length < allAutosIds.length;
  const ragAllChecked =
    selectedIdsRag.length === allRagIds.length && allRagIds.length > 0;
  const ragIndeterminate =
    selectedIdsRag.length > 0 && selectedIdsRag.length < allRagIds.length;

  const handleToggleAllAutos = useCallback(
    (checked: boolean) => setSelectedIdsAutos(checked ? allAutosIds : []),
    [allAutosIds]
  );
  const handleToggleAllRag = useCallback(
    (checked: boolean) => setSelectedIdsRag(checked ? allRagIds : []),
    [allRagIds]
  );

  // deleção
  const deleteByIds = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return { errors: 0 };
    const results = await Promise.all(ids.map((id) => deleteAutos(id)));
    return { errors: results.filter((ok) => !ok).length };
  }, []);

  const handleDeleteSelectedAutos = useCallback(async () => {
    if (!selectedIdsAutos.length) return;
    setLoading(true);
    try {
      const { errors } = await deleteByIds(selectedIdsAutos);
      setSelectedIdsAutos([]);
      setRefreshPecas((p) => p + 1);
      showFlashMessage(
        errors === 0
          ? "Autos excluídos com sucesso!"
          : "Erro ao excluir alguns autos.",
        errors === 0 ? "success" : "error"
      );
    } catch (e) {
      console.error(e);
      showFlashMessage("Erro inesperado ao excluir autos.", "error");
    } finally {
      setLoading(false);
    }
  }, [deleteByIds, selectedIdsAutos, showFlashMessage]);

  const handleDeleteSelectedRag = useCallback(async () => {
    if (!selectedIdsRag.length) return;
    setLoading(true);
    try {
      const { errors } = await deleteByIds(selectedIdsRag);
      setSelectedIdsRag([]);
      setRefreshPecas((p) => p + 1);
      showFlashMessage(
        errors === 0
          ? "Minutas excluídas com sucesso!"
          : "Erro ao excluir algumas minutas.",
        errors === 0 ? "success" : "error"
      );
    } catch (e) {
      console.error(e);
      showFlashMessage("Erro inesperado ao excluir minutas.", "error");
    } finally {
      setLoading(false);
    }
  }, [deleteByIds, selectedIdsRag, showFlashMessage]);

  // clipboard
  const copyToClipboard = useCallback(
    (texto: string, msgOk = "Copiado!") => {
      if (!texto) return;
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(texto).then(
          () => showFlashMessage(msgOk, "success"),
          () => showFlashMessage("Não foi possível copiar.", "warning")
        );
      } else {
        try {
          const ta = document.createElement("textarea");
          ta.value = texto;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          showFlashMessage(msgOk, "success");
        } catch {
          showFlashMessage("Não foi possível copiar.", "warning");
        }
      }
    },
    [showFlashMessage]
  );

  // salvar IA / RAG
  const handleSaveAnaliseByIA = useCallback(
    async (texto: string) => {
      if (!texto) {
        showFlashMessage(
          "Não há qualquer análise disponível para salvamento!",
          "warning"
        );
        return;
      }
      const idCtxtNum = Number(idCtxt);
      if (isNaN(idCtxtNum) || idCtxtNum <= 0) {
        showFlashMessage("Contexto inválido para salvar a análise!", "error");
        return;
      }
      setLoading(true);
      try {
        const ok = await insertDocumentoAutos(
          idCtxtNum,
          NATU_DOC_IA_ANALISE,
          "",
          texto,
          ""
        );
        showFlashMessage(
          ok ? "Análise salva com sucesso!" : "Erro ao salvar a análise!",
          ok ? "success" : "error"
        );
      } catch (error) {
        console.error("Erro ao acessar a API:", error);
        showFlashMessage("Erro inesperado ao salvar a análise.", "error");
      } finally {
        setLoading(false);
      }
    },
    [idCtxt]
  );

  // OpenAI helpers
  const getMessageOpenAi = useCallback(
    (out: IOutputResponseItem[]): IOutputResponseItem | undefined =>
      out.find((o) => o?.type === "message"),
    []
  );

  const funcToolSaveRAG = useCallback(
    async (rag: RespostaRAG) => {
      if (!rag.texto) {
        showFlashMessage(
          "Não há qualquer análise disponível para salvamento!",
          "warning"
        );
        return;
      }
      const idCtxtNum = Number(idCtxt);
      if (isNaN(idCtxtNum) || idCtxtNum <= 0) {
        showFlashMessage("Contexto inválido para salvar a análise!", "error");
        return;
      }
      setLoading(true);
      try {
        const ok = await insertDocumentoAutos(
          idCtxtNum,
          rag.tipo_resp,
          "",
          rag.texto,
          ""
        );
        showFlashMessage(
          ok ? "Análise salva com sucesso!" : "Erro ao salvar a análise!",
          ok ? "success" : "error"
        );
      } catch (error) {
        console.error("Erro ao acessar a API:", error);
        showFlashMessage("Erro inesperado ao salvar a análise.", "error");
      } finally {
        setLoading(false);
      }
    },
    [idCtxt]
  );

  const funcToolFormataResposta = useCallback(
    async (output: IOutputResponseItem) => {
      const maybeText = output?.content?.[0]?.text;
      if (!maybeText) return;
      try {
        const rawObj = JSON.parse(maybeText);
        const respostaObj: RespostaRAG = {
          tipo_resp: Number(rawObj.tipo_resp),
          texto: rawObj.texto,
        };
        if (respostaObj.tipo_resp === RESPOSTA_RAG_CHAT) {
          output.content[0].text = respostaObj.texto;
          addOutput(output);
          setDialogo(
            (prev) => (prev ? prev + "\n\n" : "") + output.content[0].text
          );
          setPrevId(output.id);
        } else {
          setMinuta(respostaObj.texto);
          await funcToolSaveRAG(respostaObj);
        }
      } catch {
        // fallback: texto bruto
        addOutput(output);
        setDialogo((prev) => (prev ? prev + "\n\n" : "") + maybeText);
        setPrevId(output.id);
      }
    },
    [addOutput, funcToolSaveRAG]
  );

  const handleSendPrompt = useCallback(async () => {
    if (!prompt.trim()) {
      showFlashMessage("Digite um prompt antes de enviar.", "warning", 3);
      return;
    }
    const userQuery: IMessageResponseItem = {
      id: prevId,
      role: "user",
      text: prompt,
    };
    setPrompt("");
    setLoading(true);
    addMessage(userQuery.id, userQuery.role, userQuery.text);
    try {
      const msg = getMessages();
      const payload = { id_ctxt: idCtxt, messages: msg, previd: prevId };
      const response = await Api.post("/contexto/query/rag", payload);
      if (response.ok && response.data) {
        const data = response.data as IResponseOpenaiApi;
        const out = getMessageOpenAi(data?.output);
        if (out) await funcToolFormataResposta(out);
        else setDialogo("");
      } else {
        setDialogo("");
      }
    } catch (error) {
      console.error("Erro ao acessar a API:", error);
      showFlashMessage("Erro ao consultar a IA.", "error");
    } finally {
      setLoading(false);
    }
  }, [
    Api,
    addMessage,
    funcToolFormataResposta,
    getMessageOpenAi,
    getMessages,
    idCtxt,
    prevId,
    prompt,
    showFlashMessage,
  ]);

  const handlerCleanChat = useCallback(() => {
    setPrevId("");
    setDialogo("");
    clearMessages();
  }, [clearMessages]);

  // JSON formatado (sem custo de highlight se Suspense ainda não carregou)
  const jsonFormatado = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(minuta), null, 2);
    } catch {
      return minuta;
    }
  }, [minuta]);

  return (
    <Box
      p={0}
      height="100%"
      display="flex"
      flexDirection="column"
      bgcolor={theme.palette.background.paper}
    >
      {isLoading && (
        <LinearProgress sx={{ position: "sticky", top: 0, zIndex: 1 }} />
      )}

      <Grid container spacing={1} padding={1} margin={1}>
        {/* COL-01: AUTOS + MINUTAS (Accordion para Minutas) */}
        <Grid
          size={{ xs: 12, sm: 6, md: 2, lg: 2, xl: 2 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 188px)",
            p: 2,
            gap: 2,
          }}
          component={Paper}
          elevation={3}
        >
          {/* AUTOS */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TableContainer sx={{ flex: 1, overflow: "auto" }}>
              <Table stickyHeader size="small" aria-label="Tabela de Autos">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ p: 1, width: 42 }}>
                      <Checkbox
                        checked={autosAllChecked}
                        indeterminate={autosIndeterminate}
                        onChange={(e) => handleToggleAllAutos(e.target.checked)}
                        disabled={isLoading || autosFiltrados.length === 0}
                        inputProps={{
                          "aria-label": "Selecionar todos os Autos",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 1 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight="bold">
                          Autos
                        </Typography>
                        <Tooltip
                          title={
                            selectedIdsAutos.length
                              ? `Excluir ${selectedIdsAutos.length} selecionado(s)`
                              : "Selecione itens para excluir"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setConfirmOpen("autos")}
                              disabled={
                                selectedIdsAutos.length === 0 || isLoading
                              }
                              aria-label="Excluir autos selecionados"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {autosVisiveis.map((reg) => (
                    <TableRow key={reg.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIdsAutos.includes(reg.id)}
                          onChange={(e) =>
                            handleSelectRowAutos(reg.id, e.target.checked)
                          }
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          if (reg.doc_json_raw) {
                            setMinuta(
                              typeof reg.doc_json_raw === "string"
                                ? reg.doc_json_raw
                                : JSON.stringify(reg.doc_json_raw, null, 4)
                            );
                          } else {
                            setMinuta("");
                          }
                        }}
                        sx={{ cursor: "pointer" }}
                      >
                        {getDocumentoName(reg.id_natu)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* sentinel para autos */}
                  {autosHasMore && (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ p: 0 }}>
                        <div ref={autosSentinel} style={{ height: 1 }} />
                      </TableCell>
                    </TableRow>
                  )}
                  {autosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="body2" color="text.secondary">
                          Nenhum auto listado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* MINUTAS: Accordion (fechado em telas pequenas, aberto em md+) */}
          <Accordion
            defaultExpanded={mdUp}
            disableGutters
            sx={{ flex: 1, minHeight: 0 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="minutas-content"
              id="minutas-header"
            >
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <Typography variant="h6" fontWeight="bold">
                  Minutas
                </Typography>

                {/* empurra o ícone para a direita (opcional) */}
                <Box sx={{ flex: 1 }} />

                <Tooltip
                  title={
                    selectedIdsRag.length
                      ? `Excluir ${selectedIdsRag.length} selecionada(s)`
                      : "Selecione itens para excluir"
                  }
                >
                  {/* Use <span> para evitar nested <button> e manter Tooltip quando disabled */}
                  <span
                    onClick={(e) => {
                      // evita abrir/fechar o accordion ao clicar no ícone
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <IconButton
                      component="span" // <-- rende como <span>, não <button>
                      size="small"
                      color="error"
                      onClick={() => setConfirmOpen("rag")}
                      disabled={selectedIdsRag.length === 0 || isLoading}
                      aria-label="Excluir minutas selecionadas"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                p: 0,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <TableContainer sx={{ flex: 1, overflow: "auto" }}>
                <Table stickyHeader size="small" aria-label="Tabela de Minutas">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ p: 1, width: 42 }}>
                        <Checkbox
                          checked={ragAllChecked}
                          indeterminate={ragIndeterminate}
                          onChange={(e) => handleToggleAllRag(e.target.checked)}
                          disabled={isLoading || ragFiltrados.length === 0}
                          inputProps={{
                            "aria-label": "Selecionar todas as Minutas",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>Itens</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ragVisiveis.map((reg) => (
                      <TableRow key={reg.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIdsRag.includes(reg.id)}
                            onChange={(e) =>
                              handleSelectRowRag(reg.id, e.target.checked)
                            }
                            disabled={isLoading}
                          />
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            if (
                              reg.id_natu === NATU_DOC_IA_ANALISE ||
                              reg.id_natu === NATU_DOC_IA_SENTENCA
                            ) {
                              setMinuta(reg.doc);
                            } else if (reg.doc_json_raw) {
                              setMinuta(
                                typeof reg.doc_json_raw === "string"
                                  ? reg.doc_json_raw
                                  : JSON.stringify(reg.doc_json_raw, null, 4)
                              );
                            } else {
                              setMinuta("");
                            }
                          }}
                          sx={{ cursor: "pointer" }}
                        >
                          {getRespostaDescricao(reg.id_natu)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* sentinel para rag */}
                    {ragHasMore && (
                      <TableRow>
                        <TableCell colSpan={2} sx={{ p: 0 }}>
                          <div ref={ragSentinel} style={{ height: 1 }} />
                        </TableCell>
                      </TableRow>
                    )}
                    {ragFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma resposta disponível.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* COL-02: COMPLETION + PROMPT */}
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
          <Paper
            elevation={3}
            sx={{
              height: "calc(100vh - 220px)",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                flexGrow: 1,
                mb: 1,
                p: 2,
                overflow: "auto",
                backgroundColor: theme.palette.background.default,
              }}
            >
              <ReactMarkdown>
                {getMessages()
                  .map(
                    (m) => (m.role === "user" ? "Usuário: " : "IA: ") + m.text
                  )
                  .join("\n\n")}
              </ReactMarkdown>
            </Paper>

            {/* TOKENS + AÇÕES */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              mb={1}
              mr={2}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Chip label={`Prompt: ${ptUso}`} size="small" />
                <Chip label={`Resposta: ${ctUso}`} size="small" />
                <Chip
                  label={`Total: ${ttUso}`}
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontWeight: "bold",
                  }}
                />
              </Stack>

              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Copiar diálogo">
                  <IconButton
                    size="medium"
                    onClick={() => copyToClipboard(dialogo, "Diálogo copiado!")}
                  >
                    <ContentCopy fontSize="medium" />
                    <Typography variant="body2" ml={0.5}>
                      Copiar
                    </Typography>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Limpar conversa">
                  <span>
                    <IconButton
                      size="medium"
                      onClick={handlerCleanChat}
                      edge="end"
                      disabled={isLoading}
                    >
                      <Delete fontSize="medium" />
                      <Typography variant="body2" ml={0.5}>
                        Limpar
                      </Typography>
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>

            {/* PROMPT */}
            <TextField
              label="Prompt"
              multiline
              minRows={4}
              fullWidth
              disabled={isLoading}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (
                  (e.key === "Enter" && !e.shiftKey) ||
                  (e.key === "Enter" && e.ctrlKey)
                ) {
                  e.preventDefault();
                  if (!isLoading) handleSendPrompt();
                }
              }}
              placeholder="Digite o prompt aqui..."
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "16px" },
                "& .MuiInputBase-root": { height: 150, overflow: "auto" },
                "& textarea": { height: "100% !important", overflow: "auto" },
              }}
              slotProps={{
                input: {
                  style: { padding: "24px" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box display="flex" flexDirection="column">
                        <IconButton
                          size="small"
                          onClick={handleSendPrompt}
                          edge="end"
                          title="Enviar"
                          disabled={isLoading}
                        >
                          <Send fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            copyToClipboard(prompt, "Prompt copiado!")
                          }
                          edge="end"
                          title="Copiar"
                          disabled={isLoading}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setPrompt("")}
                          edge="end"
                          title="Limpar"
                          disabled={isLoading}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                },
                inputLabel: { shrink: true },
              }}
            />
          </Paper>
        </Grid>

        {/* COL-03: VISUALIZAÇÃO (com lazy SyntaxHighlighter) */}
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
          <Paper
            elevation={3}
            sx={{
              height: "calc(100vh - 220px)",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                flexGrow: 1,
                mb: 1,
                p: 2,
                overflowX: "auto",
                backgroundColor: theme.palette.background.default,
              }}
            >
              <Suspense
                fallback={
                  <Typography variant="body2">
                    Carregando visualizador…
                  </Typography>
                }
              >
                <SyntaxHighlighter
                  language="json"
                  wrapLongLines
                  codeTagProps={{
                    style: {
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    },
                  }}
                  customStyle={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflowX: "auto",
                  }}
                >
                  {jsonFormatado}
                </SyntaxHighlighter>
              </Suspense>
            </Paper>

            <Box display="flex" justifyContent="flex-end" gap={1} mb={1} mt={1}>
              <Tooltip title="Copiar conteúdo">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(minuta, "Conteúdo copiado!")}
                >
                  <ContentCopy fontSize="small" />
                  <Typography variant="body2">Copiar</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Salvar análise">
                <IconButton
                  size="small"
                  onClick={() => handleSaveAnaliseByIA(minuta)}
                >
                  <Save fontSize="small" />
                  <Typography variant="body2">Salvar</Typography>
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* CONFIRMAÇÃO */}
      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {confirmOpen === "autos"
              ? `Excluir ${selectedIdsAutos.length} item(ns) de Autos?`
              : `Excluir ${selectedIdsRag.length} item(ns) de Minutas?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (confirmOpen === "autos") await handleDeleteSelectedAutos();
              else await handleDeleteSelectedRag();
              setConfirmOpen(null);
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
