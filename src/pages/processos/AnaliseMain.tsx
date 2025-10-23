/**
 * File: AnaliseMain.tsx
 * Atualização: 12/08/2025
 */
import { ContentCopy, Delete } from "@mui/icons-material";
import {
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
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import {
  deleteAutos,
  deleteEvento,
  formatNumeroProcesso,
  getContextoById,
  getContextoTokensUso,
  refreshAutos,
  refreshEventos,
} from "../../shared/services/api/fetch/apiTools";
import type { AutosRow, EventosRow } from "../../shared/types/tabelas";
import { useApi } from "../../shared/contexts/ApiProvider";
import {
  type IOutputResponseItem,
  type IMessageResponseItem,
  useMessageReponse,
  type IResponseOutput,
} from "../../shared/services/query/QueryResponse";
import { getDocumentoName } from "../../shared/constants/autosDoc";

import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import { useDrawerContext } from "../../shared/contexts/DrawerProvider";
import { describeApiError } from "../../shared/services/api/erros/errosApi";
import { MinutaViewer } from "./MinutasViewer";
import {
  RAG_EVENTO_ADD_BASE,
  RAG_EVENTO_ANALISE,
  RAG_EVENTO_COMPLEMENTO,
  RAG_EVENTO_CONFIRMACAO,
  RAG_EVENTO_DECISAO,
  RAG_EVENTO_DESPACHO,
  RAG_EVENTO_OUTROS,
  RAG_EVENTO_SENTENCA,
} from "./consts";
import { PromptInput } from "./PromptInput";

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

  const Api = useApi();
  const { setTituloJanela } = useDrawerContext();

  const [isLoading, setLoading] = useState(false);
  const [processo, setProcesso] = useState("");

  const [autos, setAutos] = useState<AutosRow[]>([]);
  const [eventos, setEventos] = useState<EventosRow[]>([]);

  const [minuta, setMinuta] = useState("");
  const [dialogo, setDialogo] = useState("");

  const [prevId, setPrevId] = useState("");

  const [refreshPecas, setRefreshPecas] = useState(0);
  const [refreshTokens, setRefreshTokens] = useState(0);
  // estado só para envio do prompt (sem travar toda a tela)
  const [isSending, setIsSending] = useState(false);

  // tokens
  const [ptUso, setPtUso] = useState(0);
  const [ctUso, setCtUso] = useState(0);
  const [ttUso, setTtUso] = useState(0);

  // seleção
  const [selectedIdsAutos, setSelectedIdsAutos] = useState<string[]>([]);
  const [selectedIdsEventos, setSelectedIdsEventos] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState<null | "autos" | "rag">(null);

  const { addMessage, getMessages, addOutput, clearMessages } =
    useMessageReponse();

  // infinite slices
  const {
    visible: autosVisiveis,
    hasMore: autosHasMore,
    sentinelRef: autosSentinel,
  } = useInfiniteSlice(autos, 40);
  const {
    visible: eventosVisiveis,
    hasMore: eventosHasMore,
    sentinelRef: eventosSentinel,
  } = useInfiniteSlice(eventos, 40);

  // Seleciona e exibe a minuta correspondente a um evento
  const handleSelectEvento = useCallback((evento: EventosRow) => {
    if (!evento) return;

    if (evento.doc_json_raw) {
      const raw =
        typeof evento.doc_json_raw === "string"
          ? evento.doc_json_raw
          : JSON.stringify(evento.doc_json_raw, null, 2);
      setMinuta(raw);
    } else {
      setMinuta("");
    }
  }, []);

  // título
  useEffect(() => {
    setTituloJanela(
      `Análise Jurídica - Processo ${formatNumeroProcesso(processo)}`
    );
  }, [processo, setTituloJanela]);

  // carregar autos (peças)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await refreshAutos(Number(idCtxt));
        setAutos(response?.length ? response : []);
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [idCtxt, refreshPecas]);

  // ========================= CARREGAMENTO DE EVENTOS =========================
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await refreshEventos(Number(idCtxt));
        const lista = response?.length ? response : [];
        setEventos(lista);

        // ✅ Seleciona automaticamente o primeiro evento da lista
        if (lista.length > 0 && !minuta) {
          handleSelectEvento(lista[0]);
        }
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [idCtxt, refreshPecas, handleSelectEvento]);

  // processo + tokens
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!idCtxt) return;
        const rsp = await getContextoById(idCtxt);
        if (rsp) {
          setPtUso(rsp.prompt_tokens ?? 0);
          setCtUso(rsp.completion_tokens ?? 0);
          setProcesso(rsp.nr_proc ?? "");
        }
      } catch (error) {
        const { userMsg } = describeApiError(error);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5);
      } finally {
        setLoading(false);
      }
    })();
  }, [idCtxt]);

  // Atualiza o consumo de tokens
  useEffect(() => {
    (async () => {
      try {
        //setLoading(true);
        if (!idCtxt) return;
        const rsp = await getContextoTokensUso(Number(idCtxt));
        if (rsp) {
          setPtUso(rsp.prompt_tokens ?? 0);
          setCtUso(rsp.completion_tokens ?? 0);
        }
      } catch (error) {
        const { userMsg } = describeApiError(error);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5);
      } finally {
        //setLoading(false);
      }
    })();
  }, [idCtxt, refreshTokens]);

  useEffect(() => setTtUso((ptUso ?? 0) + (ctUso ?? 0)), [ptUso, ctUso]);

  // seleção
  const handleSelectRowAutos = useCallback((id: string, checked: boolean) => {
    setSelectedIdsAutos((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  }, []);

  const handleSelectRowEventos = useCallback((id: string, checked: boolean) => {
    setSelectedIdsEventos((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  }, []);

  const allAutosIds = useMemo(() => autos.map((r) => r.id), [autos]);
  const allEventosIds = useMemo(() => eventos.map((r) => r.id), [eventos]);

  const autosAllChecked =
    selectedIdsAutos.length === allAutosIds.length && allAutosIds.length > 0;
  const eventosAllChecked =
    selectedIdsEventos.length === allEventosIds.length &&
    allEventosIds.length > 0;

  const handleToggleAllAutos = useCallback(
    (checked: boolean) => setSelectedIdsAutos(checked ? allAutosIds : []),
    [allAutosIds]
  );
  const handleToggleAllRag = useCallback(
    (checked: boolean) => setSelectedIdsEventos(checked ? allEventosIds : []),
    [allEventosIds]
  );

  const deleteByIdsAutos = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return { errors: 0 };
    const results = await Promise.all(ids.map((id) => deleteAutos(id)));
    return { errors: results.filter((ok) => !ok).length };
  }, []);
  const deleteByIdsEventos = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return { errors: 0 };
    const results = await Promise.all(ids.map((id) => deleteEvento(id)));
    return { errors: results.filter((ok) => !ok).length };
  }, []);

  //********* */
  const handleDeleteSelectedAutos = useCallback(async () => {
    if (!selectedIdsAutos.length) return;
    setLoading(true);
    try {
      const { errors } = await deleteByIdsAutos(selectedIdsAutos);
      setSelectedIdsAutos([]);
      setRefreshPecas((p) => p + 1);
      showFlashMessage(
        errors === 0
          ? "Autos excluídos com sucesso!"
          : "Erro ao excluir alguns autos.",
        errors === 0 ? "success" : "error"
      );
    } finally {
      setLoading(false);
    }
  }, [deleteByIdsAutos, selectedIdsAutos, showFlashMessage]);

  const handleDeleteSelectedEventos = useCallback(async () => {
    if (!selectedIdsEventos.length) return;
    setLoading(true);
    try {
      const { errors } = await deleteByIdsEventos(selectedIdsEventos);
      setSelectedIdsEventos([]);
      setRefreshPecas((p) => p + 1);
      showFlashMessage(
        errors === 0
          ? "Minutas excluídas com sucesso!"
          : "Erro ao excluir algumas minutas.",
        errors === 0 ? "success" : "error"
      );
    } finally {
      setLoading(false);
    }
  }, [deleteByIdsEventos, selectedIdsEventos, showFlashMessage]);

  // clipboard
  const copyToClipboard = useCallback(
    (texto: string, msgOk = "Copiado!") => {
      if (!texto) return;
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(texto).then(
          () => showFlashMessage(msgOk, "success"),
          () => showFlashMessage("Não foi possível copiar.", "warning")
        );
      }
    },
    [showFlashMessage]
  );
  const handlerCleanChat = () => {
    clearMessages();
    setPrevId("");
    setDialogo("");
  };

  // OpenAI helpers
  const getOutputMessage = useCallback(
    (out?: IOutputResponseItem[]): IOutputResponseItem | undefined =>
      Array.isArray(out) ? out.find((o) => o?.type === "message") : undefined,
    []
  );

  /**
   * Formata a resposta recebida do servidor e faz a exibição no diálogo.
   */

  // ========================================================
  // 🧩 Função utilitária: cria um IOutputResponseItem padronizado
  // ========================================================
  function criarOutputItem(
    id: string,
    texto: string,
    status: "completed" | "error" = "completed"
  ): IOutputResponseItem {
    return {
      type: "message",
      id,
      status,
      role: "assistant",
      content: [
        {
          type: "text",
          text: texto,
          annotations: [],
        },
      ],
    };
  }

  // ========================================================
  // 🧠 Função principal: formata e roteia respostas do modelo
  // ========================================================
  const formataRespostaRAG = useCallback(
    async (output: IOutputResponseItem) => {
      const maybeText = output?.content?.[0]?.text;
      if (!maybeText) return;

      try {
        const rawObj = JSON.parse(maybeText);
        // console.log(rawObj);

        if (!rawObj?.tipo?.evento) {
          throw new Error("Objeto não contém campo tipo.evento");
        }

        switch (rawObj.tipo.evento) {
          // ==================================================
          // 🔹 Casos que geram minuta completa
          // ==================================================
          case RAG_EVENTO_ANALISE:
          case RAG_EVENTO_SENTENCA:
          case RAG_EVENTO_DECISAO:
          case RAG_EVENTO_DESPACHO: {
            setMinuta(JSON.stringify(rawObj, null, 2));
            break;
          }

          // ==================================================
          // 🔹 Confirmação de intenção
          // ==================================================
          case RAG_EVENTO_CONFIRMACAO: {
            const confirmacao = rawObj.confirmacao ?? "";
            const complementoOutput = criarOutputItem(output.id, confirmacao);
            addOutput(complementoOutput);
            setDialogo((prev) =>
              prev ? `${prev}\n\n${confirmacao}` : confirmacao
            );
            setPrevId(output.id);
            break;
          }

          // ==================================================
          // 🔹 Solicitação de complementação (faltantes)
          // ==================================================
          case RAG_EVENTO_COMPLEMENTO: {
            const faltantes: string[] = rawObj.faltantes ?? [];
            const textoComplemento =
              faltantes.length > 0
                ? `Algumas questões controvertidas ainda não foram respondidas:\n\n${faltantes
                    .map((q, i) => `${i + 1}. ${q}`)
                    .join(
                      "\n"
                    )}\n\nPor favor, responda a cada uma dessas questões para prosseguir com o julgamento.`
                : "O modelo indicou que há dados complementares necessários, mas não especificou quais.";

            const complementoOutput = criarOutputItem(
              `${output.id}-faltantes`,
              textoComplemento
            );

            addOutput(complementoOutput);
            setDialogo((prev) =>
              prev ? `${prev}\n\n${textoComplemento}` : textoComplemento
            );
            setPrevId(output.id);
            break;
          }

          case RAG_EVENTO_ADD_BASE: {
            const resposta = rawObj.conteudo ?? "";
            const complementoOutput = criarOutputItem(output.id, resposta);
            addOutput(complementoOutput);
            setDialogo((prev) => (prev ? `${prev}\n\n${resposta}` : resposta));
            setPrevId(output.id);
            break;
          }

          // ==================================================
          // 🔹 Texto genérico (outros tipos)
          // ==================================================
          case RAG_EVENTO_OUTROS: {
            const resposta = rawObj.conteudo ?? "";
            const complementoOutput = criarOutputItem(output.id, resposta);
            addOutput(complementoOutput);
            setDialogo((prev) => (prev ? `${prev}\n\n${resposta}` : resposta));
            setPrevId(output.id);
            break;
          }

          // ==================================================
          // 🔹 Tipo desconhecido — exibe conteúdo bruto
          // ==================================================
          default: {
            addOutput(output);
            setDialogo((prev) =>
              prev ? `${prev}\n\n${maybeText}` : maybeText
            );
            setPrevId(output.id);
          }
        }
      } catch (err) {
        console.error("Erro ao processar resposta:", err);

        const erroMsg =
          "⚠️ Erro ao processar resposta do servidor. Exibindo conteúdo bruto:\n\n" +
          maybeText;

        const erroOutput = criarOutputItem(
          `${output.id}-erro`,
          erroMsg,
          "error"
        );

        addOutput(erroOutput);
        setDialogo((prev) => (prev ? `${prev}\n\n${maybeText}` : maybeText));
        setPrevId(output.id);
      }
    },
    [addOutput, setDialogo, setMinuta, setPrevId]
  );

  const handleSendPrompt = useCallback(
    async (sendPrompt: string) => {
      //const text = prompt.trim();
      const text = sendPrompt.trim();
      if (!text) {
        showFlashMessage("Digite um prompt antes de enviar.", "warning", 3);
        return;
      }
      if (isSending) return; // evita duplo envio
      setIsSending(true);

      const userQuery: IMessageResponseItem = {
        id: prevId,
        role: "user",
        text,
      };

      //setPrompt("");
      addMessage(userQuery.id, userQuery.role, userQuery.text);

      try {
        const msg = getMessages();
        const payload = { id_ctxt: idCtxt, messages: msg, previd: prevId };
        const response = await Api.post("/contexto/query/rag", payload);

        //Atualiza tokens
        setRefreshTokens((p) => p + 1);

        if (response.ok && response.data) {
          const respOutput = response.data as IResponseOutput;

          if (!respOutput?.output || !Array.isArray(respOutput.output)) {
            console.log(respOutput);
            showFlashMessage(
              "Resposta da API não está no formato esperado (sem output).",
              "error"
            );
            return;
          }
          //Extraio o primeiro  output com tipo "message"
          const output = getOutputMessage(respOutput.output);
          if (!output) {
            console.log(output);
            showFlashMessage(
              "Resposta da API não contém mensagem válida.",
              "error"
            );
            return;
          }

          //console.log(output);

          //Aqui é que eu verifico o formato
          await formataRespostaRAG(output);
          setRefreshPecas((p) => p + 1);
        } else {
          // ⚠️ Aqui tratamos o erro vindo do servidor
          const err = response.error;
          if (err) {
            const fullMsg = `${err.message}${
              err.description ? " — " + err.description : ""
            }`;
            console.log(fullMsg);
            showFlashMessage(fullMsg, "error", TIME_FLASH_ALERTA_SEC * 5);
          } else {
            showFlashMessage(
              "Erro desconhecido ao processar a solicitação.",
              "error"
            );
          }
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        showFlashMessage(`Falha de rede ou erro inesperado: ${msg}`, "error");
      } finally {
        setIsSending(false);
      }
    },
    [
      Api,
      addMessage,
      formataRespostaRAG,
      getOutputMessage,
      getMessages,
      idCtxt,
      prevId,

      showFlashMessage,
      isSending,
    ]
  );

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

      <Grid
        container
        spacing={1}
        padding={1}
        margin={1}
        sx={{ alignItems: "stretch" }}
      >
        {/* COL-01: AUTOS + MINUTAS */}
        <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2, xl: 2 }}>
          <Paper
            elevation={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 180px)", // 🔹 mesma altura das outras colunas
              p: 2,
              gap: 2,
              overflow: "hidden", // evita que o Paper em si gere scrollbar
            }}
          >
            {/* ===================== AUTOS ===================== */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography variant="h6" fontWeight="bold" mb={1}>
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
                      disabled={selectedIdsAutos.length === 0 || isLoading}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
                <Table stickyHeader size="small" aria-label="Tabela de Autos">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ p: 1, width: 42 }}>
                        <Checkbox
                          checked={autosAllChecked}
                          onChange={(e) =>
                            handleToggleAllAutos(e.target.checked)
                          }
                          disabled={isLoading || autos.length === 0}
                          inputProps={{
                            "aria-label": "Selecionar todos os Autos",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>Todas</TableCell>
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

                    {autosHasMore && (
                      <TableRow>
                        <TableCell colSpan={2} sx={{ p: 0 }}>
                          <div ref={autosSentinel} style={{ height: 1 }} />
                        </TableCell>
                      </TableRow>
                    )}
                    {autos.length === 0 && (
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

            {/* ===================== MINUTAS ===================== */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Minutas
                </Typography>

                <Tooltip
                  title={
                    selectedIdsEventos.length
                      ? `Excluir ${selectedIdsEventos.length} selecionada(s)`
                      : "Selecione itens para excluir"
                  }
                >
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setConfirmOpen("rag")}
                      disabled={selectedIdsEventos.length === 0 || isLoading}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
                <Table stickyHeader size="small" aria-label="Tabela de Minutas">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ p: 1, width: 42 }}>
                        <Checkbox
                          checked={eventosAllChecked}
                          onChange={(e) => handleToggleAllRag(e.target.checked)}
                          disabled={isLoading || eventos.length === 0}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>Todos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventosVisiveis.map((reg) => {
                      const isSelected = selectedIdsEventos.includes(reg.id);
                      return (
                        <TableRow
                          key={reg.id}
                          hover
                          selected={isSelected}
                          onClick={() => handleSelectEvento(reg)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: isSelected
                              ? theme.palette.action.hover
                              : "inherit",
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectRowEventos(
                                  reg.id,
                                  e.target.checked
                                );
                              }}
                              disabled={isLoading}
                            />
                          </TableCell>
                          <TableCell>{getDocumentoName(reg.id_natu)}</TableCell>
                        </TableRow>
                      );
                    })}

                    {eventosHasMore && (
                      <TableRow>
                        <TableCell colSpan={2} sx={{ p: 0 }}>
                          <div ref={eventosSentinel} style={{ height: 1 }} />
                        </TableCell>
                      </TableRow>
                    )}
                    {eventos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma minuta disponível.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>

        {/* COL-02: COMPLETION + PROMPT */}
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
          <Paper
            elevation={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: "calc(100vh - 180px)",
              height: "calc(100vh - 180px)", // 🔹 define altura do grid / não retirar
              p: 2,
              gap: 2,
              overflowY: "auto", // ✅ permite rolagem vertical
              overflowX: "hidden", // opcional, evita barra horizontal
              maxHeight: "100%", // 🔹 garante que respeite o container
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
                      onClick={() => handlerCleanChat()}
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

            {/* PROMPT (overlay só no campo + barra de ações externa, simétrica) */}
            <Box>
              {/* Wrapper do campo para permitir overlay sem afetar a barra */}
              <Box position="relative">
                <PromptInput
                  onSubmit={handleSendPrompt}
                  isLoading={isLoading}
                  isSending={isSending}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* COL-03: VISUALIZAÇÃO (com lazy SyntaxHighlighter) */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <MinutaViewer minuta={minuta} copyToClipboard={copyToClipboard} />
        </Grid>
      </Grid>

      {/* CONFIRMAÇÃO */}
      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {confirmOpen === "autos"
              ? `Excluir ${selectedIdsAutos.length} item(ns) de Autos?`
              : `Excluir ${selectedIdsEventos.length} item(ns) de Minutas?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (confirmOpen === "autos") await handleDeleteSelectedAutos();
              else await handleDeleteSelectedEventos();
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
