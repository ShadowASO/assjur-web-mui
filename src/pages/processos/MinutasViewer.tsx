/**
 * File: MinutaViewer.tsx
 * Atualização: 10/10/2025
 * Finalidade: Exibir minutas em dois modos — renderizada e JSON formatado/colorido
 */

import React, { useMemo, useState, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  ButtonGroup,
  Button,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Code,
  Article,
  Print,
  PictureAsPdf,
  ContentCopy,
  WarningAmber,
} from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import SyntaxHighlighter from "react-syntax-highlighter";
import { RenderAnaliseJuridica } from "./renderAnaliseJuridica";
import { RenderSentencaIA } from "./renderSentencaIA";

// ============================================================================
// Tipos
// ============================================================================
interface TipoEvento {
  evento?: number;
  descricao?: string;
}
interface TipoAutos {
  key?: number;
  description?: string;
}
interface TiposObjeto {
  tipo?: TipoEvento | TipoAutos;
}

// ============================================================================
// Função de identificação de tipo
// ============================================================================
function getTipoDocumento(obj?: TiposObjeto): number {
  const tipo = obj?.tipo;
  if (!tipo) return 0;
  if ("evento" in tipo) return tipo.evento ?? 0;
  if ("key" in tipo) return tipo.key ?? 0;
  return 0;
}

// ============================================================================
// Roteador de renderização
// ============================================================================
function renderByTipo(tipo: number, json: string): React.ReactNode {
  switch (tipo) {
    case 201:
      return <RenderAnaliseJuridica json={json} />;
    case 202:
      return <RenderSentencaIA json={json} />;
    default:
      return (
        <Box textAlign="center" sx={{ color: "text.secondary", py: 4 }}>
          <WarningAmber sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
          <Typography variant="body2">
            Nenhum conteúdo disponível para exibição.
          </Typography>
        </Box>
      );
  }
}

// ============================================================================
// Componente principal
// ============================================================================
export const MinutaViewer: React.FC<{
  minuta: string;
  copyToClipboard: (texto: string, msgOk?: string) => void;
}> = ({ minuta, copyToClipboard }) => {
  const theme = useTheme();
  const renderRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"json" | "renderizada">(
    "renderizada"
  );

  // ================== Parse seguro ==================
  const obj: TiposObjeto | null = useMemo(() => {
    if (!minuta?.trim()) return null;
    try {
      return JSON.parse(minuta) as TiposObjeto;
    } catch {
      console.warn("⚠️ Erro ao fazer JSON.parse da minuta");
      return null;
    }
  }, [minuta]);

  const tipoInfo = useMemo(() => (obj ? getTipoDocumento(obj) : 0), [obj]);

  const jsonFormatado = useMemo(() => {
    if (!minuta?.trim()) return "{ }";
    try {
      return JSON.stringify(JSON.parse(minuta), null, 2);
    } catch {
      return minuta;
    }
  }, [minuta]);

  // ================== Ações ==================
  const handlePrint = useReactToPrint({
    documentTitle: "Minuta",
    //content: () => renderRef.current,
  });

  const handleExportPDF = useCallback(async () => {
    if (!renderRef.current) return;
    const canvas = await html2canvas(renderRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("documento.pdf");
  }, []);

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <Paper
      elevation={3}
      sx={{
        height: "calc(100vh - 220px)",
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ====== Barra de modo e ações ====== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <ButtonGroup variant="outlined" size="small">
          <Button
            startIcon={<Article />}
            onClick={() => setViewMode("renderizada")}
            variant={viewMode === "renderizada" ? "contained" : "outlined"}
          >
            Renderizada
          </Button>
          <Button
            startIcon={<Code />}
            onClick={() => setViewMode("json")}
            variant={viewMode === "json" ? "contained" : "outlined"}
          >
            JSON
          </Button>
        </ButtonGroup>

        <Box display="flex" alignItems="center" gap={1}>
          {viewMode === "renderizada" && (
            <>
              <Tooltip title="Imprimir documento">
                <IconButton size="small" onClick={handlePrint}>
                  <Print fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exportar como PDF">
                <IconButton size="small" onClick={handleExportPDF}>
                  <PictureAsPdf fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Copiar conteúdo">
            <span>
              <IconButton
                size="small"
                onClick={() => copyToClipboard(minuta, "Conteúdo copiado!")}
                disabled={!minuta?.trim()}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* ====== Área de conteúdo ====== */}
      <Paper
        variant="outlined"
        sx={{
          flexGrow: 1,
          p: 2,
          overflow: "auto",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {viewMode === "json" ? (
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
        ) : (
          <Box ref={renderRef}>{renderByTipo(tipoInfo, minuta)}</Box>
        )}
      </Paper>
    </Paper>
  );
};
