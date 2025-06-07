import { useEffect, useState } from "react";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
} from "@mui/material";
import { PostAdd, Visibility } from "@mui/icons-material";
import { refreshOcrByContexto } from "../../shared/services/api/fetch/apiTools";
import { useFlash } from "../../shared/contexts/FlashProvider";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import type { DocsOcrRow } from "../../shared/types/tabelas";

interface ListaPecasProps {
  processoId: string;
  onViewText: (texto: string) => void;
  onExtract: (fileId: number) => void;
}

export const ListaOCR = ({
  processoId,
  onViewText,
  onExtract,
}: ListaPecasProps) => {
  const [rows, setRows] = useState<DocsOcrRow[]>([]);
  //const [totalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  //const [searchParams, setSearchParams] = useSearchParams();
  const { showFlashMessage } = useFlash();

  //   const busca = searchParams.get("busca") || "";
  //   const pagina = Number(searchParams.get("pagina") || "1");

  useEffect(() => {
    // Buscar peças por processoId
    const refresh = async () => {
      setIsLoading(true);
      const rsp = await refreshOcrByContexto(Number(processoId));

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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
