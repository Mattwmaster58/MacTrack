import { AccountCircle, Login } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../common/authContext";

const TopBar = () => {
  const navigate = useNavigate();
  const {
    auth: { username },
  } = useContext(AuthContext);
  const notSignedIn = (
    <IconButton onClick={() => navigate("/sign-in")}>
      <Login /> Sign in
    </IconButton>
  );
  const alreadySignedIn = (
    <IconButton onClick={() => navigate("/sign-out")}>
      <AccountCircle /> {username}
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
        {username ? alreadySignedIn : notSignedIn}
      </Stack>
      <Outlet />
    </Stack>
  );
};

export { TopBar };
