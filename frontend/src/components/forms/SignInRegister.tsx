import {Button, Modal, TextField, Typography} from "@mui/material";
import {Box, Stack, style} from "@mui/system";
import {useForm} from "react-hook-form";

interface LoginRegisterValues {
    email: string;
    password: string;
}
const SignInRegister = () => {
    const methods = useForm<LoginRegisterValues>({
        mode: "all",
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = methods;
    return (<Stack maxHeight={"10rem"} maxWidth={"20rem"}>
        <TextField label="Email"/>
        <TextField label="Password"/>
        <Button>Sign in</Button>
    </Stack>);
};

export {SignInRegister};
