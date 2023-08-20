import React from "react";
import { Stack } from "@mui/system";
import { Typography } from "@mui/material";

type Props = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactElement;
} & React.PropsWithChildren;
const TitledPage = ({ title, subtitle, rightElement, children }: Props) => {
  return (
    <Stack
      direction={"column"}
      sx={{
        padding: "3rem",
      }}
    >
      <Stack direction={"column"} spacing={2}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography variant={"h3"}>{title}</Typography>
          {rightElement}
        </Stack>
        <Typography variant={"h4"}>{subtitle}</Typography>
      </Stack>
      {children}
    </Stack>
  );
};

export { TitledPage };
