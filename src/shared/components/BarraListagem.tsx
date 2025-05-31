import { Add } from "@mui/icons-material";
import { Box, Button, Paper, TextField, useTheme } from "@mui/material";

interface IBarraListagemProps {
  fieldValue?: string;
  showField?: boolean;
  onFieldChange?: (newValueTexto: string) => void;
  //Botão
  buttonLabel?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
}

export const BarraListagem = ({
  //CAmpo de texto
  onFieldChange,
  showField = true,
  fieldValue = "",
  //Botão
  buttonLabel = "Buscar",
  showButton = true,
  onButtonClick,
}: IBarraListagemProps) => {
  const theme = useTheme();
  return (
    <Box
      height={theme.spacing(5)}
      marginX={1}
      padding={1}
      paddingX={2}
      display={"flex"}
      gap={1}
      alignItems={"center"}
      component={Paper}
    >
      {/* Campo de busca */}
      {showField && (
        <TextField
          value={fieldValue}
          onChange={(e) => onFieldChange?.(e.target.value)}
          size="small"
          placeholder="Pesquisar..."
        ></TextField>
      )}

      {/* Botão */}
      {showButton && (
        <Box flex={1} display={"flex"} justifyContent={"end"}>
          <Button
            color="primary"
            disableElevation
            variant="contained"
            endIcon={<Add />}
            onClick={onButtonClick}
          >
            {buttonLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
};
