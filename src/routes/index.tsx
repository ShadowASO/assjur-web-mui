import { Navigate, Route, Routes } from "react-router-dom";
import { useDrawerContext } from "../shared/contexts/DrawerProvider";
import { useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import { LocationCity } from "@mui/icons-material";

import { Dashboard } from "../pages/dashboard/Dashboard";
import { ListaProcessos } from "../pages/processos/ListaProcessos";
import { ChatIA } from "../pages/chat-ia/Chat-ia";

export const AppRoutes = () => {
  const { setDrawerOptions } = useDrawerContext();

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
        path: "/chat-ia",
        label: "Chat IA",
      },
    ]);
  }, []);

  return (
    <Routes>
      <Route path="/pagina-inicial" element={<Dashboard></Dashboard>} />
      <Route path="/processos" element={<ListaProcessos></ListaProcessos>} />
      <Route path="/chat-ia" element={<ChatIA></ChatIA>} />

      <Route
        path="*"
        element={<Navigate to="/pagina-inicial"></Navigate>}
      ></Route>
    </Routes>
  );
};
