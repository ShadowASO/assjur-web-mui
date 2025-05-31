import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  useTheme,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  useQueryGPT,
  type IRespostaOpenai,
} from "../../shared/services/query/Query";

import ReactMarkdown from "react-markdown";
import { useApi } from "../../shared/contexts/ApiProvider";

export const ChatIA = () => {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { addMessage, messages, getMessages } = useQueryGPT();
  const Api = useApi();

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();

    //Se o campo de prompt estiver vazio, faz nada
    if (!query.trim()) return;

    //Caso o campo de prompt possua valores
    const userQuery = { role: "user", content: query } as const;

    setQuery("");
    setIsLoading(true);

    addMessage(userQuery.role, userQuery.content);

    try {
      const payload = { messages: getMessages() };

      const response = await Api.post("/query", payload);
      if (response.ok && response.data) {
        const data = response.data as IRespostaOpenai;
        const mensagem = data?.choices?.[0]?.message?.content;

        if (mensagem) {
          addMessage("assistant", mensagem);
        } else {
          addMessage("assistant", "⚠️ Não foi possível obter resposta.");
        }
      } else {
        addMessage("assistant", "⚠️ Erro ao processar a resposta da API.");
      }
    } catch (error) {
      console.error("Erro ao acessar a API:", error);
      addMessage("assistant", "⚠️ Erro na comunicação com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      bgcolor={theme.palette.background.default}
    >
      {/* Área de mensagens */}
      <Box
        flex={1}
        overflow="auto"
        p={2}
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        {messages.map((msg, idx) => (
          <Paper
            key={idx}
            sx={{
              p: 2,
              maxWidth: "75%",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                msg.role === "user"
                  ? theme.palette.primary.light
                  : theme.palette.grey[200],
            }}
          >
            {msg.role === "user" ? (
              <Typography variant="h6">{msg.content}</Typography>
            ) : (
              <ReactMarkdown>{msg.content}</ReactMarkdown> // ⬅️ Usa markdown para assistant
            )}
          </Paper>
        ))}
        <div ref={scrollRef} />
      </Box>

      {/* Área de entrada */}
      <Box
        component="form"
        onSubmit={handleSubmitQuery}
        display="flex"
        gap={2}
        p={2}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          placeholder="Digite sua mensagem..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Enviar"}
        </Button>
      </Box>
    </Box>
  );
};
