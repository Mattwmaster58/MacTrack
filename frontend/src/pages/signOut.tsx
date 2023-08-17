import { useContext } from "react";
import { AuthContext } from "../common/authContext";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

const SignOut = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  setAuth({ username: null, admin: false });
  navigate("/dashboard");
  return <CircularProgress></CircularProgress>;
};

export { SignOut };
