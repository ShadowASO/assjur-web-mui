import { Add } from "@mui/icons-material";
import { Box, Button, Grid, MenuItem, Paper, TextField } from "@mui/material";
import type { Item } from "../constants/items";

interface IBarraListagemProps {
  fieldValue?: string;
  showField?: boolean;
  onFieldChange?: (newValueTexto: string) => void;
  //Botão
  buttonLabel?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
  //Criar um dropdown para criar um filtro a partir de itens
  itemsTable?: Item[];
  selectItem?: (item: string) => void;
  selected?: string;
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
  itemsTable,
  selectItem,
  selected,
}: IBarraListagemProps) => {
  //const theme = useTheme();

  return (
    <Paper elevation={3} sx={{ px: 2, py: 1, mx: 2, my: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Campo de busca */}
        {showField && (
          <Grid size={{ xs: 12, sm: 6, md: 5, lg: 4, xl: 4 }}>
            <Box display="flex" height="100%">
              <TextField
                value={fieldValue}
                onChange={(e) => onFieldChange?.(e.target.value)}
                size="small"
                placeholder="Pesquisar..."
                fullWidth
                sx={{ height: "100%" }}
              ></TextField>
            </Box>
          </Grid>
        )}

        {/* DROPDOWN */}
        {itemsTable && (
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
        )}
        <Grid size={{ xs: 0, sm: 0, md: 1, lg: 2, xl: 3 }}></Grid>

        {/* Botão */}
        {showButton && (
          <Grid size={{ xs: 3, sm: 2, md: 2, lg: 2, xl: 2 }}>
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
