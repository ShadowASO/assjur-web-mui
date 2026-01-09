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

  mode?: BarraMode;
  onEnterEdit?: () => void;
  onCancelEdit?: () => void;
  isDirty?: boolean;
  confirmDiscard?: (cb: () => void) => void;
  saving?: boolean;
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

  const isView = mode === "view";
  const isEditing = mode === "edit" || mode === "create";

  const runWithDiscardGuard = (action?: () => void) => {
    if (!action) return;
    const proceed = () => action();
    if (isDirty && confirmDiscard) confirmDiscard(proceed);
    else proceed();
  };

  const handleCancel = () => runWithDiscardGuard(onCancelEdit);
  const handleNovo = () => runWithDiscardGuard(onClickButtonNovo);

  // ✅ “Novo” pode existir também em edit (mas normalmente não em create)
  const canShowNovo = showButtonNovo && mode !== "create";

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
        {/* Edição/criação: salvar */}
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

        {/* View: editar (só se tiver handler) */}
        {isView && !!onEnterEdit && (
          <Button
            color="primary"
            disableElevation
            variant="contained"
            startIcon={<Edit />}
            onClick={onEnterEdit}
            disabled={saving}
          >
            Editar
          </Button>
        )}

        {/* ✅ Novo agora pode aparecer em view e edit (com guarda de descarte) */}
        {canShowNovo && (
          <Button
            color="primary"
            disableElevation
            variant="contained"
            startIcon={<Add />}
            onClick={handleNovo}
            disabled={saving}
          >
            {labelButtonNovo}
          </Button>
        )}

        {/* Apagar só faz sentido em view */}
        {isView && showButtonApagar && (
          <Button
            color="error"
            disableElevation
            variant="contained"
            startIcon={<Delete />}
            onClick={onClickButtonApagar}
            disabled={saving}
          >
            Apagar
          </Button>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* View: voltar; Edit/Create: cancelar */}
        {isView && showButtonVoltar && (
          <Button
            color="inherit"
            disableElevation
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={onClickButtonVoltar}
            disabled={saving}
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
