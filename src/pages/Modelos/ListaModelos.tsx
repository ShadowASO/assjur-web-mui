/**
 * File: ListaModelos.tsx
 * Criação:  14/06/2025
 * Alterações: 15/08/2025 (dedupe + cancelamento + URL guard)
 * Janela para buscar e listar modelos de documentos
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import type { ModelosRow } from "../../shared/types/tabelas";
import { itemsNatureza } from "../../shared/constants/itemsModelos";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

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
  // const initialSearch = searchParams.get("q") ?? "";
  // const initialNatureza = searchParams.get("n") ?? "Despacho";
  // const initialSelectedId = searchParams.get("sid");

  const initialSearch = searchParams.get("q") ?? "";
  const initialNatureza = searchParams.get("n") ?? "Despacho";

  // ✅ Só aceita sid se houver busca (q). Sem busca, não existe "seleção válida".
  const initialSelectedId = initialSearch.trim()
    ? searchParams.get("sid")
    : null;

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

  // Para deduplicar chamadas com os mesmos parâmetros
  const lastParamsRef = useRef<{ termo: string; natureza: string } | null>(
    null
  );

  // Carrega conteúdo/scroll do sessionStorage na montagem
  // useEffect(() => {
  //   const persistedJson = sessionStorage.getItem(SESSION_KEY);
  //   if (persistedJson) {
  //     try {
  //       const parsed = JSON.parse(persistedJson) as PersistedState;
  //       if (parsed?.selectedContent) setSelectedContent(parsed.selectedContent);
  //     } catch {
  //       /* noop */
  //     }
  //   }
  //   const sTop = sessionStorage.getItem(SCROLL_KEY);
  //   if (sTop) {
  //     const n = Number(sTop);
  //     if (!Number.isNaN(n)) savedScrollTop.current = n;
  //   }
  // }, []);

  useEffect(() => {
    const hasQuery = initialSearch.trim().length > 0;
    const hasSelection = !!initialSelectedId;

    // ✅ Se entrou "limpo" (sem busca), não rehidrata preview/scroll antigo
    if (!hasQuery) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SCROLL_KEY);
      setSelectedContent("");
      setSelectedId(null);
      return;
    }

    // ✅ Só rehidrata conteúdo se houver busca + seleção (q + sid)
    if (hasQuery && hasSelection) {
      const persistedJson = sessionStorage.getItem(SESSION_KEY);
      if (persistedJson) {
        try {
          const parsed = JSON.parse(persistedJson) as PersistedState;
          if (parsed?.selectedContent)
            setSelectedContent(parsed.selectedContent);
        } catch {
          /* noop */
        }
      }
    }

    const sTop = sessionStorage.getItem(SCROLL_KEY);
    if (sTop) {
      const n = Number(sTop);
      if (!Number.isNaN(n)) savedScrollTop.current = n;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // **GUARDA**: só atualiza a URL se houve mudança real
    const nextStr = next.toString();
    const curStr = searchParams.toString();
    if (nextStr !== curStr) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTexto, natureza, selectedId]);

  // Busca com debounce + cancelamento + dedupe de parâmetros
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    // NÃO dependemos da identidade de `debounce` para não re-disparar
    debounce(async () => {
      if (cancelled) return;

      const termo = searchTexto.trim();

      // Deduplica por parâmetros (evita duplicação no StrictMode)
      const sameParams =
        lastParamsRef.current &&
        lastParamsRef.current.termo === termo &&
        lastParamsRef.current.natureza === natureza;

      if (sameParams) return; // evita hit duplicado

      lastParamsRef.current = { termo, natureza };

      if (!termo) {
        setRows([]);
        setSelectedContent("");
        setSelectedId(null);
        return;
      }

      try {
        setLoading(true);
        // **CANCELAMENTO REAL**: passe o signal até a camada de API
        const rsp = await searchModelos(termo, natureza, {
          signal: controller.signal,
        });

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
        // Se o erro foi por abort, ignore silenciosamente
        // @ts-expect-error: AbortError check
        if (error?.name === "AbortError") return;

        setRows([]);
        setSelectedId(null);
        setSelectedContent("");

        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg, // aparece no botão (i)
        });
      } finally {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      //controller.abort(); // aborta a execução anterior (evita 2º hit no StrictMode)
    };
    // Dependemos apenas dos VALORES que alteram o request;
    // não incluímos `debounce` para evitar disparos por mudança de identidade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTexto, natureza, selectedId]); // <- `selectedId` aqui só para reconstruir preview após retorno

  // Restaura o scroll após carregar linhas
  useEffect(() => {
    if (containerRef.current && savedScrollTop.current > 0) {
      containerRef.current.scrollTop = savedScrollTop.current;
      savedScrollTop.current = 0;
    }
  }, [rows.length]);

  // Salva scroll no sessionStorage em cada scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    sessionStorage.setItem(SCROLL_KEY, String(containerRef.current.scrollTop));
  }, []);

  // Antes de navegar para detalhe, persiste selectedContent e scroll
  const goToDetalhe = useCallback(
    (id: string) => {
      // persiste conteúdo selecionado para re-hidratar rápido no retorno
      const persist: PersistedState = { selectedContent };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(persist));

      if (containerRef.current) {
        sessionStorage.setItem(
          SCROLL_KEY,
          String(containerRef.current.scrollTop)
        );
      }

      navigate(`/modelos/detalhes/${id}`, {
        state: { fromSearch: window.location.search },
      });
    },
    [navigate, selectedContent]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Deseja realmente apagar o modelo?")) return;

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
        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg, // aparece no botão (i)
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
        showFlashMessage(
          "Texto copiado para a área de transferência!",
          "success",
          3
        );
      } catch {
        showFlashMessage("Não foi possível copiar o texto.", "error", 3);
      }
    },
    [showFlashMessage]
  );

  // label do filtro (apenas exibição, sem lógica)
  const naturezaLabel = useMemo(() => natureza || "Despacho", [natureza]);

  return (
    <PageBaseLayout
      title="Modelos Cadastrados"
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

        {/* COL-02 - Preview à direita */}
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
            {!selectedId || !selectedContent ? (
              <Typography variant="body2" color="text.secondary">
                Faça uma busca e selecione um modelo na lista para visualizar o
                conteúdo.
              </Typography>
            ) : (
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
            )}
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
