import { Button, FormControl } from "@mui/material";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FilterMatchType } from "../../../types/FilterMatchType";
import { ColumnInput } from "./columnInput";

import { RetailPriceInput } from "./retailPriceInput";
import { TermsInput } from "./termsInput";
import { ItemFilterValues } from "./types/itemFilterValues";

interface Props {
  onSubmit: (data: ItemFilterValues) => void;
}

const ItemFilterForm = ({ onSubmit }: Props) => {
  const methods = useForm<ItemFilterValues>({
    mode: "all",
    defaultValues: {
      boolean_function: FilterMatchType.ANY,
      terms: [],
      exclude: [],
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
          {ColumnInput(control)}
        </FormProvider>
        <Button type="submit">Submit</Button>
      </form>
    </FormControl>
  );
};

export { ItemFilterForm };
