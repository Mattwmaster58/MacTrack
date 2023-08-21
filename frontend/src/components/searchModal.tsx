import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FilterCoreOutputValues } from "../types/filterCoreSchema";

type Props = {
  open: boolean;
  data?: FilterCoreOutputValues;
};
const SearchModal = ({ open, data }: Props) => {
  return (
    <Dialog open={open} scroll={"paper"}>
      <DialogTitle id={"scroll-dialog-title"}>{"Subscribe"}</DialogTitle>
      <DialogContent dividers={true}>
        <DialogContentText
          id={"scroll-dialog-description"}
          tabIndex={-1}
        ></DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
