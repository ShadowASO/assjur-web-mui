import { createTheme } from "@mui/material";
import { cyan, grey } from "@mui/material/colors";

export const DarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: grey[500],
      dark: grey[400],
      light: grey[300],
      contrastText: "#ffffff",
    },
    secondary: {
      main: cyan[500],
      dark: cyan[400],
      light: cyan[300],
      contrastText: "#ffffff",
    },
    background: {
      paper: "#303134",
      //paper: "#595a5c",

      default: grey[700],
    },
  },
  typography: {
    allVariants: {
      color: "white",
    },
  },
});
