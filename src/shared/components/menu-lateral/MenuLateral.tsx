import {
  Avatar,
  Box,
  Divider,
  Drawer,
  Icon,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  type SvgIconProps,
} from "@mui/material";

import type { ComponentType, ReactNode } from "react";
import { useDrawerContext } from "../../contexts/DrawerProvider";
import { useMatch, useNavigate, useResolvedPath } from "react-router-dom";
import { useAppThemeContext } from "../../contexts/ThemeProvider";
import { DarkMode, Logout } from "@mui/icons-material";
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
        <Icone color="primary" /> {/* Aqui usamos como JSX */}
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
  const { logout } = useAuth();

  //console.log("redesenho do menu lateral");
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
            height={theme.spacing(20)}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Avatar
              sx={{ height: theme.spacing(12), width: theme.spacing(12) }}
              src="public/img/Foto-aldenor.jpeg"
            />
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
      <Box height="100vh" marginLeft={smDown ? 0 : theme.spacing(28)}>
        {children}
      </Box>
    </>
  );
};
