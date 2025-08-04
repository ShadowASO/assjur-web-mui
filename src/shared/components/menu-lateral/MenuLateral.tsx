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
  Icon,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  type SvgIconProps,
} from "@mui/material";

import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { useDrawerContext } from "../../contexts/DrawerProvider";
import { useMatch, useNavigate, useResolvedPath } from "react-router-dom";
import { useAppThemeContext } from "../../contexts/ThemeProvider";
import { DarkMode, Logout, Info } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthProvider";

interface IListItemLinkProps {
  to: string;
  label: string;
  icon: ComponentType<SvgIconProps>;
  onClick: (() => void) | undefined;
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

interface IMenuLateralProps {
  children: ReactNode;
}
export const MenuLateral = ({ children }: IMenuLateralProps) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { isDrawerOpen, toggleDrawerOpen, drawerOptions } = useDrawerContext();
  const { toggleTheme } = useAppThemeContext();
  const { logout, userLogged } = useAuth();

  // Estado para controlar a abertura do modal About
  const [openAbout, setOpenAbout] = useState(false);

  const handleOpenAbout = () => {
    setOpenAbout(true);
  };

  const handleCloseAbout = () => {
    setOpenAbout(false);
  };

  return (
    <>
      <Drawer
        open={isDrawerOpen}
        variant={smDown ? "temporary" : "permanent"}
        onClose={toggleDrawerOpen}
      >
        <Box
          width={theme.spacing(28)}
          display={"flex"}
          flexDirection={"column"}
          height={"100%"}
        >
          <Box
            width={"100%"}
            height={theme.spacing(25)}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            // padding={theme.spacing(2)}
          >
            <Avatar
              sx={{ height: theme.spacing(12), width: theme.spacing(12) }}
              src="/img/Themis-a06731d9-0aa9-4549-9346-ddd26602e443.jpeg"
            />
            {/* Nome do usuário abaixo do avatar */}
            <Typography
              variant="h6"
              component="span"
              sx={{ marginTop: theme.spacing(1), textAlign: "center" }}
            >
              {userLogged || "Usuário"}
            </Typography>
          </Box>
          <Divider />
          <Box flex={1}>
            <List component="nav">
              {drawerOptions.map((drawerOption) => (
                <ListItemLink
                  to={drawerOption.path}
                  key={drawerOption.path}
                  icon={drawerOption.icon}
                  label={drawerOption.label}
                  onClick={smDown ? toggleDrawerOpen : undefined}
                />
              ))}
            </List>
          </Box>
          <Divider />
          <Box>
            <List component="nav">
              {/* About */}
              <ListItemButton onClick={handleOpenAbout}>
                <ListItemIcon>
                  <Icon>
                    <Info />
                  </Icon>
                </ListItemIcon>
                <ListItemText primary="Sobre" />
              </ListItemButton>
              {/* Alternar tema */}
              <ListItemButton onClick={toggleTheme}>
                <ListItemIcon>
                  <Icon>
                    <DarkMode />
                  </Icon>
                </ListItemIcon>
                <ListItemText primary="Alternar tema" />
              </ListItemButton>
              {/* Sair */}
              <ListItemButton onClick={logout}>
                <ListItemIcon>
                  <Icon>
                    <Logout />
                  </Icon>
                </ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItemButton>
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Modal Sobre */}
      <Dialog open={openAbout} onClose={handleCloseAbout}>
        <DialogTitle>Sobre esta aplicação</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            <strong>Autor:</strong> Aldenor Oliveira
          </DialogContentText>
          <DialogContentText>
            <strong>Versão:</strong> 1.0.1
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Esta aplicação foi desenvolvida para oferecer uma interface amigável
            e funcional para o gerenciamento de processos judiciais, com foco na
            experiência do usuário e desempenho.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAbout} color="primary" autoFocus>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Box height="100vh" marginLeft={smDown ? 0 : theme.spacing(28)}>
        {children}
      </Box>
    </>
  );
};
