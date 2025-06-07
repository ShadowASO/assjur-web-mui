import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";

export const UploadStyled = ({
  handleFileChange,
}: {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* <Typography variant="h6">Seleção de Arquivos</Typography> */}

        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
          >
            Escolher Arquivos
            <input hidden type="file" multiple onChange={handleFileChange} />
          </Button>

          <Typography variant="body2" color="text.secondary">
            Você pode selecionar múltiplos arquivos para envio.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
