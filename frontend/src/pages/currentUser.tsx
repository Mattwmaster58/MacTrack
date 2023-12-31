import { CircularProgress, Fade, Grid, Typography, Zoom } from "@mui/material";
import { Stack } from "@mui/system";
import { ReactElement, useContext, useEffect, useState } from "react";
import { AuthContext } from "../common/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUserQuery } from "../hooks/useCurrentUserQuery";

const CurrentUser = () => {
  const {
    auth: { username },
    setAuth,
  } = useContext(AuthContext);
  const { error, data, isLoading, isError, refetch } = useCurrentUserQuery();
  const navigate = useNavigate();
  const location = useLocation();

  // @ts-ignore
  const returnUrl: string = (location?.state as any)?.referrer ?? "/";

  useEffect(() => {
    if (username) {
      console.log(`signed in, navigating to other url: ${returnUrl}`);
      navigate(returnUrl);
    } else {
      refetch();
    }
  }, [navigate, refetch, returnUrl, username]);

  useEffect(() => {
    if (!isLoading && data?.success) {
      console.log("setting auth: ", data);
      setAuth({ username: data.username, admin: data.admin });
    } else if (isError) {
      // @ts-ignore
      if (error?.response?.status === 401) {
        navigate(`/sign-in?returnUrl=${returnUrl}`);
      }
    }
  }, [isLoading, isError, data, setAuth]);

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
