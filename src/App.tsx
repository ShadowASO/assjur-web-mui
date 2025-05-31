import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AppThemeProvider } from "./shared/contexts/ThemeProvider";
import { DrawerProvider } from "./shared/contexts/DrawerProvider";
import FlashProvider from "./shared/contexts/FlashProvider";
import FlashAlerta from "./shared/components/FlashAlerta";
import { AuthProvider } from "./shared/contexts/AuthProvider";
import { Login } from "./shared/components/login/Login";
import { MenuLateral } from "./shared/components/menu-lateral/MenuLateral";

import "./shared/forms/rhf/MensagensYup";
import ApiProvider from "./shared/contexts/ApiProvider";

export const App = () => {
  return (
    <AuthProvider>
      <ApiProvider>
        <AppThemeProvider>
          <FlashProvider>
            <DrawerProvider>
              <Login>
                <BrowserRouter>
                  <MenuLateral>
                    <AppRoutes />
                    <FlashAlerta />
                  </MenuLateral>
                </BrowserRouter>
              </Login>
            </DrawerProvider>
          </FlashProvider>
        </AppThemeProvider>
      </ApiProvider>
    </AuthProvider>
  );
};
