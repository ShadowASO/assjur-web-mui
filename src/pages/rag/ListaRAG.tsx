import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { PageBaseLayout } from "../../shared/layouts";
import { deleteRAG, searchRAG } from "../../shared/services/api/fetch/apiTools";
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
  searchTexto: string;
  selectedId: string | null;
  selectedContent: string;
  updatedAt: number;
};

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export const ListaRAG = () => {
  const navigate = useNavigate();
  const { showFlashMessage } = useFlash();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fonte de verdade inicial: URL
  const initialSearch = searchParams.get("q") ?? "";
  const initialSelectedId = searchParams.get("sid");

  const [searchTexto, setSearchTexto] = useState<string>(initialSearch);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );
  const [rows, setRows] = useState<BaseRow[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const savedScrollTop = useRef<number>(0);

  // ✅ refs para evitar re-busca ao clicar
  const selectedIdRef = useRef<string | null>(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // ✅ debounce/abort robustos
  const debounceTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const persistState = useCallback(
    (partial?: Partial<PersistedState>) => {
      const next: PersistedState = {
        searchTexto,
        selectedId,
        selectedContent,
        updatedAt: Date.now(),
        ...(partial ?? {}),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    },
    [searchTexto, selectedContent, selectedId],
  );

  // Carrega estado salvo (somente quando há contexto na URL)
  useEffect(() => {
    // scroll
    const sTop = sessionStorage.getItem(SCROLL_KEY);
    if (sTop) {
      const n = Number(sTop);
      if (!Number.isNaN(n)) savedScrollTop.current = n;
    }

    // Evita “texto órfão”: se não há contexto (q/sid) na URL, não restaura.
    const hasUrlContext = Boolean(initialSearch) || Boolean(initialSelectedId);
    if (!hasUrlContext) {
      setSelectedContent("");
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    const persistedJson = sessionStorage.getItem(SESSION_KEY);
    if (!persistedJson) return;

    try {
      const parsed = JSON.parse(persistedJson) as Partial<PersistedState>;

      // Preferir URL como fonte de verdade:
      // - Se URL não tem q/sid, permite restaurar do storage
      if (!initialSearch && typeof parsed.searchTexto === "string") {
        setSearchTexto(parsed.searchTexto);
      }
      if (!initialSelectedId && typeof parsed.selectedId === "string") {
        setSelectedId(parsed.selectedId);
      }

      // Texto pode ser restaurado como placeholder, mas será validado após a busca.
      if (typeof parsed.selectedContent === "string") {
        setSelectedContent(parsed.selectedContent);
      }
    } catch (err) {
      console.warn("Falha ao restaurar estado salvo da sessão:", err);
      sessionStorage.removeItem(SESSION_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza parâmetros na URL (sem depender do searchParams atual)
  useEffect(() => {
    const next = new URLSearchParams();
    if (searchTexto) next.set("q", searchTexto);
    if (selectedId) next.set("sid", selectedId);
    setSearchParams(next, { replace: true });
  }, [searchTexto, selectedId, setSearchParams]);

  // Persistir automaticamente (mantém coerência ao voltar)
  useEffect(() => {
    const hasSomething = Boolean(searchTexto.trim()) || Boolean(selectedId);
    if (!hasSomething) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    persistState();
  }, [persistState, searchTexto, selectedId, selectedContent]);

  // ✅ Busca RAG: depende APENAS do termo (não do selectedId)
  useEffect(() => {
    // cancela debounce anterior
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // aborta request anterior
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const termo = searchTexto.trim();

    // termo vazio => sem backend
    if (!termo) {
      setRows([]);
      setSelectedId(null);
      setSelectedContent("");
      setLoading(false);
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);

        const rsp = await searchRAG(termo, "", { signal: controller.signal });
        //console.log(rsp);
        const list = rsp ?? [];
        setRows(list);

        // valida seleção (sem disparar nova busca)
        const sid = selectedIdRef.current;
        if (!sid) {
          setSelectedContent("");
          return;
        }

        const found = list.find((r) => r.id === sid);
        if (found) {
          setSelectedContent(found.texto ?? "");
        } else {
          setSelectedId(null);
          setSelectedContent("");
        }
      } catch (error: unknown) {
        if (isAbortError(error)) return;

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
        if (abortRef.current === controller) abortRef.current = null;
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [searchTexto, showFlashMessage]);

  // Restaura scroll após a lista carregar
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
      // Persiste estado completo antes de sair
      //console.log(id);
      persistState({
        searchTexto,
        selectedId,
        selectedContent,
      });

      if (containerRef.current) {
        sessionStorage.setItem(
          SCROLL_KEY,
          String(containerRef.current.scrollTop),
        );
      }

      navigate(`/rag/detalhes/${id}`, {
        state: { fromSearch: window.location.search },
      });
    },
    [navigate, persistState, searchTexto, selectedId, selectedContent],
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
      } catch (error: unknown) {
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
    [selectedId, showFlashMessage],
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
    [showFlashMessage],
  );

  return (
    <PageBaseLayout
      title="Precedentes"
      toolBar={
        <BarraListagem
          buttonLabel="Novo"
          fieldValue={searchTexto}
          onButtonClick={() => navigate(`/rag/detalhes/novo`)}
          onFieldChange={(txt) => setSearchTexto(txt ?? "")}
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
                    <TableCell colSpan={5}>
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
                        setSelectedContent(row.texto ?? "");
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
                    <TableCell colSpan={5} sx={{ p: 0 }}>
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
              component="div"
              sx={{
                whiteSpace: "pre-wrap",
                textAlign: "justify",
                wordBreak: "break-word",
                lineHeight: 1.6,
              }}
            >
              {selectedContent
                ?.split(/\n+/)
                .map((s) => s.trim())
                .filter(Boolean)
                .map((paragraph, idx) => (
                  <Typography
                    key={idx}
                    component="p"
                    variant="body2"
                    sx={{ mb: 1 }}
                  >
                    {paragraph}
                  </Typography>
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
