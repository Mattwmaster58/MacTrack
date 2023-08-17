import { CircularProgress, Fade, Grid, Typography, Zoom } from "@mui/material";
import { Stack } from "@mui/system";
import { ReactElement, useContext, useState } from "react";
import { AuthContext } from "../common/authContext";
import { useNavigate } from "react-router-dom";
import { useCurrentUserQuery } from "../hooks/useCurrentUserQuery";

const CurrentUser = () => {
  const {
    auth: { username },
    setAuth,
  } = useContext(AuthContext);
  const { data, isLoading, isError, refetch } = useCurrentUserQuery();
  const navigate = useNavigate();

  // @ts-ignore
  // eslint-disable-next-line no-restricted-globals
  const returnUrl: string = (location?.state as any)?.referrer ?? "/";

  // username is set below, this *should* fetch username whenever we get it
  if (username) {
    console.log("logged in, navigating to other url");
    navigate(returnUrl);
  } else {
    refetch();
  }

  if (!isLoading && data?.success) {
    console.log("setting auth: ", data);
    setAuth({ username: data.username, admin: data.admin });
  }

  return (
    <Fade in unmountOnExit>
      <Stack
        spacing={1}
        alignItems={"center"}
        justifyContent={"center"}
        sx={{
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={250} />
      </Stack>
    </Fade>
  );
};

export { CurrentUser };
