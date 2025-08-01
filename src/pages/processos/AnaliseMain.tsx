/**
 * File: AnaliseMain.tsx
 * Criação:  14/06/2025
 * Janela para interação do usuário com a IA e o processo
 *
 */
import { Clear, ContentCopy, Delete, Save, Send } from "@mui/icons-material";
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
  type IResponseOpenaiApi,
} from "../../shared/services/query/QueryResponse";
import {
  NATU_DOC_ANALISE_IA,
  getDocumentoName,
} from "../../shared/constants/autosDoc";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { addMessage, getMessages, addOutput, messagesRef } =
    useMessageReponse();
  const scrollRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const Api = useApi();

  // Função para selecionar/deselecionar todos
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(autos.map((reg) => reg.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Seleciona/deseleciona individual
  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  // Deleta múltiplos selecionados
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    let errors = 0;
    for (const id of selectedIds) {
      const ok = await deleteAutos(id);
      if (!ok) errors++;
    }
    setSelectedIds([]);
    setRefreshPecas((prev) => prev + 1);
    setLoading(false);
    if (errors === 0) {
      showFlashMessage("Itens excluídos com sucesso!", "success");
    } else {
      showFlashMessage("Erro ao excluir alguns itens.", "error");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const rsp = await refreshAutos(Number(idCtxt));

        setLoading(false);
        if (rsp && rsp.length > 0) {
          //console.log(rsp);
          setAutos(rsp);
        } else {
          setAutos([]);
        }
      } catch (error) {
        console.log(error);
        showFlashMessage("Erro ao listar os autos!", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [idCtxt, refreshPecas]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!idCtxt) {
          setProcesso("");
          return;
        }
        const rsp = await getContextoById(idCtxt);

        setLoading(false);
        if (rsp) {
          //console.log(rsp);
          setProcesso(rsp.nr_proc);
        } else {
          setProcesso("");
        }
      } catch (error) {
        console.log(error);
        showFlashMessage("Erro ao listar o número do processo!", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [idCtxt]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesRef]);

  const copiarParaClipboard = (texto: string) => {
    navigator.clipboard.writeText(texto);
    showFlashMessage("Texto copiado para a área de transferência!", "success");
  };

  const handleSaveAnaliseByIA = async (texto: string) => {
    console.log(texto);

    if (texto.length === 0) {
      showFlashMessage(
        "Não há qualquer análise disponível para salvamento!",
        "warning"
      );
      return; // evita continuar execução
    }

    // Converter idCtxt para número, assumir que idCtxt vem de algum lugar externo (exemplo: props, state, etc.)
    // Se idCtxt for string, converta assim:
    const idCtxtNum = Number(idCtxt);

    if (isNaN(idCtxtNum) || idCtxtNum <= 0) {
      showFlashMessage("Contexto inválido para salvar a análise!", "error");
      return;
    }

    try {
      setLoading(true);

      // Chamada API para salvar documento, idCtxt numérico
      const response = await insertDocumentoAutos(
        idCtxtNum,
        NATU_DOC_ANALISE_IA,
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

  const handleSendPrompt = async () => {
    if (!prompt.trim()) {
      showFlashMessage("Digite um prompt antes de enviar.", "warning", 3);
      return;
    }

    //Caso o campo de prompt possua valores
    const userQuery: IMessageResponseItem = {
      id: prevId,
      role: "user",
      text: prompt,
    };

    // Adiciona a mensagem do usuário ao histórico localmente
    //const newUserMessage = { role: "user", content: prompt.trim() };
    //const newHistory = [...history, newUserMessage];
    //setHistory([...history, { role: "user", content: prompt.trim() }]);

    //setHistory(newHistory);
    setPrompt("");
    setLoading(true);

    addMessage(userQuery.id, userQuery.role, userQuery.text);

    try {
      // Monta payload enviando todo o histórico de mensagens
      const msg = getMessages();
      const payload = {
        id_ctxt: idCtxt,
        //messages: newHistory,
        messages: msg,
        previd: prevId,
      };

      //console.log(payload);
      const response = await Api.post("/contexto/query/rag", payload);

      if (response.ok && response.data) {
        const data = response.data as IResponseOpenaiApi;

        const output = data?.output?.[0];

        if (output) {
          // const assistantMessage = {
          //   role: "assistant",
          //   content: output.content[0].text,
          // };

          // Atualiza histórico adicionando a resposta da IA
          addOutput(output);

          // Atualiza diálogo para renderizar
          setDialogo((prev) => prev + "\n\n" + output.content[0].text);

          setPrevId(output.id);
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

  const handleSelectPeca = (reg: AutosRow) => {
    //console.log(reg);
    if (reg.id_natu === NATU_DOC_ANALISE_IA) {
      //setDialogo(reg.doc);
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
      setMinuta(""); // Campo vazio ou nulo
    }
  };

  return (
    <Box
      p={0}
      height="100vh"
      display="flex"
      flexDirection="column"
      bgcolor={theme.palette.background.paper}
    >
      <Typography
        variant="h5"
        gutterBottom
        ml={2}
        mt={2}
        sx={{ boxSizing: "border-box" }}
      >
        Processo {formatNumeroProcesso(processo)}: Análise Processual
      </Typography>

      <Grid container spacing={1} padding={1} margin={1}>
        {/************  COL-01 ***** Coluna 1: AUTOS */}
        <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2, xl: 2 }}>
          <Paper elevation={3} sx={{ height: "calc(100vh - 120px)", p: 2 }}>
            {autos.length > 0 && (
              <>
                {/* Botão Deletar Selecionados */}
                <Box mb={1}>
                  <Button
                    color="error"
                    variant="contained"
                    startIcon={<Delete />}
                    disabled={selectedIds.length === 0 || isLoading}
                    onClick={handleDeleteSelected}
                    size="small"
                  >
                    Deletar Selecionados
                  </Button>
                </Box>
                <TableContainer sx={{ maxHeight: "calc(100vh - 200px)" }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={
                              selectedIds.length > 0 &&
                              selectedIds.length === autos.length
                            }
                            indeterminate={
                              selectedIds.length > 0 &&
                              selectedIds.length < autos.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            disabled={isLoading}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" fontWeight="bold">
                            Autos
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {autos.map((reg) => (
                        <TableRow key={reg.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedIds.includes(reg.id)}
                              onChange={(e) =>
                                handleSelectRow(reg.id, e.target.checked)
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
          </Paper>
        </Grid>

        {/********* COL-02: COMPLETION + PROMPT */}
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
          <Paper
            elevation={3}
            sx={{
              height: "calc(100vh - 120px)",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/********* COL-02 -> COMPLETION ***** */}
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

            {/********* COL-02 -> BOTÃO DE CÓPIA ***** */}

            <Box display="flex" justifyContent="flex-end" mb={1}>
              <Tooltip title="Copiar">
                <IconButton
                  size="small"
                  onClick={() => copiarParaClipboard(dialogo)}
                >
                  <ContentCopy fontSize="small" />
                  <Typography variant="body2">Copiar</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Salvar análise">
                <IconButton
                  size="small"
                  onClick={() => handleSaveAnaliseByIA(dialogo)}
                >
                  <Save fontSize="small" />
                  <Typography variant="body2">Salvar</Typography>
                </IconButton>
              </Tooltip>
            </Box>

            {/********* COL-02 -> PROMPT ***** */}

            <TextField
              label={"Prompt"}
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
                  borderRadius: "16px", // Aqui você define o grau de arredondamento
                },
                "& .MuiInputBase-root": {
                  height: 150, // Altura fixa (ajuste conforme quiser)
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
                          onClick={() => copiarParaClipboard(prompt)}
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
                          <Clear fontSize="small" />
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

        {/********* COL-03 -> Área de Texto à Direita ***** */}
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
          <Paper
            elevation={3}
            sx={{
              height: "calc(100vh - 120px)",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Área que cresce e faz scroll */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                backgroundColor: theme.palette.background.default,
              }}
            >
              <SyntaxHighlighter
                language="json"
                style={duotoneLight}
                customStyle={{
                  height: "auto", // Não força altura fixa
                  maxHeight: "none", // Não limita por altura
                  overflow: "visible", // Não cria barra de rolagem interna
                  width: "100%", // Mantém o conteúdo ajustável horizontalmente
                  whiteSpace: "pre-wrap", // Quebra de linha automática se quiser evitar scroll horizontal
                }}
              >
                {minuta}
              </SyntaxHighlighter>

              {/* <ReactMarkdown>{`\`\`\`json\n${minuta}\n\`\`\``}</ReactMarkdown> */}
            </Box>

            {/********* COL-03 -> BOTÃO DE CÓPIA ***** */}

            <Box display="flex" justifyContent="flex-end" mb={1} mt={1}>
              <Tooltip title="Copiar conteúdo">
                <IconButton
                  size="small"
                  onClick={() => copiarParaClipboard(minuta)}
                >
                  <ContentCopy fontSize="small" />
                  <Typography variant="body2">Copiar</Typography>
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
