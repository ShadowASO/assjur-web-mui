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
} from "@mui/material";
import { DocumentScanner } from "@mui/icons-material";
import { refreshUploadFiles } from "../../shared/services/api/fetch/apiTools";
import { useFlash } from "../../shared/contexts/FlashProvider";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import type { UploadFilesRow } from "../../shared/types/tabelas";
import { Environment } from "../../shared/enviroments";
import { useSearchParams } from "react-router-dom";

interface ListaPecasProps {
  processoId: string;
  onView: (url: string) => void;
  onExtract: (fileId: number) => void;
}

export const ListaPecas = ({ processoId, onExtract }: ListaPecasProps) => {
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
      const rsp = await refreshUploadFiles(processoId);

      setIsLoading(false);
      if (rsp instanceof Error) {
        showFlashMessage(
          "Nenhum registro encontrado",
          "info",
          TIME_FLASH_ALERTA_SEC
        );
      } else {
        setRows(rsp);
      }
    };
    refresh();
  }, [processoId]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Nome</TableCell>
          {/* <TableCell>Tipo</TableCell> */}
          <TableCell>Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id_file}>
            {/* <TableCell>{row.nm_file_ori}</TableCell> */}
            <TableCell>{row.nm_file_new || "N/A"}</TableCell>
            <TableCell>
              <IconButton
                onClick={() => onExtract(row.id_file)}
                title="Executar OCR"
              >
                {/* <PostAdd></PostAdd> */}
                <DocumentScanner></DocumentScanner>
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
  );
};
