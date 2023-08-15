import { useRouteError } from "react-router-dom";
import { Stack } from "@mui/system";
import { Typography } from "@mui/material";

const UnauthorizedCatcher = () => {
  const error = useRouteError();
  console.log("error has occurred", error);
  // todo: if this is an unauthorized error, then we should redirect to login page and show toast, otherwise fail

  return (
    <Stack
      spacing={1}
      alignItems={"center"}
      justifyContent={"center"}
      sx={{
        minHeight: "100vh",
      }}
    >
      <Typography>Something went wrong</Typography>
    </Stack>
  );
};

export { UnauthorizedCatcher };
