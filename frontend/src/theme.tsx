import { createTheme } from "@mui/system";

export const theme = createTheme({
  components: {
    MuiStackBase: {
      defaultProps: {
        useFlexGap: true,
      },
    },
    MuiGridBase: {
      defaultProps: {
        useFlexGap: true,
      },
    },
  },
});
