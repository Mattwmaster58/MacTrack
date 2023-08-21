import React, { ReactNode, useContext } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext";

type Props = {
  adminOnly?: boolean;
  children: ReactNode;
};

const AuthenticateRoute = ({ adminOnly, children }: Props) => {
  const {
    auth: { username, admin },
  } = useContext(AuthContext);
  const location = useLocation();

  if (!username) {
    return (
      <Navigate to={"/current-user"} state={{ referrer: location.pathname }} />
    );
  }

  return <>{children}</>;
};

export default AuthenticateRoute;
