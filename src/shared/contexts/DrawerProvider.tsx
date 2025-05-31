import type { SvgIconProps } from "@mui/material";
import {
  createContext,
  useContext,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

interface IDrawerOption {
  path: string;
  label: string;
  icon: ComponentType<SvgIconProps>;
}

interface IDrawerContextData {
  isDrawerOpen: boolean;
  toggleDrawerOpen: () => void;
  drawerOptions: IDrawerOption[];
  setDrawerOptions: (newDrawerOptions: IDrawerOption[]) => void;
}

/**
 * Aqui, o contexto é criado com createContext e recebe um
 * valor inicial vazio forçado com as IDrawerContextData,
 * o que é comum em TypeScript quando sabemos que esse valor
 * será preenchido no Provider.
 * */
const DrawerContext = createContext({} as IDrawerContextData);

/**
 *
 * Esse custom hook facilita o uso do contexto nos
 * componentes filhos, evitando importar useContext diretamente.
 */
export const useDrawerContext = () => {
  return useContext(DrawerContext);
};

interface DrawerProviderProps {
  children: ReactNode;
}

export const DrawerProvider = ({ children }: DrawerProviderProps) => {
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerOptions, setDrawerOptions] = useState<IDrawerOption[]>([]);

  const toggleDrawerOpen = () => setDrawerOpen((old) => (old ? false : true));

  const handleSetDrawerOptions = (newDrawerOptions: IDrawerOption[]) => {
    setDrawerOptions(newDrawerOptions);
  };

  // useEffect(() => {
  //   console.log(isDrawerOpen);
  // }, [isDrawerOpen]);

  return (
    <DrawerContext.Provider
      value={{
        isDrawerOpen,
        drawerOptions,
        toggleDrawerOpen,
        setDrawerOptions: handleSetDrawerOptions,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};
