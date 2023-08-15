import React from "react";
import { ItemFilterForm } from "../components/forms/itemFilterForm/itemFilterForm";

const Dashboard = () => {
  return (
    <ItemFilterForm
      onSubmit={(vals) => {
        console.log(vals);
      }}
    />
  );
};

export { Dashboard };
