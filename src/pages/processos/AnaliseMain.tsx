/**
 * File: AnaliseMain.tsx
 * Criação:  14/06/2025
 * Janela para interação do usuário com a IA e o processo
 *
 */
import { ContentCopy, Delete, Save, Send } from "@mui/icons-material";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Tooltip,
  IconButton,
  useTheme,
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
  InputAdornment,
  Checkbox,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import { useFlash } from "../../shared/contexts/FlashProvider";
import { useEffect, useRef, useState } from "react";
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
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useApi } from "../../shared/contexts/ApiProvider";
import {
  useMessageReponse,
  type IMessageResponseItem,
  type IOutputResponseItem,
  type IResponseOpenaiApi,
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
import React from "react";
import { useDrawerContext } from "../../shared/contexts/DrawerProvider";

export const AnalisesMain = () => {
  const { id: idCtxt } = useParams();
  const [processo, setProcesso] = useState("");
  const { showFlashMessage } = useFlash();
  const [isLoading, setLoading] = useState(false);

  const [autos, setAutos] = useState<AutosRow[]>([]);
  const [minuta, setMinuta] = useState("");
  const [dialogo, setDialogo] = useState("");
  const [prompt, setPrompt] = useState("");
  const [prevId, setPrevId] = useState("");
  const [refreshPecas, setRefreshPecas] = useState(0);
  //Uso de tokens
  const [ptUso, setPtUso] = useState(0);
  const [ctUso, setCtUso] = useState(0);
  const [ttUso, setTtUso] = useState(0);

  // Seleção independente para cada tabela
  const [selectedIdsAutos, setSelectedIdsAutos] = useState<string[]>([]);
  const [selectedIdsRag, setSelectedIdsRag] = useState<string[]>([]);

  const { addMessage, getMessages, addOutput, clearMessages } =
    useMessageReponse();
  const scrollRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const Api = useApi();

  const { setTituloJanela } = useDrawerContext();

  // Filtra autos e rag separados
  const autosFiltrados = autos.filter(
    (reg) =>
      reg.id_natu !== NATU_DOC_IA_ANALISE &&
      reg.id_natu !== NATU_DOC_IA_SENTENCA
  );
  const ragFiltrados = autos.filter(
    (reg) =>
      reg.id_natu === NATU_DOC_IA_ANALISE ||
      reg.id_natu === NATU_DOC_IA_SENTENCA
  );
  //Exibe o título da janela na barra superior
  setTituloJanela(
    `Análise Jurídica - Processo ${formatNumeroProcesso(processo)}`
  );

  // Carregar autos
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await refreshAutos(Number(idCtxt));
        setAutos(response?.length ? response : []);
      } catch (error) {
        console.error(error);
        showFlashMessage("Erro ao listar os autos!", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [idCtxt, refreshPecas, showFlashMessage]);

  // Carregar número processo + tokens
  useEffect(() => {
    (async () => {
      try {
        //toggleDrawerOpen();
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
          setCtUso(rsp.completion_tokens ?? 0); // <== corrigido
        }
        setProcesso(rsp?.nr_proc ?? "");
      } catch (error) {
        console.error(error);
        showFlashMessage("Erro ao listar o número do processo!", "error");
      } finally {
        setLoading(false);
      }
    })();
    //return () => toggleDrawerOpen();
  }, [idCtxt, showFlashMessage]);

  // Mantém o total sempre coerente
  useEffect(() => {
    setTtUso((ptUso ?? 0) + (ctUso ?? 0));
  }, [ptUso, ctUso]);

  // Scroll automático para mensagens
  const messages = getMessages();
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSelectRowAutos = (id: string, checked: boolean) => {
    setSelectedIdsAutos((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  // Handlers para RAG
  // const handleSelectAllRag = (checked: boolean) => {
  //   if (checked) {
  //     setSelectedIdsRag(ragFiltrados.map((reg) => reg.id));
  //   } else {
  //     setSelectedIdsRag([]);
  //   }
  // };
  const handleSelectRowRag = (id: string, checked: boolean) => {
    setSelectedIdsRag((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  // Deletar selecionados de ambas as tabelas
  const handleDeleteSelected = async () => {
    const allSelected = [...selectedIdsAutos, ...selectedIdsRag];
    if (allSelected.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        allSelected.map((id) => deleteAutos(id))
      );
      const errors = results.filter((ok) => !ok).length;
      setSelectedIdsAutos([]);
      setSelectedIdsRag([]);
      setRefreshPecas((prev) => prev + 1);
      if (errors === 0) {
        showFlashMessage("Itens excluídos com sucesso!", "success");
      } else {
        showFlashMessage("Erro ao excluir alguns itens.", "error");
      }
    } catch (error) {
      console.error(error);
      showFlashMessage("Erro inesperado ao excluir itens.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Copiar texto para clipboard
  const handlerCopiarParaClipboard = (texto: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    showFlashMessage("Texto copiado para a área de transferência!", "success");
  };

  // Salvar análise IA
  const handleSaveAnaliseByIA = async (texto: string) => {
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
      const response = await insertDocumentoAutos(
        idCtxtNum,
        NATU_DOC_IA_ANALISE,
        "",
        texto,
        ""
      );
      if (response) {
        showFlashMessage("Análise salva com sucesso!", "success");
      } else {
        showFlashMessage("Erro ao salvar a análise!", "error");
      }
    } catch (error) {
      console.error("Erro ao acessar a API:", error);
      showFlashMessage("Erro inesperado ao salvar a análise.", "error");
    } finally {
      setLoading(false);
    }
  };

  //Retorna o primeiro registro de output que tem como type "message"
  const getMessageOpenAi = (
    out: IOutputResponseItem[]
  ): IOutputResponseItem | undefined => {
    const output: IOutputResponseItem | undefined = (
      out as IOutputResponseItem[]
    ).find((o) => o?.type === "message");

    return output;
  };
  // Enviar prompt para IA
  const handleSendPrompt = async () => {
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
      const payload = {
        id_ctxt: idCtxt,
        messages: msg,
        previd: prevId,
      };
      const response = await Api.post("/contexto/query/rag", payload);
      if (response.ok && response.data) {
        const data = response.data as IResponseOpenaiApi;
        //const output = data?.output?.[0];

        const out = getMessageOpenAi(data?.output);

        if (out) {
          funcToolFormataResposta(out);
        } else {
          setDialogo("");
        }
      } else {
        setDialogo("");
      }
    } catch (error) {
      console.error("Erro ao acessar a API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlerCleanChat = () => {
    setPrevId("");
    setDialogo("");
    clearMessages();
  };

  // Formata resposta da ferramenta para UI
  const funcToolFormataResposta = async (output: IOutputResponseItem) => {
    if (!output?.content?.[0]?.text) return;
    try {
      const rawObj = JSON.parse(output.content[0].text);
      const respostaObj: RespostaRAG = {
        tipo_resp: Number(rawObj.tipo_resp),
        texto: rawObj.texto,
      };
      if (respostaObj.tipo_resp === RESPOSTA_RAG_CHAT) {
        output.content[0].text = respostaObj.texto;
        addOutput(output);
        setDialogo((prev) => prev + "\n\n" + output.content[0].text);
        setPrevId(output.id);
      } else {
        setMinuta(respostaObj.texto);
        await funcToolSaveRAG({
          tipo_resp: respostaObj.tipo_resp,
          texto: respostaObj.texto,
        });
      }
    } catch (error) {
      console.error("Erro ao fazer parse da resposta JSON:", error);
    }
  };

  // Salvar RAG no backend
  const funcToolSaveRAG = async (rag: RespostaRAG) => {
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
      const response = await insertDocumentoAutos(
        idCtxtNum,
        rag.tipo_resp,
        "",
        rag.texto,
        ""
      );
      if (response) {
        showFlashMessage("Análise salva com sucesso!", "success");
      } else {
        showFlashMessage("Erro ao salvar a análise!", "error");
      }
    } catch (error) {
      console.error("Erro ao acessar a API:", error);
      showFlashMessage("Erro inesperado ao salvar a análise.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Formata JSON para exibição com indentação
  const jsonFormatado = React.useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(minuta), null, 2);
    } catch {
      return minuta;
    }
  }, [minuta]);

  // Seleciona peça e exibe texto formatado
  const handleSelectPeca = (reg: AutosRow) => {
    if (
      reg.id_natu === NATU_DOC_IA_ANALISE ||
      reg.id_natu === NATU_DOC_IA_SENTENCA
    ) {
      setMinuta(reg.doc);
      return;
    }
    if (reg.doc_json_raw) {
      if (typeof reg.doc_json_raw === "string") {
        setMinuta(reg.doc_json_raw);
      } else {
        setMinuta(JSON.stringify(reg.doc_json_raw, null, 4));
      }
    } else {
      setMinuta("");
    }
  };

  return (
    <Box
      p={0}
      height="100%"
      display="flex"
      flexDirection="column"
      bgcolor={theme.palette.background.paper}
    >
      <Grid container spacing={1} padding={1} margin={1}>
        {/* COL-01: AUTOS + RespostaRAG */}
        <Grid
          size={{ xs: 12, sm: 6, md: 2, lg: 2, xl: 2 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 188px)",
            p: 2,
          }}
          component={Paper}
          elevation={3}
        >
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Tabela autos (sem registros RAG) */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {autosFiltrados.length > 0 && (
                <>
                  <Box mb={1}>
                    <Button
                      color="error"
                      variant="contained"
                      startIcon={<Delete />}
                      disabled={
                        (selectedIdsAutos.length === 0 &&
                          selectedIdsRag.length === 0) ||
                        isLoading
                      }
                      onClick={handleDeleteSelected}
                      size="small"
                    >
                      Deletar Selecionados
                    </Button>
                  </Box>
                  <TableContainer sx={{ maxHeight: "100%" }}>
                    <Table stickyHeader size="small" tabIndex={0}>
                      <TableHead>
                        <TableRow>
                          <TableCell colSpan={2} sx={{ p: 1 }}>
                            <Typography variant="h6" fontWeight="bold" mb={1}>
                              Autos
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {autosFiltrados.map((reg) => (
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
                              onClick={() => handleSelectPeca(reg)}
                              sx={{ cursor: "pointer" }}
                            >
                              {getDocumentoName(reg.id_natu)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>

            {/* Tabela de respostaRag */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                borderTop: "1px solid",
                borderColor: "divider",
                pt: 1,
              }}
            >
              {/* <Typography variant="h6" fontWeight="bold" mb={1}>
                Respostas IA
              </Typography> */}
              {ragFiltrados.length > 0 ? (
                <TableContainer sx={{ maxHeight: "100%" }}>
                  <Table stickyHeader size="small" tabIndex={0}>
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={2} sx={{ p: 1 }}>
                          <Typography variant="h6" fontWeight="bold" mb={1}>
                            Minutas
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ragFiltrados.map((reg) => (
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
                            onClick={() => handleSelectPeca(reg)}
                            sx={{ cursor: "pointer" }}
                          >
                            {getRespostaDescricao(reg.id_natu)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma resposta disponível.
                </Typography>
              )}
            </Box>
          </Box>
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
            {/* COMPLETION */}
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
                {messages
                  .map(
                    (m) => (m.role === "user" ? "Usuário: " : "IA: ") + m.text
                  )
                  .join("\n\n")}
              </ReactMarkdown>
            </Paper>

            {/* BOTÕES */}
            {/* TOKENS + BOTÕES (em linha) */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              mb={1}
              mr={2}
            >
              {/* Tokens à esquerda, em linha */}
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

              {/* Botões à direita */}
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Copiar">
                  <IconButton
                    size="medium"
                    onClick={() => handlerCopiarParaClipboard(dialogo)}
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
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder="Digite o prompt aqui..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                },
                "& .MuiInputBase-root": {
                  height: 150,
                  overflow: "auto",
                },
                "& textarea": {
                  height: "100% !important",
                  overflow: "auto",
                },
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
                          onClick={() => handlerCopiarParaClipboard(prompt)}
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

        {/* COL-03: ÁREA DE TEXTO À DIREITA */}
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
            {/* Área que cresce e faz scroll */}
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
              <SyntaxHighlighter
                language="json"
                style={duotoneLight}
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
            </Paper>

            {/* Botão de copiar */}
            <Box display="flex" justifyContent="flex-end" mb={1} mt={1}>
              <Tooltip title="Copiar conteúdo">
                <IconButton
                  size="small"
                  onClick={() => handlerCopiarParaClipboard(minuta)}
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
      <div ref={scrollRef} />
    </Box>
  );
};
