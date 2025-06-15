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
import { DetalheModelos } from "../pages/Modelos/DetalheModelos";
import { ListaPrompts } from "../pages/prompts/ListaPrompts";
import { UploadProcesso } from "../pages/processos/UploadProcesso";
import { DetalhePrompt } from "../pages/prompts/DetalhePrompt";
import { AnalisesMain } from "../pages/processos/AnaliseMain";

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
        path: "/modelos",
        label: "Modelos",
      },
      {
        icon: LocationCity,
        path: "/prompts",
        label: "Prompts",
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
        path="/processos/upload/:id"
        element={
          <RequireAuth>
            <UploadProcesso></UploadProcesso>
          </RequireAuth>
        }
      />
      <Route
        path="/processos/analises/:id"
        element={
          <RequireAuth>
            <AnalisesMain></AnalisesMain>
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
      //Modelos
      <Route
        path="/modelos"
        element={
          <RequireAuth>
            <ListaModelos></ListaModelos>
          </RequireAuth>
        }
      />
      <Route
        path="/modelos/detalhes/:id"
        element={
          <RequireAuth>
            <DetalheModelos></DetalheModelos>
          </RequireAuth>
        }
      />
      //Prompts
      <Route
        path="/prompts"
        element={
          <RequireAuth>
            <ListaPrompts></ListaPrompts>
          </RequireAuth>
        }
      />
      <Route
        path="/prompts/detalhes/:id"
        element={
          <RequireAuth>
            <DetalhePrompt></DetalhePrompt>
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
