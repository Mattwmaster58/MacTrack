import { useContext } from "react";
import { AuthContext } from "../common/authContext";
import { useNavigate } from "react-router-dom";

const SignOut = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  setAuth({ username: null, admin: false });
  navigate("/dashboard");
  return <></>;
};

export { SignOut };
