// BarraDetalhes.tsx
import { Add, ArrowBack, Delete, Save, Edit, Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

type BarraMode = "view" | "edit" | "create";

interface IBarraDetalhesProps {
  // existentes
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

  // novos (modo explícito)
  mode?: BarraMode; // "view" | "edit" | "create"
  onEnterEdit?: () => void; // chamado ao clicar "Editar"
  onCancelEdit?: () => void; // chamado ao clicar "Cancelar"
  isDirty?: boolean; // tem alterações pendentes?
  confirmDiscard?: (cb: () => void) => void; // confirma descarte (opcional)
  saving?: boolean; // desabilita botões durante save
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

  mode = "view",
  onEnterEdit,
  onCancelEdit,
  isDirty = false,
  confirmDiscard,
  saving = false,
}: IBarraDetalhesProps) => {
  const theme = useTheme();

  const handleCancel = () => {
    if (!onCancelEdit) return;
    const proceed = () => onCancelEdit();
    if (isDirty && confirmDiscard) {
      confirmDiscard(proceed);
    } else {
      proceed();
    }
  };

  const isView = mode === "view";
  const isEditing = mode === "edit" || mode === "create";

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
      <Box flex={1} display="flex" justifyContent="flex-start" gap={0.5}>
        {/* Modo edição/criação: mostrar ações de salvar */}
        {isEditing && showButtonSalvar && (
          <Button
            color="primary"
            disableElevation
            variant="contained"
            startIcon={<Save />}
            onClick={onClickButtonSalvar}
            disabled={saving}
          >
            <Typography variant="button" noWrap>
              Salvar
            </Typography>
          </Button>
        )}

        {isEditing && showButtonSalvarFechar && (
          <Button
            color="primary"
            disableElevation
            variant="contained"
            startIcon={<Save />}
            onClick={onClickButtonSalvarFechar}
            disabled={saving}
          >
            Salvar e fechar
          </Button>
        )}

        {/* Modo visualização: oferecer "Editar" */}
        {isView && (
          <Button
            color="primary"
            disableElevation
            variant="contained"
            startIcon={<Edit />}
            onClick={onEnterEdit}
          >
            Editar
          </Button>
        )}

        {/* Sempre que fizer sentido, manter Novo/Apagar em view; em edit geralmente escondemos */}
        {isView && showButtonNovo && (
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

        {isView && showButtonApagar && (
          <Button
            color="error"
            disableElevation
            variant="contained"
            startIcon={<Delete />}
            onClick={onClickButtonApagar}
          >
            Apagar
          </Button>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Voltar em view; Cancelar em edit */}
        {isView && showButtonVoltar && (
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

        {isEditing && (
          <Button
            color="inherit"
            disableElevation
            variant="contained"
            startIcon={<Close />}
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
        )}
      </Box>
    </Box>
  );
};
