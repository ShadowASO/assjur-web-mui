import { createTheme } from "@mui/material";
import { cyan, grey } from "@mui/material/colors";

export const LightTheme = createTheme({
  palette: {
    primary: {
      main: grey[300], // balões do usuário
      dark: grey[400],
      light: grey[200],
      contrastText: "#000000", // melhor contraste com balões claros
    },
    secondary: {
      main: cyan[400], // destaque para links/botões
      dark: cyan[600],
      light: cyan[200],
      contrastText: "#ffffff",
    },
    background: {
      default: "#f7f7f8", // fundo geral (sem ser branco puro)
      paper: "#ffffff", // balões/respostas do assistant
    },
    text: {
      primary: "#202123", // cor padrão de texto
      secondary: grey[700],
    },
  },
});
