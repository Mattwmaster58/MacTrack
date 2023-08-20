import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { Link } from "react-router-dom";
import { RegisterForm, RegisterValues } from "../forms/registerForm";

interface Props {
  open: boolean;
  handleClose: () => void;
}

const Register = () => {
  const [registerValues, setRegisterValues] = useState<RegisterValues | null>(
    null,
  );
  console.log(registerValues);
  return (
    <Stack
      spacing={1}
      alignItems={"center"}
      justifyContent={"center"}
      sx={{
        minHeight: "100vh",
      }}
    >
      <RegisterForm />
      <Typography variant={"subtitle2"}>
        {"Already have an account? "}
        <Link to={"/sign-in"}>{"Sign in"}</Link>
      </Typography>
    </Stack>
  );
};

export { Register };
