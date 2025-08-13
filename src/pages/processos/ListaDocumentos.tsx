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
  TableFooter,
  Checkbox,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete, PostAdd, Visibility } from "@mui/icons-material";
import { refreshOcrByContexto } from "../../shared/services/api/fetch/apiTools";
import type { DocsOcrRow } from "../../shared/types/tabelas";
import { getDocumentoName } from "../../shared/constants/autosDoc";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

interface ListaPecasProps {
  processoId: string;
  refreshKey: number;
  onView: (id_doc: string, id_pje: string, texto: string) => void;
  onJuntada: (fileId: string) => void | Promise<void>;
  onJuntadaMultipla?: (fileIds: string[]) => void | Promise<void>;
  onDelete: (fileId: string) => void | Promise<void>;
  loading?: boolean;
}

export const ListaDocumentos = ({
  processoId,
  onView,
  onJuntada,
  onJuntadaMultipla,
  onDelete,
  refreshKey,
  loading,
}: ListaPecasProps) => {
  const [rows, setRows] = useState<DocsOcrRow[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [batchBusy, setBatchBusy] = useState(false);

  const mountedRef = useRef(true);
  const callLockRef = useRef(false); // trava de reentrância (duplo clique)

  const isLoading = loading ?? internalLoading;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Carregar documentos
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setInternalLoading(true);
        const rsp = await refreshOcrByContexto(Number(processoId));
        if (!cancelled && mountedRef.current) {
          setRows(Array.isArray(rsp) && rsp.length > 0 ? rsp : []);
          // revalida seleção
          setSelected((prev) =>
            prev.filter((id) =>
              (rsp ?? []).some((r: DocsOcrRow) => r.id === id)
            )
          );
        }
      } catch (error) {
        const { techMsg } = describeApiError(error);
        console.error("Erro ao carregar documentos OCR:", techMsg);
        if (!cancelled && mountedRef.current) {
          setRows([]);
          setSelected([]);
        }
      } finally {
        if (!cancelled && mountedRef.current) setInternalLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [processoId, refreshKey]);

  // Handlers (sem useCallback)

  function handleViewText(id: string) {
    const registro = rows.find((row) => row.id === id);
    if (registro) onView(registro.id, registro.id_pje, registro.doc);
    else onView("", id, "Texto não disponível");
  }

  function handleCheckbox(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sel) => sel !== id) : [...prev, id]
    );
  }

  function handleSelectAll(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      setSelected(rows.map((row) => row.id));
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
    // trava síncrona anti duplo-clique
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
        await Promise.all(pendentes.map((id) => onJuntada(id)));
      }

      if (mountedRef.current) setSelected([]);
      // cooldown curto para o índice refletir mudanças
      await new Promise((r) => setTimeout(r, 250));
    } finally {
      if (mountedRef.current) {
        // usa snapshot para garantir simetria
        markBusy(initialSelected, false);
        setBatchBusy(false);
      }
      // libera um pouco depois para segurar double-click muito rápido
      setTimeout(() => {
        callLockRef.current = false;
      }, 200);
    }
  }

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

      await Promise.all(pendentes.map((id) => onDelete(id)));

      if (mountedRef.current) setSelected([]);
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

  // Helpers de seleção
  const { allSelected, someSelected } = useMemo(() => {
    const all = rows.length > 0 && selected.length === rows.length;
    const some = selected.length > 0 && !all;
    return { allSelected: all, someSelected: some };
  }, [rows.length, selected.length]);

  function isRowBusy(id: string) {
    return !!busyIds[id] || batchBusy || isLoading;
  }

  const empty = rows.length === 0;

  return (
    <Box position="relative" sx={{ maxHeight: 700, overflowY: "auto" }}>
      {/* Barra de ações em lote */}
      <Box display="flex" alignItems="center" p={1} gap={2}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={
            selected.length === 0 ||
            isLoading ||
            batchBusy ||
            callLockRef.current
          }
          onClick={handleAutuarSelecionados}
          onDoubleClick={(e) => e.preventDefault()}
          startIcon={<PostAdd />}
        >
          Autuar selecionados
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          disabled={
            selected.length === 0 ||
            isLoading ||
            batchBusy ||
            callLockRef.current
          }
          onClick={handleDeleteSelecionados}
          onDoubleClick={(e) => e.preventDefault()}
          startIcon={<Delete />}
        >
          Deletar selecionados
        </Button>
        {selected.length > 0 && (
          <Typography component="span" sx={{ fontSize: 12, opacity: 0.9 }}>
            {selected.length} documento(s) selecionado(s)
          </Typography>
        )}
      </Box>

      <Box sx={{ position: "relative" }}>
        {isLoading && (
          <LinearProgress
            variant="indeterminate"
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
                  inputProps={{ "aria-label": "Selecionar todos" }}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Natureza</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {empty ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" sx={{ opacity: 0.7, py: 1 }}>
                    Nenhum documento disponível.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const checked = selected.includes(row.id);
                const disabled = isRowBusy(row.id);

                return (
                  <TableRow key={row.id} selected={checked}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={checked}
                        onChange={() => handleCheckbox(row.id)}
                        disabled={disabled}
                        inputProps={{
                          "aria-label": `Selecionar ${row.id_pje}`,
                        }}
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
                            aria-label={`Visualizar documento ${row.id_pje}`}
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

          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} />
            </TableRow>
          </TableFooter>
        </Table>
      </Box>
    </Box>
  );
};
