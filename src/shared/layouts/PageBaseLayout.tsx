import { Box } from "@mui/material";
import { useEffect, type ReactNode } from "react";
import { useDrawerContext } from "../contexts/DrawerProvider";

interface IPageBaseLayoutProps {
  children?: ReactNode;
  title: string;
  toolBar?: ReactNode;
}

export const PageBaseLayout = ({
  children,
  title,
  toolBar,
}: IPageBaseLayoutProps) => {
  const { setTituloJanela, tituloJanela } = useDrawerContext();
  // atualiza o título APÓS a renderização
  useEffect(() => {
    if (tituloJanela !== title) setTituloJanela(title);
  }, [title, tituloJanela, setTituloJanela]);
  return (
    <Box height={"100%"} display={"flex"} flexDirection={"column"} gap={1}>
      {toolBar ? <Box>{toolBar}</Box> : null}

      <Box flex={1} overflow={"auto"}>
        {children}
      </Box>
    </Box>
  );
};
