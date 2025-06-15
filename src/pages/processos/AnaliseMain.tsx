/**
 * File: AnaliseMain.tsx
 * Criação:  14/06/2025
 * Janela para interação do usuário com a IA e o processo
 *
 */
import { Clear, ContentCopy, Send } from "@mui/icons-material";
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
} from "@mui/material";
import { useFlash } from "../../shared/contexts/FlashProvider";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { refreshAutos } from "../../shared/services/api/fetch/apiTools";
import type { AutosRow } from "../../shared/types/tabelas";
import { getDocumentoName } from "../../shared/constants/itemsPrompt";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export const AnalisesMain = () => {
  const { id: idCtxt } = useParams();
  const { showFlashMessage } = useFlash();
  const [isLoading, setLoading] = useState(false);

  const [autos, setAutos] = useState<AutosRow[]>([]);
  const [minuta, setMinuta] = useState("");
  const [dialogo, setDialogo] = useState("");
  const [prompt, setPrompt] = useState("");
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const rsp = await refreshAutos(Number(idCtxt));
        setLoading(false);
        if (rsp && rsp.length > 0) {
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
  }, [idCtxt]);

  const copiarParaClipboard = (texto: string) => {
    navigator.clipboard.writeText(texto);
    showFlashMessage("Texto copiado para a área de transferência!", "success");
  };

  const handleSendPrompt = () => {
    if (!prompt.trim()) {
      showFlashMessage("Digite um prompt antes de enviar.", "warning", 3);
      return;
    }
    //console.log("Enviando prompt:", prompt);
    setMinuta(prompt);
  };

  const handleSelectPeca = (reg: AutosRow) => {
    //console.log("Peça selecionada:", reg);

    if (reg.autos_json) {
      if (typeof reg.autos_json === "string") {
        setMinuta(reg.autos_json);
      } else {
        setMinuta(JSON.stringify(reg.autos_json, null, 4));
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
      <Grid container spacing={1} padding={1} margin={1}>
        {/************  COL-01 ***** Coluna 1: AUTOS */}
        <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2, xl: 2 }}>
          <Paper elevation={3} sx={{ height: "calc(100vh - 100px)", p: 2 }}>
            {autos.length > 0 && (
              <TableContainer sx={{ maxHeight: "calc(100vh - 180px)" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="h6">Tipo de Documento</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {autos.map((reg) => (
                      <TableRow key={reg.id_autos} hover>
                        <TableCell
                          onClick={() => handleSelectPeca(reg)}
                          sx={{ cursor: "pointer" }}
                        >
                          {getDocumentoName(reg.id_nat)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/********* COL-02: COMPLETION + PROMPT */}
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
          <Paper
            elevation={3}
            sx={{
              height: "calc(100vh - 100px)",
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
              <Typography variant="body2">
                <ReactMarkdown>{dialogo}</ReactMarkdown>
              </Typography>
            </Paper>

            {/********* COL-02 -> BOTÃO DE CÓPIA ***** */}

            <Box display="flex" justifyContent="flex-end" mb={1}>
              <Tooltip title="Copiar">
                <IconButton
                  size="small"
                  onClick={() => copiarParaClipboard(minuta)}
                >
                  <ContentCopy fontSize="small" />
                  <Typography variant="body2">Copiar</Typography>
                </IconButton>
              </Tooltip>
            </Box>

            {/********* COL-02 -> PROMPT ***** */}

            <TextField
              label={"Prompt"}
              multiline
              minRows={4}
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
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
                        >
                          <Send fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => copiarParaClipboard(prompt)}
                          edge="end"
                          title="Copiar"
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setPrompt("")}
                          edge="end"
                          title="Limpar"
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
              height: "calc(100vh - 100px)",
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
