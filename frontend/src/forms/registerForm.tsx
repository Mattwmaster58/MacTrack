import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSnackbar } from "notistack";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useRegisterMutation } from "../hooks/useRegisterMutation";

const registerSchema = z.object({
  email: z.string().nonempty("Must be specified").email("Invalid email"),
  username: z
    .string()
    .nonempty("Must be specified")
    .min(4, "Must be more than 4 characters"),
  password: z
    .string()
    .nonempty("Must be specified")
    .min(8, "Must be more than 8 characters"),
});
export type RegisterValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const methods = useForm<RegisterValues>({
    mode: "all",
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const { mutateAsync, data, error, isError, isLoading } =
    useRegisterMutation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const onSubmit = async (vals: RegisterValues) => {
    try {
      await mutateAsync(vals);
      enqueueSnackbar("Account successfully created!", { variant: "success" });
      navigate("/sign-in");
    } catch (e) {}
  };
  const errorText = error?.response?.data.message ?? error?.message;

  return (
    <FormControl>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack
          maxHeight={"25rem"}
          maxWidth={"20rem"}
          alignItems={"center"}
          spacing={1}
          sx={{}}
        >
          <Typography variant={"h2"}>{"MacTrack"}</Typography>
          <Controller
            control={control}
            name={"email"}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size={"small"}
                error={!!errors.email}
                helperText={errors.email?.message ?? "\u00a0"}
                label={"Email"}
                type={"email"}
              />
            )}
          />
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
            {"Register"}
          </Button>
          <FormHelperText error={!!errorText}>{errorText}</FormHelperText>
        </Stack>
      </form>
    </FormControl>
  );
};

export { RegisterForm };
