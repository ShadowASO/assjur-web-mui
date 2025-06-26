/**
 * File: SelectPecas.tsx
 * Data: 08-06-2025
 * Componente para selecionar arquivos e listá-los na forma de uma tabela.
 * Recebe um handler do componente pai para permitir a manipulação do arquivo.
 */
import { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/CloudUpload";
import { UploadStyled } from "./UploadStyled";

interface SelectPecasProps {
  onUpload: (file: File) => void;
  loading?: boolean;
}

export const SelectPecas = ({ onUpload, loading }: SelectPecasProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      if (loading != null) {
        setIsLoading(loading);
      }
    };
    refresh();
  }, [loading]);

  //Insere os arquivos selecionados no estado selectedFiles
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };
  //Executa a ação de upload do arquivo apontado
  const handleUpload = async (file: File) => {
    if (!file) return;
    onUpload(file);
    // Após upload, pode-se atualizar estado ou remover da lista
    setSelectedFiles((prev) => prev.filter((f) => f !== file));
  };

  return (
    // <Box display="flex" flexDirection="column" gap={2}>
    <Box position="relative" sx={{ maxHeight: 700, overflowY: "auto" }}>
      <UploadStyled
        handleFileChange={handleFileChange}
        loading={isLoading}
      ></UploadStyled>

      {selectedFiles.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Arquivo</TableCell>
              <TableCell align="right">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedFiles.map((file, idx) => (
              <TableRow key={idx}>
                <TableCell>{file.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleUpload(file)}
                    title="Enviar este arquivo"
                    disabled={isLoading}
                  >
                    <UploadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};
