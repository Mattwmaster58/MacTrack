import { TextField, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import { Control, Controller } from "react-hook-form";
import {
  ItemFilterInputValues,
  ItemFilterOutputValues,
} from './types/itemFilter'

export function RetailPriceInput<TFieldArrayValues>(
  control: Control<ItemFilterInputValues, any>
) {
  return (
    <Stack>
      <Typography>Retail price</Typography>
      <Stack flexDirection="row" spacing={2}>
        <Controller
          defaultValue={""}
          name="min_retail_price"
          control={control}
          render={({ field }) => (
            <TextField
              label="Minimum"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              {...field}
            />
          )}
        />
        <Controller
          defaultValue={""}
          name="max_retail_price"
          control={control}
          render={({ field }) => (
            <TextField
              label="Maximum"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              {...field}
            />
          )}
        />
      </Stack>
    </Stack>
  );
}
