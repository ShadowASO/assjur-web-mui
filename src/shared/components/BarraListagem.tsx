import { Add, ArrowBack, Search } from "@mui/icons-material";
import { Box, Button, MenuItem, Paper, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { Item } from "../constants/items";

interface IBarraListagemProps {
  fieldValue?: string;
  showField?: boolean;
  onFieldChange?: (newValueTexto: string) => void;

  buttonLabel?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
  buttonIcon?: React.ReactNode; // ✅ novo

  itemsTable?: Item[];
  selectItem?: (item: string) => void;
  selected?: string;

  showBackButton?: boolean;
  backButtonLabel?: string;
  onBackClick?: () => void;
}

export const BarraListagem = ({
  onFieldChange,
  showField = true,
  fieldValue = "",

  buttonLabel = "Buscar",
  showButton = true,
  onButtonClick,
  buttonIcon,

  itemsTable,
  selectItem,
  selected,

  showBackButton = false,
  backButtonLabel = "Voltar",
  onBackClick,
}: IBarraListagemProps) => {
  // ✅ ícone padrão coerente com o rótulo
  const resolvedIcon =
    buttonIcon ??
    (buttonLabel.toLowerCase().includes("busc") ? <Search /> : <Add />);

  return (
    <Paper elevation={3} sx={{ px: 2, py: 1, mx: 2, my: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {showBackButton && (
          <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2, xl: 2 }}>
            <Box display="flex">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={onBackClick}
                size="small"
                sx={{ whiteSpace: "nowrap" }}
                aria-label="Voltar"
                fullWidth
              >
                {backButtonLabel}
              </Button>
            </Box>
          </Grid>
        )}

        {showField && (
          <Grid
            size={{
              xs: 12,
              sm: showBackButton ? 5 : 7,
              md: showBackButton ? 5 : 6,
              lg: showBackButton ? 4 : 5,
              xl: showBackButton ? 4 : 5,
            }}
          >
            <TextField
              type="text"
              value={fieldValue}
              onChange={(e) => onFieldChange?.(e.target.value)}
              size="small"
              placeholder="Pesquisar..."
              fullWidth
            />
          </Grid>
        )}

        {itemsTable ? (
          <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3, xl: 3 }}>
            <TextField
              select
              label="Natureza"
              fullWidth
              value={selected ?? ""} // ✅ evita undefined
              onChange={(e) => selectItem?.(e.target.value)}
              size="small"
            >
              <MenuItem value="">(Todas)</MenuItem>
              {itemsTable.map((item) => (
                <MenuItem key={item.key} value={item.description}>
                  {item.description}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        ) : (
          <Grid size={{ xs: 0, sm: 0, md: 3, lg: 3, xl: 3 }} />
        )}

        {/* Espaçador */}
        <Grid size={{ xs: 0, sm: 0, md: 2, lg: 2, xl: 2 }} />

        {showButton && (
          <Grid size={{ xs: 12, sm: 12, md: 2, lg: 2, xl: 2 }}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                color="primary"
                disableElevation
                variant="contained"
                endIcon={resolvedIcon}
                onClick={onButtonClick}
                size="small"
                sx={{ whiteSpace: "nowrap" }}
                fullWidth
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
