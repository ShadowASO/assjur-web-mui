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
import { useFlash } from "../../shared/contexts/FlashProvider";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import type { DocsOcrRow } from "../../shared/types/tabelas";

interface ListaPecasProps {
  processoId: string;
  refreshKey: number;
  onView: (texto: string) => void;
  onExtract: (fileId: number) => void;
  onDelete: (fileId: number) => void;
}

export const ListaOCR = ({
  processoId,
  onView: onViewText,
  onExtract,
  onDelete,
  refreshKey,
}: ListaPecasProps) => {
  const [rows, setRows] = useState<DocsOcrRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showFlashMessage } = useFlash();

  useEffect(() => {
    const refresh = async () => {
      setIsLoading(true);
      setRows([]);

      const rsp = await refreshOcrByContexto(Number(processoId));
      //console.log(rsp);
      setIsLoading(false);

      if (rsp instanceof Error) {
        showFlashMessage(
          "Nenhum registro encontrado",
          "info",
          TIME_FLASH_ALERTA_SEC
        );
        //setRows([]);
      } else {
        setRows(rsp);
      }
    };
    refresh();
  }, [processoId, refreshKey]);

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
          {rows.map((row) => (
            <TableRow key={row.id_doc}>
              <TableCell>{row.nm_file_new || "N/A"}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onExtract(row.id_doc)}
                  title="Juntar aos Autos"
                >
                  <PostAdd />
                </IconButton>
                <IconButton
                  onClick={() =>
                    onViewText(row.txt_doc || "Texto não disponível")
                  }
                  title="Visualizar texto extraído"
                >
                  <Visibility />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(row.id_doc)}
                  title="Deletar o registro"
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
