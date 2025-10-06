import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { PageBaseLayout } from "../../shared/layouts";
import { deleteRAG, searchRAG } from "../../shared/services/api/fetch/apiTools";
import { useDebounce } from "../../shared/hooks/UseDebounce";
import {
  Box,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { ContentCopy, Delete, Edit } from "@mui/icons-material";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import { describeApiError } from "../../shared/services/api/erros/errosApi";
import type { BaseRow } from "./typeRAG";

const SESSION_KEY = "ListaRAG.state";
const SCROLL_KEY = "ListaRAG.scrollTop";

type PersistedState = {
  selectedContent: string;
};

export const ListaRAG = () => {
  const navigate = useNavigate();
  const { showFlashMessage } = useFlash();
  const { debounce } = useDebounce(500);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("q") ?? "";
  const initialSelectedId = searchParams.get("sid");

  const [searchTexto, setSearchTexto] = useState<string>(initialSearch);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId
  );
  const [rows, setRows] = useState<BaseRow[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const savedScrollTop = useRef<number>(0);
  const lastParamsRef = useRef<{ termo: string } | null>(null);

  // Carrega estado salvo
  useEffect(() => {
    const persistedJson = sessionStorage.getItem(SESSION_KEY);
    if (persistedJson) {
      try {
        const parsed = JSON.parse(persistedJson) as PersistedState;
        if (parsed?.selectedContent) {
          setSelectedContent(parsed.selectedContent);
        }
      } catch (err) {
        console.warn("Falha ao restaurar estado salvo da sessão:", err);
        sessionStorage.removeItem(SESSION_KEY); // limpa o item inválido
      }
    }

    const sTop = sessionStorage.getItem(SCROLL_KEY);
    if (sTop) {
      const n = Number(sTop);
      if (!Number.isNaN(n)) savedScrollTop.current = n;
    }
  }, []);

  // Atualiza parâmetros na URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (searchTexto) next.set("q", searchTexto);
    else next.delete("q");

    if (selectedId) next.set("sid", selectedId);
    else next.delete("sid");

    const nextStr = next.toString();
    const curStr = searchParams.toString();
    if (nextStr !== curStr) setSearchParams(next, { replace: true });
  }, [searchTexto, selectedId]);

  // Busca RAG
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    debounce(async () => {
      if (cancelled) return;
      const termo = searchTexto.trim();

      const sameParams =
        lastParamsRef.current && lastParamsRef.current.termo === termo;
      if (sameParams) return;

      lastParamsRef.current = { termo };

      if (!termo) {
        setRows([]);
        setSelectedContent("");
        setSelectedId(null);
        return;
      }

      try {
        setLoading(true);
        const rsp = await searchRAG(termo, "", {
          signal: controller.signal,
        });

        setRows(rsp ?? []);
        if (rsp?.length && selectedId) {
          const found = rsp.find((r) => r.id === selectedId);
          if (found) {
            setSelectedContent(found.data_texto ?? "");
          } else {
            setSelectedId(null);
            setSelectedContent("");
          }
        }
      } catch (error) {
        // @ts-expect-error Abort check
        if (error?.name === "AbortError") return;
        setRows([]);
        setSelectedId(null);
        setSelectedContent("");
        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchTexto, selectedId]);

  useEffect(() => {
    if (containerRef.current && savedScrollTop.current > 0) {
      containerRef.current.scrollTop = savedScrollTop.current;
      savedScrollTop.current = 0;
    }
  }, [rows.length]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    sessionStorage.setItem(SCROLL_KEY, String(containerRef.current.scrollTop));
  }, []);

  const goToDetalhe = useCallback(
    (id: string) => {
      const persist: PersistedState = { selectedContent };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(persist));
      if (containerRef.current) {
        sessionStorage.setItem(
          SCROLL_KEY,
          String(containerRef.current.scrollTop)
        );
      }
      navigate(`/rag/detalhes/${id}`, {
        state: { fromSearch: window.location.search },
      });
    },
    [navigate, selectedContent]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Deseja realmente apagar o registro RAG?")) return;
      try {
        setLoading(true);
        const rsp = await deleteRAG(String(id));
        if (rsp) {
          setRows((old) => old.filter((item) => item.id !== id));
          if (selectedId === id) {
            setSelectedId(null);
            setSelectedContent("");
          }
          showFlashMessage("Registro excluído com sucesso", "success");
        } else {
          showFlashMessage("Erro ao excluir o registro", "error");
        }
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg,
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedId, showFlashMessage]
  );

  const copiarParaClipboard = useCallback(
    async (texto: string) => {
      try {
        if (!texto) return;
        await navigator.clipboard.writeText(texto);
        showFlashMessage("Texto copiado!", "success", 3);
      } catch {
        showFlashMessage("Não foi possível copiar o texto.", "error", 3);
      }
    },
    [showFlashMessage]
  );

  return (
    <PageBaseLayout
      title="Base de Conhecimento RAG"
      toolBar={
        <BarraListagem
          buttonLabel="Novo"
          fieldValue={searchTexto}
          onButtonClick={() => navigate(`/rag/detalhes/novo`)}
          onFieldChange={(txt) => setSearchTexto(txt)}
        />
      }
    >
      <Grid container spacing={1} padding={1} margin={1}>
        {/* COL-01: Tabela */}
        <Grid size={{ xs: 12, md: 7 }}>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: "75vh" }}
            ref={containerRef}
            onScroll={handleScroll}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 120 }}>Ações</TableCell>
                  <TableCell sx={{ width: 140 }}>Classe</TableCell>
                  <TableCell>Assunto</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>ID PJe</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum resultado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      selected={selectedId === row.id}
                      onClick={() => {
                        setSelectedId(row.id);
                        setSelectedContent(row.data_texto ?? "");
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(row.id);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              goToDetalhe(row.id);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{row.classe ?? "-"}</TableCell>
                      <TableCell>{row.assunto ?? "-"}</TableCell>
                      <TableCell>{row.tipo ?? "-"}</TableCell>
                      <TableCell>{row.id_pje ?? "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0 }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                )}
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>

        {/* COL-02: Conteúdo */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{
              height: "calc(100vh - 350px)",
              overflowY: "auto",
              p: 2,
              whiteSpace: "pre-wrap",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                textAlign: "justify",
                wordBreak: "break-word",
                lineHeight: 1.6,
              }}
            >
              {selectedContent
                ?.split(/\n+/)
                .filter((p) => p.trim() !== "")
                .map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
            </Typography>
          </Paper>
          <Box
            display="flex"
            justifyContent="flex-end"
            height="56px"
            alignItems="center"
          >
            <Tooltip title="Copiar texto">
              <span>
                <IconButton
                  onClick={() => copiarParaClipboard(selectedContent)}
                  disabled={isLoading || !selectedContent}
                >
                  <ContentCopy fontSize="small" />
                  <Typography variant="body2" ml={0.5}>
                    Copiar
                  </Typography>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </PageBaseLayout>
  );
};
