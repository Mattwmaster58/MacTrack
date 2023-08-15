import { Login } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Stack direction="column" width="100%">
      <Stack
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
        <IconButton onClick={() => navigate("/sign-in")}>
          <Login /> Sign in
        </IconButton>
      </Stack>
      <Outlet />
    </Stack>
  );
};

export { TopBar };
