/**
 * File: BarraDetalhes.tsx
 * Criação:  14/06/2025
 * Alterações: 10/08/2025
 * Componente que exibe uma barra de ações CRUD para as janelas de cadastro
 */

import { Add, ArrowBack, Delete, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

interface IBarraDetalhesProps {
  labelButtonNovo?: string;

  showButtonNovo?: boolean;
  showButtonVoltar?: boolean;
  showButtonApagar?: boolean;
  showButtonSalvar?: boolean;
  showButtonSalvarFechar?: boolean;

  onClickButtonNovo?: () => void;
  onClickButtonVoltar?: () => void;
  onClickButtonApagar?: () => void;
  onClickButtonSalvar?: () => void;
  onClickButtonSalvarFechar?: () => void;
}

export const BarraDetalhes = ({
  labelButtonNovo = "Novo",
  showButtonNovo = true,
  showButtonVoltar = true,
  showButtonApagar = true,
  showButtonSalvar = true,
  showButtonSalvarFechar = false,
  onClickButtonNovo,
  onClickButtonVoltar,
  onClickButtonApagar,
  onClickButtonSalvar,
  onClickButtonSalvarFechar,
}: IBarraDetalhesProps) => {
  const theme = useTheme();

  const buttonStyleContained = {
    fontWeight: "bold",
    px: 2,
    "& .MuiSvgIcon-root": { color: "white" },
  };

  // const buttonStyleOutlined = {
  //   borderWidth: 2,
  //   fontWeight: "bold",
  //   color: theme.palette.text.primary,
  //   borderColor: theme.palette.text.primary,
  //   "&:hover": {
  //     borderColor: theme.palette.primary.main,
  //     backgroundColor: theme.palette.action.hover,
  //   },
  // };

  return (
    <Box
      height={theme.spacing(5)}
      mx={1}
      px={2}
      py={1}
      display="flex"
      gap={1}
      alignItems="center"
      component={Paper}
    >
      <Box flex={1} display={"flex"} justifyContent={"flex-start"} gap={0.5}>
        {showButtonSalvar && (
          <Button
            color="primary"
            disableElevation
            variant="contained"
            startIcon={<Save />}
            onClick={onClickButtonSalvar}
          >
            <Typography
              variant="button"
              whiteSpace={"nowrap"}
              textOverflow={"ellipsis"}
              overflow={"hidden"}
            >
              Salvar
            </Typography>
          </Button>
        )}

        {showButtonSalvarFechar && (
          <Button
            color="primary"
            disableElevation
            variant="contained"
            startIcon={<Save />}
            onClick={onClickButtonSalvarFechar}
          >
            Salvar e fechar
          </Button>
        )}

        {showButtonApagar && (
          <Button
            color="error"
            disableElevation
            variant="contained"
            startIcon={<Delete />}
            onClick={onClickButtonApagar}
            sx={buttonStyleContained}
          >
            Apagar
          </Button>
        )}

        {showButtonNovo && (
          <Button
            color="primary"
            disableElevation
            variant="contained"
            startIcon={<Add />}
            onClick={onClickButtonNovo}
          >
            {labelButtonNovo}
          </Button>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {showButtonVoltar && (
          <Button
            color="inherit"
            disableElevation
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={onClickButtonVoltar}
          >
            Voltar
          </Button>
        )}
      </Box>
    </Box>
  );
};
