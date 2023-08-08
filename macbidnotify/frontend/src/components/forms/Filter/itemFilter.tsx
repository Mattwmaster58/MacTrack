import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Switch,
} from "@mui/material";
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FilterMatchType } from "../../../types/FilterMatchType";

import { RetailPriceInput } from "./retailPriceInput";
import { TermsInput } from "./termsInput";
import { ItemFilterValues } from "./types/itemFilterValues";

interface Props {
  onSubmit: (data: ItemFilterValues) => void;
}

const ItemFilter = ({ onSubmit }: Props) => {
  const methods = useForm<ItemFilterValues>({
    mode: "all",
    defaultValues: {
      boolean_function: FilterMatchType.ANY,
      terms: ["test?"],
      exclude: ["do these work?"],
      min_retail_price: null,
      max_retail_price: null,
      title_column: true,
      product_name_column: true,
      description_column: true,
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  // @ts-ignore
  return (
    <FormControl>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
          {TermsInput(control)}
          {RetailPriceInput(control)}

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
                <FormControlLabel
                  control={<Switch {...field} />}
                  label="Title"
                />
              )}
            />
          </FormGroup>
        </FormProvider>
        <Button type="submit">Submit</Button>
      </form>
    </FormControl>
  );
};

export { ItemFilter };
