/**
 * File: ListaDocumentos.tsx
 * Criação:  14/06/2025
 * Finalidade: Listar documentos (peças processuais) e permitir ações em lote
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  LinearProgress,
  Box,
  Checkbox,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete, PostAdd, Visibility } from "@mui/icons-material";
import { refreshByContexto } from "../../shared/services/api/fetch/apiTools";
import type { DocsRow } from "../../shared/types/tabelas";
import { getDocumentoName } from "../../shared/constants/autosDoc";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

interface ListaDocumentosProps {
  idCtxt: string;
  refreshKey: number;

  onView: (id_doc: string, id_pje: string, texto: string) => void;

  onJuntada: (fileId: string) => void | Promise<void>;
  onJuntadaMultipla?: (fileIds: string[]) => void | Promise<void>;

  // ✅ agora é estrito: sempre Promise<void>
  onDelete: (fileId: string) => Promise<void>;

  loading?: boolean;

  /** ✅ envia lista carregada para o componente pai (navegação no dialog) */
  onLoadList?: (docs: { id: string; pje: string; texto: string }[]) => void;

  currentId?: string; // ✅ ID atualmente exibido no Dialog (para highlight)

  /** ✅ controlado pelo pai: true = exibe tudo; false = filtra "Outros Documentos" */
  exibirOutrosDocumentos: boolean;

  /** ✅ callback para alternar */
  onChangeExibirOutrosDocumentos: (value: boolean) => void;
}

export const ListaDocumentos = ({
  idCtxt,
  onView,
  onJuntada,
  onJuntadaMultipla,
  onDelete,
  refreshKey,
  loading,
  onLoadList,
  currentId,
  exibirOutrosDocumentos,
  onChangeExibirOutrosDocumentos,
}: ListaDocumentosProps) => {
  const [rows, setRows] = useState<DocsRow[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [batchBusy, setBatchBusy] = useState(false);

  const mountedRef = useRef(true);
  const callLockRef = useRef(false);
  const rowsRef = useRef<DocsRow[]>([]);

  const isLoading = loading ?? internalLoading;

  // ✅ lista visível (aplica filtro só na UI)
  const visibleRows = useMemo(() => {
    if (exibirOutrosDocumentos) return rows;

    return rows.filter((row) => {
      const nome = (getDocumentoName(row.id_natu) || "").trim();
      return nome !== "Outros Documentos";
    });

    // se preferir pelo campo puro:
    // return rows.filter((row) => String(row.id_natu).trim() !== "Outros Documentos");
  }, [rows, exibirOutrosDocumentos]);

  useEffect(() => {
    if (!onLoadList) return;

    onLoadList(
      visibleRows.map((r) => ({
        id: r.id,
        pje: r.id_pje,
        texto: r.doc ?? "",
      })),
    );
  }, [visibleRows, onLoadList]);

  // ✅ (opcional, mas recomendado) mantém selected coerente quando o filtro muda
  useEffect(() => {
    const visiveis = new Set(visibleRows.map((r) => r.id));
    setSelected((prev) => prev.filter((id) => visiveis.has(id)));
  }, [visibleRows]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function applyNewList(novaLista: DocsRow[]) {
    rowsRef.current = novaLista;

    setRows(novaLista);

    setSelected((prev) =>
      prev.filter((id) => novaLista.some((r) => r.id === id)),
    );
  }

  // Carregar documentos
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setInternalLoading(true);

        const rsp = await refreshByContexto(idCtxt);
        const novaLista = Array.isArray(rsp) ? rsp : [];

        if (!cancelled && mountedRef.current) {
          applyNewList(novaLista);
        }
      } catch (error) {
        const { techMsg } = describeApiError(error);
        console.error("Erro ao carregar documentos:", techMsg);

        if (!cancelled && mountedRef.current) {
          applyNewList([]);
        }
      } finally {
        if (!cancelled && mountedRef.current) setInternalLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idCtxt, refreshKey, onLoadList]);

  function handleViewText(id: string) {
    const registro = rowsRef.current.find((row) => row.id === id);
    if (registro) onView(registro.id, registro.id_pje, registro.doc);
    else onView("", id, "Texto não disponível");
  }

  function handleCheckbox(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sel) => sel !== id) : [...prev, id],
    );
  }

  function handleSelectAll(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      //setSelected(rowsRef.current.map((row) => row.id));
      setSelected(visibleRows.map((row) => row.id));
    } else {
      setSelected([]);
    }
  }

  function markBusy(ids: string[], value: boolean) {
    setBusyIds((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = value));
      return next;
    });
  }

  async function handleAutuarSelecionados() {
    if (callLockRef.current) return;
    callLockRef.current = true;

    const initialSelected = [...selected];

    try {
      if (initialSelected.length === 0 || isLoading || batchBusy) return;

      const pendentes = initialSelected.filter((id) => !busyIds[id]);
      if (pendentes.length === 0) return;

      setBatchBusy(true);
      markBusy(pendentes, true);

      if (onJuntadaMultipla) {
        await onJuntadaMultipla(pendentes);
      } else {
        await Promise.all(
          pendentes.map((id) => Promise.resolve(onJuntada(id))),
        );
      }

      if (mountedRef.current) setSelected([]);

      // (Opcional) se quiser refletir rápido a juntada, recarregue:
      // const rsp = await refreshByContexto(idCtxt);
      // const novaLista = Array.isArray(rsp) ? rsp : [];
      // if (mountedRef.current) applyNewList(novaLista);

      await new Promise((r) => setTimeout(r, 250));
    } finally {
      if (mountedRef.current) {
        markBusy(initialSelected, false);
        setBatchBusy(false);
      }
      setTimeout(() => {
        callLockRef.current = false;
      }, 200);
    }
  }

  // ✅ DELETE EM LOTE: sempre recarrega a lista determinísticamente
  async function handleDeleteSelecionados() {
    if (callLockRef.current) return;
    callLockRef.current = true;

    const initialSelected = [...selected];

    try {
      if (initialSelected.length === 0 || isLoading || batchBusy) return;

      const pendentes = initialSelected.filter((id) => !busyIds[id]);
      if (pendentes.length === 0) return;

      setBatchBusy(true);
      markBusy(pendentes, true);

      await Promise.all(pendentes.map((id) => Promise.resolve(onDelete(id))));

      if (mountedRef.current) setSelected([]);

      // ✅ força recarregar do backend
      try {
        const rsp = await refreshByContexto(idCtxt);
        const novaLista = Array.isArray(rsp) ? rsp : [];
        if (mountedRef.current) applyNewList(novaLista);
      } catch (error) {
        const { techMsg } = describeApiError(error);
        console.error("Erro ao recarregar após deleção:", techMsg);

        // fallback seguro: remove otimisticamente os deletados da UI atual
        if (mountedRef.current) {
          const atual = rowsRef.current;
          const fallback = atual.filter((r) => !pendentes.includes(r.id));
          applyNewList(fallback);
        }
      }

      await new Promise((r) => setTimeout(r, 150));
    } finally {
      if (mountedRef.current) {
        markBusy(initialSelected, false);
        setBatchBusy(false);
      }
      setTimeout(() => {
        callLockRef.current = false;
      }, 200);
    }
  }

  const { allSelected, someSelected } = useMemo(() => {
    const totalVisiveis = visibleRows.length;
    const all = totalVisiveis > 0 && selected.length === totalVisiveis;
    const some = selected.length > 0 && !all;
    return { allSelected: all, someSelected: some };
  }, [visibleRows.length, selected.length]);

  function isRowBusy(id: string) {
    return !!busyIds[id] || batchBusy || isLoading;
  }

  const empty = visibleRows.length === 0;

  return (
    <Box position="relative" sx={{ maxHeight: 700, overflowY: "auto" }}>
      {/* Barra de ações em lote */}
      <Box display="flex" alignItems="center" p={1} gap={2}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={selected.length === 0 || isLoading || batchBusy}
          onClick={handleAutuarSelecionados}
          startIcon={<PostAdd />}
        >
          Autuar
        </Button>

        <Button
          variant="contained"
          color="error"
          size="small"
          disabled={selected.length === 0 || isLoading || batchBusy}
          onClick={handleDeleteSelecionados}
          startIcon={<Delete />}
        >
          Deletar
        </Button>
        {selected.length > 0 && (
          <Typography component="span" sx={{ fontSize: 12, opacity: 0.9 }}>
            {selected.length} selecionado(s)
          </Typography>
        )}
        {/* empurra o que vem depois pra direita */}
        <Box sx={{ flexGrow: 1 }} />

        {/* ✅ checkbox à direita do botão Deletar */}
        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            size="small"
            checked={exibirOutrosDocumentos}
            onChange={(e) => onChangeExibirOutrosDocumentos(e.target.checked)}
            disabled={isLoading || batchBusy}
          />
          <Typography sx={{ fontSize: 12, opacity: 0.9, whiteSpace: "nowrap" }}>
            Listar Todos
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: "relative" }}>
        {isLoading && (
          <LinearProgress
            sx={{ position: "absolute", left: 0, right: 0, top: -2, zIndex: 1 }}
          />
        )}

        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={someSelected}
                  checked={allSelected}
                  onChange={handleSelectAll}
                  disabled={isLoading || empty}
                />
              </TableCell>

              <TableCell>ID</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Exibir</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {empty ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography sx={{ opacity: 0.7, py: 1 }}>
                    Nenhum documento disponível.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => {
                const checked = selected.includes(row.id);
                const disabled = isRowBusy(row.id);

                return (
                  <TableRow
                    key={row.id}
                    selected={checked}
                    sx={{
                      cursor: "pointer",
                      transition: "0.2s",
                      bgcolor:
                        currentId === row.id
                          ? "rgba(25, 118, 210, 0.15)"
                          : "inherit",
                      borderLeft:
                        currentId === row.id
                          ? "4px solid #1976d2"
                          : "4px solid transparent",
                      "&:hover": {
                        bgcolor:
                          currentId === row.id
                            ? "rgba(25, 118, 210, 0.25)"
                            : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={checked}
                        onChange={() => handleCheckbox(row.id)}
                        disabled={disabled}
                      />
                    </TableCell>

                    <TableCell>{row.id_pje || "N/A"}</TableCell>

                    <TableCell>
                      {getDocumentoName(row.id_natu) || "N/A"}
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Visualizar texto extraído">
                        <span>
                          <IconButton
                            onClick={() => handleViewText(row.id)}
                            disabled={disabled}
                          >
                            <Visibility />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          {/* <TableFooter>
            <TableRow>
              <TableCell colSpan={4} />
            </TableRow>
          </TableFooter> */}
        </Table>
      </Box>
    </Box>
  );
};
