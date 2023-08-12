import {Button, TextField, Typography} from "@mui/material";
import { Stack } from "@mui/system";
import { useForm } from "react-hook-form";

interface LoginRegisterValues {
  username: string;
  password: string;
}

const SignInForm = () => {
  const methods = useForm<LoginRegisterValues>({
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
    <Stack maxHeight={"25rem"} maxWidth={"20rem"} alignItems={"center"} spacing={1}>
      <Typography variant="h2">MacTrack</Typography>
      <TextField label="Username" />
      <TextField label="Password" type={"password"} />
      <Button sx={{width: "100%"}}>Sign in</Button>
    </Stack>
  );
};

export { SignInForm };
