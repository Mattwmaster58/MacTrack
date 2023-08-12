import { Modal, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { SignInRegister } from "../components/forms/SignInRegister";

interface Props {
  open: boolean;
  handleClose: () => void;
}

const SignInModal = ({ open, handleClose }: Props) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
    >
      <SignInRegister/>
    </Modal>
  );
};

export {SignInModal};
