import { createTheme } from "@mui/material";

export const theme = createTheme({
  components: {
    MuiStack: {
      defaultProps: {
        useFlexGap: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
  },
});
