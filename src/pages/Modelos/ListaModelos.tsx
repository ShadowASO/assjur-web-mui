/**
 * File: ListaModelos.tsx
 * Criação:  14/06/2025
 * Alterações: 10/08/2025
 * Janela para buscar e listar modelos de documentos
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { PageBaseLayout } from "../../shared/layouts";
import {
  deleteModelos,
  searchModelos,
} from "../../shared/services/api/fetch/apiTools";
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
import { useFlash } from "../../shared/contexts/FlashProvider";
import type { ModelosRow } from "../../shared/types/tabelas";
import { itemsNatureza } from "../../shared/constants/itemsModelos";

const SESSION_KEY = "ListaModelos.state";
const SCROLL_KEY = "ListaModelos.scrollTop";

type PersistedState = {
  selectedContent: string;
};

export const ListaModelos = () => {
  const navigate = useNavigate();
  const { showFlashMessage } = useFlash();
  const { debounce } = useDebounce(500);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Estado controlado + URL --------------------------------------------
  const initialSearch = searchParams.get("q") ?? "";
  const initialNatureza = searchParams.get("n") ?? "Despacho";
  const initialSelectedId = searchParams.get("sid");

  const [searchTexto, setSearchTexto] = useState<string>(initialSearch);
  const [natureza, setNatureza] = useState<string>(initialNatureza);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId
  );

  // --- Demais estados da UI -----------------------------------------------
  const [rows, setRows] = useState<ModelosRow[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const savedScrollTop = useRef<number>(0);

  // Carrega conteúdo/scroll do sessionStorage na montagem
  useEffect(() => {
    const persistedJson = sessionStorage.getItem(SESSION_KEY);
    if (persistedJson) {
      try {
        const parsed = JSON.parse(persistedJson) as PersistedState;
        if (parsed?.selectedContent) {
          setSelectedContent(parsed.selectedContent);
        }
      } catch {
        // ignore
      }
    }
    const sTop = sessionStorage.getItem(SCROLL_KEY);
    if (sTop) {
      const n = Number(sTop);
      if (!Number.isNaN(n)) {
        savedScrollTop.current = n;
      }
    }
  }, []);

  // Sincroniza search/natureza/selectedId -> URL (replace para não poluir histórico)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (searchTexto) next.set("q", searchTexto);
    else next.delete("q");

    if (natureza) next.set("n", natureza);
    else next.delete("n");

    if (selectedId) next.set("sid", selectedId);
    else next.delete("sid");

    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTexto, natureza, selectedId]);

  // Busca com debounce + proteção contra corrida
  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    debounce(async () => {
      const termo = searchTexto.trim();

      if (!termo) {
        if (!isActive) return;
        setRows([]);
        setSelectedContent("");
        setSelectedId(null);
        return;
      }

      try {
        setLoading(true);
        const rsp = await searchModelos(
          termo,
          natureza /*, { signal: controller.signal } */
        );
        if (!isActive) return;

        setRows(rsp ?? []);

        // Se existe selectedId via URL/estado, tenta re-montar selectedContent
        if (rsp?.length && selectedId) {
          const found = rsp.find((r) => r.id === selectedId);
          if (found) {
            setSelectedContent(found.inteiro_teor ?? "");
          } else {
            // Se a seleção não está mais no resultado, limpa
            setSelectedId(null);
            setSelectedContent("");
          }
        } else if (!rsp?.length) {
          setSelectedId(null);
          setSelectedContent("");
        }
      } catch (error) {
        console.error(error);
        if (isActive) {
          setRows([]);
          setSelectedId(null);
          setSelectedContent("");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [searchTexto, natureza, debounce, selectedId]);

  // Restaura o scroll após carregar linhas
  useEffect(() => {
    if (containerRef.current && savedScrollTop.current > 0) {
      containerRef.current.scrollTop = savedScrollTop.current;
      savedScrollTop.current = 0;
    }
  }, [rows.length]);

  // Salva scroll no sessionStorage em cada scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    sessionStorage.setItem(SCROLL_KEY, String(containerRef.current.scrollTop));
  };

  // Antes de navegar para detalhe, persiste selectedContent e scroll
  const goToDetalhe = (id: string) => {
    // persiste conteúdo selecionado para re-hidratar rápido no retorno
    const persist: PersistedState = {
      selectedContent,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(persist));

    if (containerRef.current) {
      sessionStorage.setItem(
        SCROLL_KEY,
        String(containerRef.current.scrollTop)
      );
    }
    //navigate(`/modelos/detalhes/${id}`);
    // dentro de goToDetalhe(row.id)
    navigate(`/modelos/detalhes/${id}`, {
      state: { fromSearch: window.location.search },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente apagar o modelo?")) {
      try {
        setLoading(true);

        const rsp = await deleteModelos(String(id));
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
        console.log(error);
        showFlashMessage("Erro ao excluir o registro", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const copiarParaClipboard = async (texto: string) => {
    try {
      if (!texto) return;
      await navigator.clipboard.writeText(texto);
      showFlashMessage(
        "Texto copiado para a área de transferência!",
        "success",
        3
      );
    } catch {
      showFlashMessage("Não foi possível copiar o texto.", "error", 3);
    }
  };

  // label do filtro (apenas exibição, sem lógica)
  const naturezaLabel = useMemo(() => natureza || "Despacho", [natureza]);

  return (
    <PageBaseLayout
      title="Modelos cadastrados"
      toolBar={
        <BarraListagem
          buttonLabel="Nova"
          fieldValue={searchTexto}
          onButtonClick={() => navigate(`/modelos/detalhes/nova`)}
          onFieldChange={(txt) => setSearchTexto(txt)}
          itemsTable={itemsNatureza}
          selectItem={(val) => setNatureza(val)}
          selected={naturezaLabel}
        />
      }
    >
      <Grid container spacing={1} padding={1} margin={1}>
        {/* COL-01 - Tabela fixa à esquerda */}
        <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7, xl: 7 }}>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: "75vh" }}
            ref={containerRef}
            onScroll={handleScroll}
          >
            <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 120 }}>Ações</TableCell>
                  <TableCell sx={{ width: 140, whiteSpace: "nowrap" }}>
                    Natureza
                  </TableCell>
                  <TableCell>Ementa</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3}>
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
                        setSelectedContent(row.inteiro_teor ?? "");
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      {/* AÇÕES */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
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
                              // Salva estado antes de navegar
                              goToDetalhe(row.id);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      {/* NATUREZA compacta */}
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={row.natureza ?? "-"}
                      >
                        {row.natureza ?? "-"}
                      </TableCell>

                      {/* EMENTA expansível */}
                      <TableCell
                        sx={{
                          maxWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                        title={row.ementa ?? ""}
                      >
                        {row.ementa ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              <TableFooter>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ p: 0 }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                )}
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>

        {/* COL-02 - Prévia à direita */}
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
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
                "& p": {
                  textIndent: "4em",
                  marginTop: 0,
                  marginBottom: "1em",
                },
              }}
            >
              {selectedContent
                .split(/\n+/)
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
            <Tooltip title="Copiar">
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
