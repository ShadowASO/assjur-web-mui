import { Add, ArrowBack } from "@mui/icons-material";
import { Box, Button, Grid, MenuItem, Paper, TextField } from "@mui/material";
import type { Item } from "../constants/items";

interface IBarraListagemProps {
  // Busca
  fieldValue?: string;
  showField?: boolean;
  onFieldChange?: (newValueTexto: string) => void;

  // Botão principal (à direita)
  buttonLabel?: string;
  showButton?: boolean;
  onButtonClick?: () => void;

  // Filtro opcional
  itemsTable?: Item[];
  selectItem?: (item: string) => void;
  selected?: string;

  // Novo: Botão Voltar (à esquerda)
  showBackButton?: boolean;
  backButtonLabel?: string;
  onBackClick?: () => void;
}

export const BarraListagem = ({
  // Campo de texto
  onFieldChange,
  showField = true,
  fieldValue = "",

  // Botão principal
  buttonLabel = "Buscar",
  showButton = true,
  onButtonClick,

  // Filtro
  itemsTable,
  selectItem,
  selected,

  // Voltar
  showBackButton = false,
  backButtonLabel = "Voltar",
  onBackClick,
}: IBarraListagemProps) => {
  return (
    <Paper elevation={3} sx={{ px: 2, py: 1, mx: 2, my: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Botão Voltar (esquerda) */}
        {showBackButton && (
          <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2, xl: 2 }}>
            <Box display="flex" height="100%">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={onBackClick}
                size="small"
                sx={{ height: "100%", whiteSpace: "nowrap" }}
                aria-label="Voltar"
              >
                {backButtonLabel}
              </Button>
            </Box>
          </Grid>
        )}

        {/* Campo de busca */}
        {showField && (
          <Grid
            size={{ xs: 12, sm: showBackButton ? 5 : 7, md: 6, lg: 5, xl: 5 }}
          >
            <Box display="flex" height="100%">
              <TextField
                type="text"
                value={fieldValue}
                onChange={(e) => onFieldChange?.(e.target.value)}
                size="small"
                placeholder="Pesquisar..."
                fullWidth
                sx={{ height: "100%" }}
              />
            </Box>
          </Grid>
        )}

        {/* DROPDOWN ou espaçador */}
        {itemsTable ? (
          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3, xl: 3 }}>
            <Box display="flex" height="100%">
              <TextField
                select
                label="Natureza"
                fullWidth
                value={selected}
                onChange={(e) => selectItem?.(e.target.value)}
                size="small"
                sx={{ height: "100%" }}
              >
                {itemsTable.map((item) => (
                  <MenuItem key={item.key} value={item.description}>
                    {item.description}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Grid>
        ) : (
          <Grid size={{ xs: 0, sm: 0, md: 4, lg: 3, xl: 3 }} />
        )}

        {/* Espaçador central (mantém alinhamento) */}
        <Grid size={{ xs: 0, sm: 0, md: 2, lg: 2, xl: 2 }} />

        {/* Botão principal (direita) */}
        {showButton && (
          <Grid size={{ xs: 12, sm: 12, md: 2, lg: 2, xl: 2 }}>
            <Box display="flex" justifyContent="flex-end" height="100%">
              <Button
                color="primary"
                disableElevation
                variant="contained"
                endIcon={<Add />}
                onClick={onButtonClick}
                size="small"
                sx={{ height: "100%", whiteSpace: "nowrap" }}
              >
                {buttonLabel}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
