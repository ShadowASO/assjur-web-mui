import { Navigate, Route, Routes } from "react-router-dom";
import { useDrawerContext } from "../shared/contexts/DrawerProvider";
import { useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import { LocationCity } from "@mui/icons-material";

import { Dashboard } from "../pages/dashboard/Dashboard";
import { ListaProcessos } from "../pages/processos/ListaProcessos";
import { ChatIA } from "../pages/chat-ia/Chat-ia";
import { ListaModelos } from "../pages/Modelos/ListaModelos";
import { Login } from "../shared/components/login/Login";
import { RequireAuth } from "../shared/components/login/RequireAuth";
//import { getApiObjeto } from "../shared/services/api/fetch/ApiCliente";

export const AppRoutes = () => {
  const { setDrawerOptions } = useDrawerContext();
  //const Api = getApiObjeto();
  //const navigate = useNavigate();

  useEffect(() => {
    //Determina apenas quais itens de menu aparecerão para o usuário
    setDrawerOptions([
      {
        icon: HomeIcon,
        path: "/pagina-inicial",
        label: "Página inicial",
      },
      {
        icon: LocationCity,
        path: "/processos",
        label: "Processos",
      },

      {
        icon: LocationCity,
        path: "/modelos",
        label: "Modelos",
      },
      {
        icon: LocationCity,
        path: "/chat-ia",
        label: "Chat IA",
      },
    ]);
  }, []);

  return (
    <Routes>
      <Route
        path="/pagina-inicial"
        element={
          <RequireAuth>
            <Dashboard></Dashboard>
          </RequireAuth>
        }
      />
      <Route
        path="/processos"
        element={
          <RequireAuth>
            <ListaProcessos></ListaProcessos>
          </RequireAuth>
        }
      />
      <Route
        path="/chat-ia"
        element={
          <RequireAuth>
            <ChatIA></ChatIA>
          </RequireAuth>
        }
      />
      <Route
        path="/modelos"
        element={
          <RequireAuth>
            <ListaModelos></ListaModelos>
          </RequireAuth>
        }
      />
      <Route path="/login" element={<Login></Login>} />

      <Route
        path="*"
        element={<Navigate to="/pagina-inicial"></Navigate>}
      ></Route>
    </Routes>
  );
};
