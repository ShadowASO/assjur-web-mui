import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  IconButton,
  type SvgIconProps,
} from "@mui/material";

import type { ComponentType, ReactNode } from "react";
import React, { useMemo, useState } from "react";
import { useDrawerContext } from "../../contexts/DrawerProvider";
import { useMatch, useNavigate, useResolvedPath } from "react-router-dom";
import { useAppThemeContext } from "../../contexts/ThemeProvider";
import { DarkMode, Logout, Info, Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthProvider";
import { useSystem } from "../../contexts/SystemProvider";

/* ---------- Item de navegação ---------- */
interface IListItemLinkProps {
  to: string;
  label: string;
  icon: ComponentType<SvgIconProps>;
  onClick?: () => void;
}
const ListItemLink = ({
  to,
  label,
  icon: Icone,
  onClick,
}: IListItemLinkProps) => {
  const navigate = useNavigate();
  const resolvedPath = useResolvedPath(to);
  const match = useMatch({ path: resolvedPath.pathname, end: false });

  const handleClick = () => {
    navigate(to);
    onClick?.();
  };

  return (
    <ListItemButton selected={!!match} onClick={handleClick}>
      <ListItemIcon>
        <Icone color="primary" />
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

/* ---------- Dialog "Sobre" ---------- */
interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
  appName?: string;
  author?: string;
  versionAPP: string;
  versionAPI?: string | null | undefined;
}
const AboutDialog: React.FC<AboutDialogProps> = ({
  open,
  onClose,
  appName = "Assistente Jurídico IA",
  author = "Aldenor Oliveira",
  versionAPP,
  versionAPI,
}) => {
  const versionAPIDisplay = versionAPI ?? "—";

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="about-dialog-title">
      <DialogTitle id="about-dialog-title">{appName}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          <strong>Autor:</strong> {author}
        </DialogContentText>
        <DialogContentText>
          <strong>Versão:</strong> {versionAPP}
        </DialogContentText>
        <DialogContentText>
          <strong>Versão API:</strong> {versionAPIDisplay}
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          Esta aplicação foi desenvolvida para oferecer uma interface amigável e
          funcional para a análise de processos e geração de minutas de
          sentenças e decisões, com foco na experiência do usuário e desempenho.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ---------- Menu Lateral ---------- */
interface IMenuLateralProps {
  children: ReactNode;
}
export const MenuLateral = ({ children }: IMenuLateralProps) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const { isDrawerOpen, toggleDrawerOpen, drawerOptions } = useDrawerContext();
  const { toggleTheme } = useAppThemeContext();
  const { logout, userLogged } = useAuth();
  const { version: versionAPI } = useSystem();

  //Versão da API do Sistema
  const { tituloJanela } = useDrawerContext();
  //Versão do Sistema do APP
  const versionAPP = "1.0.2";
  //******************* */

  const [openAbout, setOpenAbout] = useState(false);

  const drawerWidthPx = Number(theme.spacing(28).replace("px", "")) || 224; // valor numérico
  const drawerWidth = useMemo(() => theme.spacing(28), [theme]);

  const variant = smDown ? "temporary" : "persistent";
  const handleOpenAbout = () => setOpenAbout(true);
  const handleCloseAbout = () => setOpenAbout(false);

  return (
    <>
      {/* DRAWER */}
      <Drawer
        open={isDrawerOpen}
        variant={variant}
        onClose={smDown ? toggleDrawerOpen : undefined}
        ModalProps={smDown ? { keepMounted: true } : undefined}
        slotProps={{
          paper: {
            sx: { width: drawerWidth }, // largura do Drawer
            elevation: 1, // (opcional) props do Paper
          },
        }}
      >
        <Box display="flex" flexDirection="column" height="100%">
          {/* Topo com Avatar e nome */}
          <Box
            width="100%"
            height={theme.spacing(25)}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Avatar
              sx={{ height: theme.spacing(12), width: theme.spacing(12) }}
              src="/img/Themis-a06731d9-0aa9-4549-9346-ddd26602e443.jpeg"
              alt="Avatar do usuário"
            />
            <Typography
              variant="h6"
              component="span"
              sx={{ mt: 1, textAlign: "center" }}
            >
              {userLogged || "Usuário"}
            </Typography>
          </Box>

          <Divider />

          {/* Opções de navegação */}
          <Box flex={1} overflow="auto">
            <List component="nav" aria-label="Navegação principal">
              {drawerOptions.map((opt) => (
                <ListItemLink
                  to={opt.path}
                  key={opt.path}
                  icon={opt.icon}
                  label={opt.label}
                  onClick={smDown ? toggleDrawerOpen : undefined} // fecha no mobile após navegar
                />
              ))}
            </List>
          </Box>

          <Divider />

          {/* Ações do rodapé */}
          <Box>
            <List component="nav" aria-label="Ações">
              <ListItemButton onClick={toggleTheme}>
                <ListItemIcon>
                  <DarkMode />
                </ListItemIcon>
                <ListItemText primary="Alternar tema" />
              </ListItemButton>

              <ListItemButton onClick={handleOpenAbout}>
                <ListItemIcon>
                  <Info />
                </ListItemIcon>
                <ListItemText primary="Sobre" />
              </ListItemButton>

              <ListItemButton onClick={logout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItemButton>
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* APP BAR (com botão para abrir/fechar o menu) */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1, // fica acima do drawer
          transition: (t) =>
            t.transitions.create(["width", "margin-left"], {
              easing: t.transitions.easing.sharp,
              duration: t.transitions.duration.leavingScreen,
            }),
          ...(smDown
            ? {}
            : {
                ml: isDrawerOpen ? `${drawerWidthPx}px` : 0,
                width: isDrawerOpen
                  ? `calc(100% - ${drawerWidthPx}px)`
                  : "100%",
              }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Abrir/fechar menu lateral"
            edge="start"
            onClick={toggleDrawerOpen}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div">
            {/* Assistente Jurídico IA */}
            {tituloJanela}
          </Typography>

          <Box sx={{ flex: 1 }} />
        </Toolbar>
      </AppBar>

      {/* Dialog "Sobre" */}
      <AboutDialog
        open={openAbout}
        onClose={handleCloseAbout}
        versionAPP={versionAPP}
        versionAPI={versionAPI}
      />

      {/* ÁREA DO CONTEÚDO */}
      <Box
        component="main"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          // empurra o conteúdo quando o drawer está aberto no desktop
          ml: smDown ? 0 : isDrawerOpen ? `${drawerWidthPx}px` : 0,
          transition: (t) =>
            t.transitions.create("margin-left", {
              easing: t.transitions.easing.sharp,
              duration: t.transitions.duration.leavingScreen,
            }),
        }}
      >
        {/* Espaço para o AppBar fixo */}
        <Toolbar />
        {/* Seu conteúdo real */}
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>{children}</Box>
      </Box>
    </>
  );
};
