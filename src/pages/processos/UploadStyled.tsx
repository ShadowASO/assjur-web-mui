/**
 * File: UploadStyled.tsx
 * Criação:  13/06/2025
 * Componente que concentra a lógica de seleção de núltiplos arquivos PDF
 *
 */

import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import { useEffect, useRef, useState } from "react";

export const UploadStyled = ({
  handleFileChange,
  loading,
}: {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = async () => {
      if (loading != null) {
        setIsLoading(loading);
      }
    };
    refresh();
  }, [loading]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
    // Limpa o input para permitir seleção do mesmo arquivo novamente
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            disabled={isLoading}
          >
            Escolher Arquivos
            <input
              hidden
              type="file"
              multiple
              ref={inputRef}
              accept="application/pdf"
              onChange={onChange}
            />
          </Button>

          <Typography variant="body2" color="text.secondary">
            Você pode selecionar múltiplos arquivos PDF para envio.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
