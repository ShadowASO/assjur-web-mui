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
import { getDocumentoName } from "../../shared/constants/autosDoc";

interface ListaPecasProps {
  processoId: string;
  refreshKey: number;
  onView: (id_doc: string, id_pje: string, texto: string) => void;
  onJuntada: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  loading?: boolean;
}

export const ListaOCR = ({
  processoId,
  //onView: onViewText,
  onView,
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
      //console.log(rsp);

      setIsLoading(false);
      if (rsp && rsp.length > 0) {
        setRows(rsp);
      } else {
        setRows([]);
      }
    };
    refresh();
  }, [processoId, refreshKey]);

  const handleViewText = (id: string) => {
    // rows é um vetor de objetos com a propriedade id
    const registro = rows.find((row) => row.id === id);

    if (registro) {
      // Faz algo com o registro encontrado, por exemplo:
      //console.log("Registro encontrado:", registro);
      // Ou chama alguma função passando registro.doc, por exemplo:
      // onViewText(registro.doc || "Texto não disponível");
      onView(registro.id, registro.id_pje, registro.doc);
    } else {
      //console.log("Registro não encontrado para o id:", id);
      onView("", id, "Texto não disponível");
    }
  };

  useEffect(() => {
    const refresh = async () => {
      if (loading != null) {
        setIsLoading(loading);
      }
    };
    refresh();
  }, [loading]);

  return (
    <Box position="relative" sx={{ maxHeight: 700, overflowY: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Natureza</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 &&
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id_pje || "N/A"}</TableCell>
                <TableCell>{getDocumentoName(row.id_natu) || "N/A"}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => onJuntada(row.id)}
                    title="Juntar aos Autos"
                    disabled={isLoading}
                  >
                    <PostAdd />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      // onViewText(row.doc || "Texto não disponível")
                      handleViewText(row.id)
                    }
                    title="Visualizar texto extraído"
                    disabled={isLoading}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(row.id)}
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
