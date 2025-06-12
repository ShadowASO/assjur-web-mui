/**
 * File: ListaPecas.tsx
 * Data: 08-06-2025
 * Faz a listagem de todos os arquivos PDF que já foram transferidos para o servidor,
 * mas não sofreram a extração por OCR.
 */
import { useEffect, useState } from "react";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  TableFooter,
  LinearProgress,
  Pagination,
  Box,
} from "@mui/material";
import { Delete, DocumentScanner } from "@mui/icons-material";
import { refreshUploadFiles } from "../../shared/services/api/fetch/apiTools";
import { useFlash } from "../../shared/contexts/FlashProvider";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import type { UploadFilesRow } from "../../shared/types/tabelas";
import { Environment } from "../../shared/enviroments";
import { useSearchParams } from "react-router-dom";

interface ListaPecasProps {
  processoId: string;
  refreshKey: number;
  onView: (url: string) => void;
  onExtract: (fileId: number) => void;
  onDelete: (fileId: number) => void;
}

export const ListaPecas = ({
  processoId,
  onExtract,
  refreshKey,
  onDelete,
}: ListaPecasProps) => {
  const [rows, setRows] = useState<UploadFilesRow[]>([]);
  const [totalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { showFlashMessage } = useFlash();

  const busca = searchParams.get("busca") || "";
  const pagina = Number(searchParams.get("pagina") || "1");

  useEffect(() => {
    // Buscar peças por processoId
    const refresh = async () => {
      setIsLoading(true);
      setRows([]);
      const rsp = await refreshUploadFiles(processoId);

      setIsLoading(false);
      if (rsp) {
        setRows(rsp);
      } else {
        showFlashMessage(
          "Nenhum registro encontrado",
          "info",
          TIME_FLASH_ALERTA_SEC
        );
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
            <TableRow key={row.id_file}>
              <TableCell>{row.nm_file_new || "N/A"}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onExtract(row.id_file)}
                  title="Executar OCR"
                >
                  <DocumentScanner></DocumentScanner>
                </IconButton>
                <IconButton
                  onClick={() => onDelete(row.id_file)}
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
          {totalPage > 0 && totalPage > Environment.LIMITE_DE_LINHAS && (
            <TableRow>
              <TableCell colSpan={3}>
                <Pagination
                  page={pagina}
                  count={Math.ceil(totalPage / Environment.LIMITE_DE_LINHAS)}
                  onChange={(_, newPage) =>
                    setSearchParams(
                      { busca, pagina: newPage.toString() },
                      { replace: true }
                    )
                  }
                />
              </TableCell>
            </TableRow>
          )}
        </TableFooter>
      </Table>
    </Box>
  );
};
