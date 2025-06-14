/**
 * File: ListaOCR.tsx
 * Data: 08-06-2025
 * Lista todos os documentos já extraídos por OCR, permitindo realizar a juntada aos autos,
 * a exibiçao do conteúdo em formato texto e a deleção do documentos extraído.
 */
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
} from "@mui/material";
import { Delete, PostAdd, Visibility } from "@mui/icons-material";
import { refreshOcrByContexto } from "../../shared/services/api/fetch/apiTools";

import type { DocsOcrRow } from "../../shared/types/tabelas";

interface ListaPecasProps {
  processoId: string;
  refreshKey: number;
  onView: (texto: string) => void;
  onJuntada: (fileId: number) => void;
  onDelete: (fileId: number) => void;
  loading?: boolean;
}

export const ListaOCR = ({
  processoId,
  onView: onViewText,
  onJuntada,
  onDelete,
  refreshKey,
  loading,
}: ListaPecasProps) => {
  const [rows, setRows] = useState<DocsOcrRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  //const { showFlashMessage } = useFlash();

  useEffect(() => {
    const refresh = async () => {
      setIsLoading(true);
      setRows([]);

      const rsp = await refreshOcrByContexto(Number(processoId));

      setIsLoading(false);
      if (rsp && rsp.length > 0) {
        setRows(rsp);
      } else {
        setRows([]);
      }
    };
    refresh();
  }, [processoId, refreshKey]);

  useEffect(() => {
    const refresh = async () => {
      if (loading != null) {
        setIsLoading(loading);
      }
    };
    refresh();
  }, [loading]);

  return (
    <Box position="relative">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 &&
            rows.map((row) => (
              <TableRow key={row.id_doc}>
                <TableCell>{row.nm_file_new || "N/A"}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => onJuntada(row.id_doc)}
                    title="Juntar aos Autos"
                    disabled={isLoading}
                  >
                    <PostAdd />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      onViewText(row.txt_doc || "Texto não disponível")
                    }
                    title="Visualizar texto extraído"
                    disabled={isLoading}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(row.id_doc)}
                    title="Deletar o registro"
                    disabled={isLoading}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableFooter>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={3}>
                <LinearProgress variant="indeterminate" />
              </TableCell>
            </TableRow>
          )}
        </TableFooter>
      </Table>
    </Box>
  );
};
