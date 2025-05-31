import { ThemeProvider } from "@emotion/react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DarkTheme, LightTheme } from "../themes";
import { Box } from "@mui/material";

interface IThemeContextData {
  themeName: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext({} as IThemeContextData);

export const useAppThemeContext = () => {
  return useContext(ThemeContext);
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeName, setThemeName] = useState<"light" | "dark">("light");
  const [theme, setTheme] = useState(LightTheme);

  const toggleTheme = () =>
    setThemeName((old) => (old === "light" ? "dark" : "light"));

  useEffect(() => {
    //console.log(themeName);

    //setTheme(themeName === "dark" ? LightTheme : DarkTheme);
    setTheme(themeName === "dark" ? DarkTheme : LightTheme);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <Box
          width={"100vw"}
          height={"100vh"}
          bgcolor={theme.palette.background.default}
        >
          {children}
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
