import React from "react";
import { ItemFilterCoreForm } from "../components/forms/itemFilterCoreForm";
import { Stack } from "@mui/system";

const Dashboard = () => {
  return (
    <Stack width={"100%"} alignItems={"center"}>
      <ItemFilterCoreForm
        onSubmit={(vals) => {
          console.log(vals);
        }}
      />
    </Stack>
  );
};

export { Dashboard };
