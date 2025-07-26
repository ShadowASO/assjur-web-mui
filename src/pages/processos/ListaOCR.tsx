import { useEffect, useState } from "react";
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
} from "@mui/material";
import { Delete, PostAdd, Visibility } from "@mui/icons-material";
import { refreshOcrByContexto } from "../../shared/services/api/fetch/apiTools";
import type { DocsOcrRow } from "../../shared/types/tabelas";
import { getDocumentoName } from "../../shared/constants/autosDoc";

interface ListaPecasProps {
  processoId: string;
  refreshKey: number;
  onView: (id_doc: string, id_pje: string, texto: string) => void;
  onJuntada: (fileId: string) => void;
  onJuntadaMultipla?: (fileIds: string[]) => void; // NOVO: callback para juntar vários
  onDelete: (fileId: string) => void;
  loading?: boolean;
}

export const ListaOCR = ({
  processoId,
  onView,
  onJuntada,
  onJuntadaMultipla,
  onDelete,
  refreshKey,
  loading,
}: ListaPecasProps) => {
  const [rows, setRows] = useState<DocsOcrRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]); // IDs selecionados

  // Carregar documentos
  useEffect(() => {
    const refresh = async () => {
      setIsLoading(true);
      setRows([]);
      setSelected([]); // Limpa seleção ao recarregar
      const rsp = await refreshOcrByContexto(Number(processoId));
      setIsLoading(false);
      setRows(rsp && rsp.length > 0 ? rsp : []);
    };
    refresh();
  }, [processoId, refreshKey]);

  // Loading externo
  useEffect(() => {
    if (loading !== undefined) setIsLoading(loading);
  }, [loading]);

  // Visualização individual
  const handleViewText = (id: string) => {
    const registro = rows.find((row) => row.id === id);
    if (registro) onView(registro.id, registro.id_pje, registro.doc);
    else onView("", id, "Texto não disponível");
  };

  // Seleção individual
  const handleCheckbox = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sel) => sel !== id) : [...prev, id]
    );
  };

  // Seleção global
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(rows.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  // Autuação em lote
  const handleAutuarSelecionados = () => {
    if (onJuntadaMultipla) {
      onJuntadaMultipla(selected);
    } else {
      // fallback: chamar um a um
      selected.forEach((id) => onJuntada(id));
    }
    setSelected([]); // Limpa seleção após ação
  };

  // Lógica de deleção em lote
  const handleDeleteSelecionados = () => {
    selected.forEach((id) => onDelete(id));
    setSelected([]);
  };

  // Helper para checar se todos estão selecionados
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const someSelected = selected.length > 0 && !allSelected;

  return (
    <Box position="relative" sx={{ maxHeight: 700, overflowY: "auto" }}>
      {/* Botão para autuar selecionados */}
      <Box display="flex" alignItems="center" p={1} gap={2}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={selected.length === 0 || isLoading}
          onClick={handleAutuarSelecionados}
          startIcon={<PostAdd />}
        >
          Autuar selecionados
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          disabled={selected.length === 0 || isLoading}
          onClick={handleDeleteSelecionados}
          startIcon={<Delete />}
        >
          Deletar selecionados
        </Button>
        {selected.length > 0 && (
          <span style={{ fontSize: 12 }}>
            {selected.length} documento(s) selecionado(s)
          </span>
        )}
      </Box>

      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={someSelected}
                checked={allSelected}
                onChange={handleSelectAll}
                disabled={isLoading || rows.length === 0}
                inputProps={{ "aria-label": "Selecionar todos" }}
              />
            </TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Natureza</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 &&
            rows.map((row) => (
              <TableRow key={row.id} selected={selected.includes(row.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(row.id)}
                    onChange={() => handleCheckbox(row.id)}
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>{row.id_pje || "N/A"}</TableCell>
                <TableCell>{getDocumentoName(row.id_natu) || "N/A"}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleViewText(row.id)}
                    title="Visualizar texto extraído"
                    disabled={isLoading}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableFooter>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4}>
                <LinearProgress variant="indeterminate" />
              </TableCell>
            </TableRow>
          )}
        </TableFooter>
      </Table>
    </Box>
  );
};
