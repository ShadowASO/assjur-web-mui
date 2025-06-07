import { useState } from "react";
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
import { uploadFileToServer } from "../../shared/services/api/fetch/apiTools";
import { UploadStyled } from "./UploadStyled";

export const SelectPecas = ({ processoId }: { processoId: string }) => {
  //const [tipo, setTipo] = useState("peticao_inicial");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    await uploadFileToServer(Number(processoId), file);
    // Após upload, pode-se atualizar estado ou remover da lista
    setSelectedFiles((prev) => prev.filter((f) => f !== file));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <UploadStyled handleFileChange={handleFileChange}></UploadStyled>

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
