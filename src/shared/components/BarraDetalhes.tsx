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
      {/* Botão */}
      {
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
              variant="outlined"
              startIcon={<Save />}
              onClick={onClickButtonSalvarFechar}
            >
              <Typography
                variant="button"
                whiteSpace={"nowrap"}
                textOverflow={"ellipsis"}
                overflow={"hidden"}
              >
                Salvar e fechar
              </Typography>
            </Button>
          )}

          {showButtonApagar && (
            <Button
              color="primary"
              disableElevation
              variant="outlined"
              startIcon={<Delete />}
              onClick={onClickButtonApagar}
            >
              <Typography
                variant="button"
                whiteSpace={"nowrap"}
                textOverflow={"ellipsis"}
                overflow={"hidden"}
              >
                Apagar
              </Typography>
            </Button>
          )}

          {showButtonNovo && (
            <Button
              color="primary"
              disableElevation
              variant="outlined"
              startIcon={<Add />}
              onClick={onClickButtonNovo}
            >
              <Typography
                variant="button"
                whiteSpace={"nowrap"}
                textOverflow={"ellipsis"}
                overflow={"hidden"}
              >
                {labelButtonNovo}
              </Typography>
            </Button>
          )}

          {/* <Divider variant="middle" orientation="vertical" /> */}
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {showButtonVoltar && (
            <Button
              color="primary"
              disableElevation
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onClickButtonVoltar}
            >
              <Typography
                variant="button"
                whiteSpace={"nowrap"}
                textOverflow={"ellipsis"}
                overflow={"hidden"}
              >
                Voltar
              </Typography>
            </Button>
          )}
        </Box>
      }
    </Box>
  );
};
