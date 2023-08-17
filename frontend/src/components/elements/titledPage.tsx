import React from "react";
import { Stack } from "@mui/system";
import { Typography } from "@mui/material";

type Props = {
  title: string;
  subtitle?: string;
} & React.PropsWithChildren;
const TitledPage = ({ title, subtitle, children }: Props) => {
  return (
    <Stack
      direction={"column"}
      sx={{
        height: "100%",
        width: "100%",
        padding: "5rem",
      }}
    >
      <Stack direction={"column"}>
        <Typography variant={"h2"}>{title}</Typography>
        <Typography variant={"h3"}>{subtitle}</Typography>
      </Stack>
      {children}
    </Stack>
  );
};

export { TitledPage };
