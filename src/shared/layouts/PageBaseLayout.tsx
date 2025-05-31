import { Menu } from "@mui/icons-material";
import {
  Box,
  Icon,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { ReactNode } from "react";
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
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  const { toggleDrawerOpen } = useDrawerContext();
  return (
    <Box height={"100%"} display={"flex"} flexDirection={"column"} gap={1}>
      <Box
        padding={1}
        height={theme.spacing(smDown ? 6 : mdDown ? 8 : 12)}
        display={"flex"}
        alignItems={"center"}
        gap={1}
      >
        {/* Controla a exibição do menu lateral */}
        {smDown && (
          <IconButton onClick={toggleDrawerOpen}>
            <Icon>
              <Menu>menu</Menu>
            </Icon>
          </IconButton>
        )}

        <Typography
          overflow={"nowrap"}
          whiteSpace={"nowrap"}
          textOverflow={"ellipsis"}
          variant={smDown ? "h5" : mdDown ? "h4" : "h3"}
        >
          {title}
        </Typography>
      </Box>
      {toolBar && <Box>{toolBar}</Box>}

      <Box flex={1} overflow={"auto"}>
        {children}
      </Box>
    </Box>
  );
};
