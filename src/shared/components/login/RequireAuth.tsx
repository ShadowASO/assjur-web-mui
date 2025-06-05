import { Navigate } from "react-router-dom";
import { getApiObjeto } from "../../services/api/fetch/ApiCliente";

interface IRequireAuthProps {
  children?: React.ReactNode;
}
//export const Login: React.FC<ILoginProps> = ({ children }) => {

export const RequireAuth = ({ children }: IRequireAuthProps) => {
  const Api = getApiObjeto();
  const isAuthenticated = Api.isAuthenticated();

  if (!isAuthenticated) {
    console.log("Não autenticado!");
    return <Navigate to="/login" replace />;
  }

  return children;
};
