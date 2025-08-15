/**
 * File: Chat-ia.tsx
 * Criação:  14/06/2025
 * Interface para conversar diretametne com a IA usando prompts
 *
 */

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  useTheme,
  Grid,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";

import ReactMarkdown from "react-markdown";
import { useApi } from "../../shared/contexts/ApiProvider";
import { Clear, ContentCopy, Send } from "@mui/icons-material";
import {
  useMessageReponse,
  type IMessageResponseItem,
  type IResponseOpenaiApi,
} from "../../shared/services/query/QueryResponse";
import { useQueryGPT } from "../../shared/services/query/Query";
import { useDrawerContext } from "../../shared/contexts/DrawerProvider";
import { describeApiError } from "../../shared/services/api/erros/errosApi";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";

export const ChatIA = () => {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [prevId, setPrevId] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { addMessage, addOutput, messagesRef } = useMessageReponse();
  const { getOutputMessageOpenAi } = useQueryGPT();
  const { setTituloJanela } = useDrawerContext();
  const { showFlashMessage } = useFlash();

  const Api = useApi();

  // setTituloJanela(`Janela de Chat`);
  useEffect(() => {
    setTituloJanela(`Janela de Chat`);
  }, [setTituloJanela]);

  const handleSendPrompt = async () => {
    const text = query.trim();
    if (!text) return;
    if (isSending) return; // evita duplo envio

    const userQuery: IMessageResponseItem = {
      id: prevId,
      role: "user",
      text,
    };

    setIsSending(true);
    setQuery("");
    addMessage(userQuery.id, userQuery.role, userQuery.text);

    try {
      const payload = {
        messages: [
          { id: userQuery.id, role: userQuery.role, text: userQuery.text },
        ],
      };

      setLoading(true);
      const response = await Api.post("/query/chat", payload);

      if (response.ok && response.data) {
        const data = response.data as IResponseOpenaiApi;
        const out = getOutputMessageOpenAi(data.output);

        if (out) {
          addOutput(out);
          setPrevId(data.id);
        } else {
          addMessage("", "assistant", "Erro ao processar a resposta da API.");
        }
      } else {
        addMessage("", "assistant", "Erro ao processar a resposta da API.");
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API:", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro",
        details: techMsg,
      });
      addMessage("", "assistant", "Erro ao processar a resposta da API.");
    } finally {
      setLoading(false);
      setIsSending(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesRef]);

  return (
    <Box
      height="calc(100vh - 100px)"
      display="flex"
      flexDirection="column"
      //bgcolor={theme.palette.background.paper}
      bgcolor={theme.palette.primary.light}
    >
      <Grid container spacing={1} padding={1} margin={1}>
        {/* Área de mensagens */}
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
          <Box
            flex={1}
            overflow="auto"
            p={1}
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              height: "calc(100vh - 280px)",
              overflowY: "auto",
              p: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messagesRef.current.map((msg, idx) => (
              <Box key={idx} display="flex" justifyContent="center">
                <Box
                  width="100%"
                  maxWidth="45%"
                  display="flex"
                  flexDirection="column"
                  alignItems={msg.role === "user" ? "flex-end" : "flex-start"}
                >
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor:
                        msg.role === "user"
                          ? theme.palette.background.default
                          : theme.palette.background.default,
                      borderRadius: "8px",
                      maxWidth: msg.role === "user" ? "60%" : "100%",
                    }}
                    variant="outlined"
                  >
                    {/* Botão de cópia para a área de transferência */}
                    {msg.role === "assistant" && (
                      <Box display="flex" justifyContent="flex-end" mb={1}>
                        <Tooltip title="Copiar">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigator.clipboard.writeText(msg.text)
                            }
                          >
                            <ContentCopy fontSize="small" />
                            <Typography variant="body2">Copiar</Typography>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}

                    {msg.role === "user" ? (
                      <Typography variant="body1">{msg.text}</Typography>
                    ) : (
                      <ReactMarkdown
                        components={{
                          li: ({ ...props }) => (
                            <li
                              style={{
                                marginBottom: "4px",
                                paddingLeft: "4px",
                              }}
                              {...props}
                            />
                          ),
                          p: ({ ...props }) => (
                            <p style={{ marginBottom: "8px" }} {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </Paper>
                </Box>
              </Box>
            ))}
            <div ref={scrollRef} />
          </Box>
        </Grid>

        {/* Área de entrada */}
        {/* Área de entrada */}
        <Grid
          size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
          display="flex"
          justifyContent="center"
        >
          <Box width="100%" maxWidth="45%">
            {/* Wrapper para overlay */}
            <Box position="relative">
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={3}
                placeholder="Digite sua mensagem..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Enter envia; Shift+Enter quebra linha
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !isLoading &&
                    !isSending
                  ) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                disabled={isLoading || isSending}
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2, // 16px
                    backgroundColor: theme.palette.background.paper,
                    alignItems: "start",
                  },
                  "& .MuiInputBase-root": {
                    maxHeight: 220,
                    overflow: "auto",
                  },
                  "& textarea": { height: "100% !important", overflow: "auto" },
                }}
                slotProps={{
                  input: { style: { padding: 24 } },
                  inputLabel: { shrink: true },
                }}
              />

              {/* Overlay de carregamento só sobre o campo */}
              {isSending && (
                <Box
                  role="status"
                  aria-live="polite"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(2px)",
                    borderRadius: 2,
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography variant="body2" ml={1.5}>
                    Enviando…
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Barra de ações EXTERNA, alinhada à direita */}
            <Box
              mt={0.5}
              display="flex"
              justifyContent="flex-end"
              gap={0.5}
              aria-label="Ações do prompt"
            >
              <Tooltip title="Enviar">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleSendPrompt}
                    disabled={isLoading || isSending || !query.trim()}
                    aria-label="Enviar prompt"
                  >
                    <Send fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Copiar prompt">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => navigator.clipboard.writeText(query)}
                    disabled={isLoading || isSending || !query}
                    aria-label="Copiar prompt"
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Limpar">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => setQuery("")}
                    disabled={isLoading || isSending || !query}
                    aria-label="Limpar prompt"
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
