import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import { SignInForm } from "../components/forms/signInForm";

interface Props {
  open: boolean;
  handleClose: () => void;
}

const SignIn = () => {
  return (
    <Stack
      spacing={0}
      alignItems={"center"}
      justifyContent={"center"}
      sx={{
        minHeight: "100vh",
      }}
    >
      <SignInForm />
      <Typography variant="subtitle2">
        No account? <Link to={"/register"}>Register here</Link>
      </Typography>
    </Stack>
  );
};

export { SignIn };
