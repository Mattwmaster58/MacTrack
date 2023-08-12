import { Login } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Stack
      useFlexGap
      alignItems={"center"}
      justifyContent={"center"}
      spacing={2}
      direction="row"
      sx={{
        height: "5rem",
        width: "100%",
      }}
    >
      <TextField label={"search"} />
      <IconButton onClick={() => navigate("/login")}>
        <Login />
        <Link to="/login" state={{ previousLocation: location }}>
          Login
        </Link>
      </IconButton>
    </Stack>
  );
};

export { TopBar };
