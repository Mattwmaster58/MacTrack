import { AccountCircle, Login } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useContext } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../common/usernameContext";

const TopBar = () => {
  const navigate = useNavigate();
  const {
    auth: { user },
  } = useContext(AuthContext);
  const notSignedIn = (
    <IconButton onClick={() => navigate("/sign-in")}>
      <Login /> Sign in
    </IconButton>
  );
  const alreadySignedIn = (
    <IconButton onClick={() => navigate("/sign-out")}>
      <AccountCircle /> {user}
    </IconButton>
  );
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
        {user ? alreadySignedIn : notSignedIn}
      </Stack>
      <Outlet />
    </Stack>
  );
};

export { TopBar };
