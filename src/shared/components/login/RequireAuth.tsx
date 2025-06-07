import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";

interface IRequireAuthProps {
  children?: React.ReactNode;
}

export const RequireAuth = ({ children }: IRequireAuthProps) => {
  const { isAuth } = useAuth();

  if (!isAuth) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
