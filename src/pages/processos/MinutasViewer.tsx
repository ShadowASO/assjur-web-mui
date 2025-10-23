/**
 * File: MinutaViewer.tsx
 * Atualização: 11/10/2025
 * Finalidade: Exibir minutas em três modos — renderizada, documento e JSON, com exportação PDF aprimorada
 */

import React, { useMemo, useState, useRef } from "react";
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
  Print,
  //PictureAsPdf,
  ContentCopy,
  WarningAmber,
  Description,
} from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";

import SyntaxHighlighter from "react-syntax-highlighter";
import { RenderAnaliseJuridica } from "./renders/renderAnaliseJuridica";
import { RenderMinutaSentenca } from "./renders/renderMinutaSentenca";
import style from "../../shared/styles/printformat.module.css";

//import { exportPDFEnriquecido } from "./exportPDFEnriquecido";

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
// Identificação de tipo
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
function renderByTipo(
  tipo: number,
  json: string,
  modoDocumento?: boolean
): React.ReactNode {
  switch (tipo) {
    case 201:
      return (
        <RenderAnaliseJuridica json={json} modoDocumento={modoDocumento} />
      );
    case 202:
      return <RenderMinutaSentenca json={json} modoDocumento={modoDocumento} />;
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
  const [viewMode, setViewMode] = useState<
    "json" | "renderizada" | "documento"
  >("documento");

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

  // ================== Impressão ==================
  const tempPrintRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Minuta",
    contentRef: tempPrintRef, // ✅ tipagem correta
    onBeforePrint: async () => {
      if (!renderRef.current) return;

      // 🔹 Cria clone e container invisível
      const clone = renderRef.current.cloneNode(true) as HTMLDivElement;
      clone.style.padding = "0";
      clone.style.margin = "0";
      clone.style.minHeight = "auto";

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.appendChild(clone);

      document.body.appendChild(container);

      // 🔹 aponta o ref para o clone
      tempPrintRef.current = clone;
    },
    onAfterPrint: () => {
      if (tempPrintRef.current?.parentNode) {
        tempPrintRef.current.parentNode.removeChild(tempPrintRef.current);
      }
      tempPrintRef.current = null;
      console.log("🖨️ Clone removido após impressão.");
    },
  });

  // ================== Exportação PDF com margens ==================

  // const handleExportPDF = useCallback(async () => {
  //   if (!renderRef.current) return;
  //   const html = renderRef.current.innerHTML;
  //   await exportPDFEnriquecido(html, "Minuta de Sentença");
  // }, []);

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <Paper
      elevation={3}
      sx={{
        height: "calc(100vh - 180px)",
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
            startIcon={<Description />}
            onClick={() => setViewMode("documento")}
            variant={viewMode === "documento" ? "contained" : "outlined"}
          >
            Documento
          </Button>
          {/* <Button
            startIcon={<Article />}
            onClick={() => setViewMode("renderizada")}
            variant={viewMode === "renderizada" ? "contained" : "outlined"}
          >
            Renderizada
          </Button> */}

          <Button
            startIcon={<Code />}
            onClick={() => setViewMode("json")}
            variant={viewMode === "json" ? "contained" : "outlined"}
          >
            JSON
          </Button>
        </ButtonGroup>

        <Box display="flex" alignItems="center" gap={1}>
          {viewMode !== "json" && (
            <>
              <Tooltip title="Imprimir documento">
                <IconButton size="small" onClick={handlePrint}>
                  <Print fontSize="small" />
                </IconButton>
              </Tooltip>
              {/* <Tooltip title="Exportar como PDF">
                <IconButton size="small" onClick={handleExportPDF}>
                  <PictureAsPdf fontSize="small" />
                </IconButton>
              </Tooltip> */}
            </>
          )}
          <Tooltip title="Copiar conteúdo">
            <span>
              <IconButton
                size="small"
                onClick={async () => {
                  if (!renderRef.current && viewMode !== "json") return;

                  let plainText = "";
                  let htmlText = "";

                  if (viewMode === "json") {
                    plainText = jsonFormatado;
                    htmlText = `<pre>${jsonFormatado}</pre>`;
                  } else {
                    plainText = renderRef.current?.innerText?.trim() || "";
                    htmlText = renderRef.current?.innerHTML?.trim() || "";
                  }

                  try {
                    const clipboard = (
                      navigator as Navigator & {
                        clipboard: Clipboard & {
                          write?: (items: ClipboardItem[]) => Promise<void>;
                        };
                      }
                    ).clipboard;

                    if (clipboard.write) {
                      await clipboard.write([
                        new ClipboardItem({
                          "text/html": new Blob([htmlText], {
                            type: "text/html",
                          }),
                          "text/plain": new Blob([plainText], {
                            type: "text/plain",
                          }),
                        }),
                      ]);
                    } else {
                      await clipboard.writeText(plainText);
                    }

                    copyToClipboard(
                      plainText,
                      `Conteúdo da aba "${viewMode}" copiado com formatação!`
                    );
                  } catch (err) {
                    console.error("Erro ao copiar:", err);
                    copyToClipboard(
                      plainText,
                      `Conteúdo da aba "${viewMode}" copiado como texto simples.`
                    );
                  }
                }}
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
        ) : viewMode === "documento" ? (
          <Box
            ref={renderRef}
            className={`${style.printpage} ${style.printheader} ${style.printfooter}`}
            sx={{
              padding: "25mm 20mm",
              minHeight: "297mm",

              mx: "auto",
              backgroundColor: "#fff",
              color: "#000",
              fontFamily: '"Times New Roman", serif',
              fontSize: "12pt",
              lineHeight: 1.6,
              textAlign: "justify",
              wordBreak: "break-word", // evita cortes feios
              whiteSpace: "normal", // garante quebra automática
              "& p": {
                textIndent: "5em",
                marginBottom: "12px",
                pageBreakInside: "avoid",
              },
              "& .page-break": {
                pageBreakAfter: "always",
                breakAfter: "page",
              },
            }}
          >
            {renderByTipo(tipoInfo, minuta, true)}
          </Box>
        ) : (
          <Box ref={renderRef}>{renderByTipo(tipoInfo, minuta, false)}</Box>
        )}
      </Paper>
    </Paper>
  );
};
