import { Stack } from "@mui/material";
import React, { PropsWithChildren } from "react";

const Centered = (props: PropsWithChildren) => {
  return (
    <Stack alignItems={"center"} justifyContent={"center"}>
      {props.children}
    </Stack>
  );
};

export { Centered };
