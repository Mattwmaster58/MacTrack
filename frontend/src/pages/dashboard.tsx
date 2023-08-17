import React from "react";
import { FilterCoreForm } from "../components/forms/filterCoreForm";
import { Stack } from "@mui/system";

const Dashboard = () => {
  return (
    <Stack width={"100%"} alignItems={"center"}>
      <FilterCoreForm
        onSubmit={(vals) => {
          console.log(vals);
        }}
      />
    </Stack>
  );
};

export { Dashboard };
