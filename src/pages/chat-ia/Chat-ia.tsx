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
  InputAdornment,
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

export const ChatIA = () => {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [prevId, setPrevId] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { addMessage, addOutput, messagesRef } = useMessageReponse();
  const { getOutputMessageOpenAi } = useQueryGPT();

  const Api = useApi();

  const handleSendPrompt = async () => {
    //Se o campo de prompt estiver vazio, faz nada
    if (!query.trim()) return;

    //Caso o campo de prompt possua valores
    const userQuery: IMessageResponseItem = {
      id: prevId,
      role: "user",
      text: query,
    };

    setQuery("");

    addMessage(userQuery.id, userQuery.role, userQuery.text);

    try {
      const payload = {
        messages: [
          { id: userQuery.id, role: userQuery.role, text: userQuery.text },
        ],
      };

      setIsLoading(true);
      //console.log(payload);

      const response = await Api.post("/query/chat", payload);
      //console.log(response);

      if (response.ok && response.data) {
        const data = response.data as IResponseOpenaiApi;

        const out = getOutputMessageOpenAi(data.output);

        if (out) {
          //console.log(data.id);
          addOutput(out);
          setPrevId(data.id);
        } else {
          addMessage("", "assistant", "Erro ao processar a resposta da API.");
        }
      } else {
        addMessage("", "assistant", "Erro ao processar a resposta da API.");
      }
    } catch (error) {
      console.error("Erro ao acessar a API:", error);

      addMessage("", "assistant", "Erro ao processar a resposta da API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesRef]);

  return (
    <Box
      height="100vh"
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
              height: "calc(100vh - 200px)",
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
        <Grid
          size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
          display={"flex"}
          justifyContent="center"
        >
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={3}
            placeholder="Digite sua mensagem..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
            disabled={isLoading}
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px", // Aqui você define o grau de arredondamento
                backgroundColor: theme.palette.background.paper,
              },

              width: "45%",
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
                        onClick={() => setQuery("")}
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
          {/* <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ width: "200px" }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Enviar"}
            </Button> */}
        </Grid>
      </Grid>
    </Box>
  );
};
