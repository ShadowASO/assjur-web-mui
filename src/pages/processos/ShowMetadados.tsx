/**
 * File: ShowMetadados.tsx
 * Criação:  15/06/2025
 * Componente para exibir metadados do processo
 *
 */

import { Box, Typography, Stack } from "@mui/material";
import type { MetadadosProcessoCnj } from "../../shared/types/cnjTypes";

interface ShowMetadadosCnjProps {
  processoCnj?: MetadadosProcessoCnj | null;
}

export default function ShowMetadadosCnj({
  processoCnj,
}: ShowMetadadosCnjProps) {
  const hit = processoCnj?.hits.hits[0]?._source;

  if (!hit) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nenhum metadado disponível.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          <strong>Processo:</strong> {hit.numeroProcesso}
        </Typography>

        <Typography variant="subtitle2">
          <strong>Juízo:</strong> {hit.orgaoJulgador.nome}
        </Typography>

        <Typography variant="subtitle2">
          <strong>Classe:</strong> {hit.classe.nome}
        </Typography>

        <Typography variant="subtitle2">
          <strong>Assunto:</strong> {hit.assuntos[0]?.nome ?? "Não informado"}
        </Typography>
      </Stack>
    </Box>
  );
}
