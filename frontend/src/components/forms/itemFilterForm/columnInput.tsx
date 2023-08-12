import { FormControlLabel, FormGroup, FormLabel, Switch } from "@mui/material";
import React from "react";
import { Control, Controller } from "react-hook-form";
import { ItemFilterValues } from "./types/itemFilterValues";

export function ColumnInput<TFieldArrayValues>(
  control: Control<ItemFilterValues, any>
) {
  return (
    <FormGroup>
      <FormLabel component="legend">Text Columns</FormLabel>
      <Controller
        name="description_column"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} />}
            label="Description"
          />
        )}
      />
      <Controller
        name="product_name_column"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} />}
            label="Product Name"
          />
        )}
      />
      <Controller
        name="title_column"
        control={control}
        render={({ field }) => (
          <FormControlLabel control={<Switch {...field} />} label="Title" />
        )}
      />
    </FormGroup>
  );
}
