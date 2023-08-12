import { Stack } from "@mui/system";
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
    </Stack>
  );
};

export { SignIn };
