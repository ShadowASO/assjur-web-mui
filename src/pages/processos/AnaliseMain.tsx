//import React from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { refreshAutos } from "../../shared/services/api/fetch/apiTools";
import type { AutosRow } from "../../shared/types/tabelas";
import { getDocumentoName } from "../../shared/constants/itemsPrompt";

//import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  atomDark,
  duotoneLight,
  duotoneSea,
  materialOceanic,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import { MarkdownHighlighter } from "../../shared/components/MarkdownHiglighter";

// const customStyle = {
//   lineHeight: "1.5",
//   fontSize: "1rem",
//   borderRadius: "5px",
//   backgroundColor: "#f7f7f7",
//   padding: "20px",
// };

export const AnalisesMain = () => {
  const { id: idCtxt } = useParams();
  const { showFlashMessage } = useFlash();
  const [isLoading, setIsLoading] = useState(false);

  const [autos, setAutos] = useState<AutosRow[]>([]);
  const [minuta, setMinuta] = useState("");
  const [dialogo, setDialogo] = useState("");
  const [prompt, setPrompt] = useState("");
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const rsp = await refreshAutos(Number(idCtxt));
      setIsLoading(false);
      if (rsp && rsp.length > 0) {
        setAutos(rsp);
      } else {
        setAutos([]);
        showFlashMessage(
          "Nenhum registro retornado",
          "error",
          TIME_FLASH_ALERTA_SEC
        );
      }
    })();
  }, [idCtxt]);

  const copiarParaClipboard = (texto: string) => {
    navigator.clipboard.writeText(texto);
    showFlashMessage(
      "Texto copiado para a área de transferência!",
      "success",
      3
    );
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
        {/* Coluna 1: AUTOS */}
        <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2, xl: 2 }}>
          <Paper elevation={3} sx={{ height: "calc(100vh - 100px)", p: 2 }}>
            {/* Simulação de itens do grid */}
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
                          {getDocumentoName(reg.id_nat).description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Coluna 2: COMPLETION + PROMPT */}
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
            <Paper
              variant="outlined"
              sx={{
                flexGrow: 1,
                mb: 4,
                p: 2,
                overflow: "auto",
                backgroundColor: theme.palette.background.default,
              }}
            >
              {/* Botão para copiar para área de transferência */}
              <Box display="flex" justifyContent="flex-end" mb={1}>
                <Tooltip title="Copiar conteúdo">
                  <IconButton
                    size="small"
                    onClick={() => copiarParaClipboard(minuta)}
                  >
                    <ContentCopy fontSize="small" />
                    Copiar
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2">
                <ReactMarkdown>{dialogo}</ReactMarkdown>
              </Typography>
            </Paper>

            {/* Campo de Prompt */}

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

        {/* Coluna 3: TEXTO */}
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
            <Box
              flexGrow={1}
              component={Paper}
              variant="outlined"
              sx={{
                flexGrow: 1,
                overflow: "auto",

                mb: 0,
                p: 2,
                backgroundColor: theme.palette.background.default,
              }}
            >
              {/* Botão para copiar para área de transferência */}
              <Box display="flex" justifyContent="flex-end" mb={1}>
                <Tooltip title="Copiar conteúdo">
                  <IconButton
                    size="small"
                    onClick={() => copiarParaClipboard(minuta)}
                  >
                    <ContentCopy fontSize="small" />
                    Copiar
                  </IconButton>
                </Tooltip>
              </Box>

              {/* <ReactMarkdown>{`\`\`\`json\n${minuta}\n\`\`\``}</ReactMarkdown> */}
              <MarkdownHighlighter
                thema={duotoneLight}
                language="json"
                customStyle={{
                  backgroundColor: theme.palette.background.default,
                }}
                // customStyle={customStyle}
              >
                {`\`\`\`json\n${minuta}\n\`\`\``}
              </MarkdownHighlighter>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
