import { AccountCircle, Login, Search } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../common/authContext";

const TopBar = () => {
  const navigate = useNavigate();
  const {
    auth: { username },
  } = useContext(AuthContext);
  const notSignedIn = (
    <IconButton onClick={() => navigate("/sign-in")}>
      <Login /> {"Sign in"}
    </IconButton>
  );
  const alreadySignedIn = (
    <IconButton onClick={() => navigate("/sign-out")}>
      <AccountCircle /> {username}
    </IconButton>
  );
  return (
    <Stack direction={"column"} width={"100%"}>
      <Stack
        alignItems={"center"}
        justifyContent={""}
        spacing={2}
        direction={"row"}
        sx={{
          height: "5rem",
          paddingLeft: 2,
          paddingRight: 2,
          boxShadow: "0 1px 0 #FFF",
        }}
      >
        <Typography variant={"h4"}>{"MacTrack"}</Typography>
        <Link to={"/filters"} style={{ textDecoration: "none" }}>
          <Typography variant={"subtitle1"}>{"filters"}</Typography>
        </Link>
        <Box className={"spacer"} sx={{ flexGrow: 1 }} />
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position={"start"}>
                <Search />
              </InputAdornment>
            ),
          }}
        />
        {username ? alreadySignedIn : notSignedIn}
      </Stack>
      <Outlet />
    </Stack>
  );
};

export { TopBar };
