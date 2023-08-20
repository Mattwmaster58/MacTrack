import {
  Button,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSnackbar } from "notistack";
import React, { useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useSignInMutation } from "../hooks/useSignInMutation";
import { AuthContext } from "../common/authContext";

const signInSchema = z.object({
  username: z.string().nonempty("Must be specified"),
  password: z.string().nonempty("Must be specified"),
});

export type SignInValues = z.infer<typeof signInSchema>;
const SignInForm = () => {
  const { auth, setAuth } = useContext(AuthContext);
  // todo: if already authed, do something different?
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
  const { mutateAsync, data, error, isError, isLoading } = useSignInMutation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const onSubmit = async (vals: SignInValues) => {
    try {
      const resp = await mutateAsync(vals);
      if (resp.success) {
        setAuth({ username: resp.username, admin: resp.admin });
        navigate("/dashboard");
      } else {
        enqueueSnackbar(`Failed to sign in ${resp.message}`, {
          variant: "error",
        });
      }
    } catch (e) {}
  };
  const errorText = error?.response?.data.message ?? error?.message;

  return (
    <FormControl>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack
          maxHeight={"25rem"}
          maxWidth={"25rem"}
          alignItems={"center"}
          spacing={1}
          sx={{}}
        >
          <Typography variant={"h2"}>{"MacTrack"}</Typography>
          <Controller
            control={control}
            name={"username"}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size={"small"}
                error={!!errors.username}
                helperText={errors.username?.message ?? "\u00a0"}
                label={"Username"}
              />
            )}
          />
          <Controller
            control={control}
            name={"password"}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size={"small"}
                error={!!errors.password}
                helperText={errors.password?.message ?? "\u00a0"}
                label={"Password"}
                type={"password"}
              />
            )}
          />
          <Button
            fullWidth
            variant={"contained"}
            type={"submit"}
            disabled={isLoading}
          >
            {"Sign In"}
          </Button>
          <FormHelperText error={!!errorText}>{errorText}</FormHelperText>
        </Stack>
      </form>
    </FormControl>
  );
};

export { SignInForm };
