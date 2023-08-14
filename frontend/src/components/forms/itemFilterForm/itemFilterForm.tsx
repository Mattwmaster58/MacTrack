import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormControl, FormControlLabel, Switch } from "@mui/material";
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FilterMatchType } from "../../../types/FilterMatchType";

import { RetailPriceInput } from "./retailPriceInput";
import { TermsInput } from "./termsInput";
import {
  ItemFilterOutputValues,
  ItemFilterInputValues, 
  ItemFilterSchema,
} from './types/itemFilter'

interface Props {
  onSubmit: (data: ItemFilterInputValues) => void;
}

const ItemFilterForm = ({ onSubmit }: Props) => {
  const methods = useForm<ItemFilterInputValues>({
    mode: "all",
    defaultValues: {
      fts_query: {
        boolean_function: FilterMatchType.ALL,
        columns: ["product_name", "title"],
        includes: [],
        excludes: [],
      },
      min_retail_price: undefined,
      max_retail_price: undefined,
    },
    resolver: zodResolver(ItemFilterSchema),
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
          <Controller
            name="fts_query.columns"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} />}
                label="Include description in search"
              />
            )}
          />
        </FormProvider>
        <Button type="submit">Submit</Button>
      </form>
    </FormControl>
  );
};

export { ItemFilterForm };
