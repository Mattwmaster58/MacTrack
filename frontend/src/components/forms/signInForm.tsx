import { Button, TextField, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useForm } from "react-hook-form";

interface SignInValues {
  username: string;
  password: string;
}

const SignInForm = () => {
  const methods = useForm<SignInValues>({
    mode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  return (
    <Stack
      maxHeight={"25rem"}
      maxWidth={"25rem"}
      alignItems={"center"}
      spacing={1}
      sx={{}}
    >
      <Typography variant="h2">MacTrack</Typography>
      <TextField fullWidth label="Username" />
      <TextField fullWidth label="Password" type={"password"} />
      <Button fullWidth variant="contained">
        Sign in
      </Button>
    </Stack>
  );
};

export { SignInForm };
