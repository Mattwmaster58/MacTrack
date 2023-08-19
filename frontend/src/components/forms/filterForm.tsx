import React, { useState } from "react";
import {
  FilterCoreForm,
  getFormCoreElements,
  processInitialValues as processInitialCoreValues,
} from "./filterCoreForm";
import { Stack } from "@mui/system";
import {
  Control,
  Controller,
  FormProvider,
  useForm,
  UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, FormControl, TextField } from "@mui/material";
import {
  FilterCoreInputValues,
  FilterCoreOutputValues,
  FilterCoreSchema,
} from "../../types/filterCoreSchema";
import {
  FilterMetaInputValues,
  FilterMetaOutputValues,
  FilterMetaSchema,
} from "../../types/filterMetaSchema";
import {
  getFormMetaElements,
  processInitialValues as processInitialMetaValues,
} from "./filterMetaForm";

const FilterSchema = FilterCoreSchema.and(FilterMetaSchema);
export type FilterOutputValues = z.output<typeof FilterSchema>;
export type FilterInputValues = z.input<typeof FilterSchema>;
export type Filter = z.infer<typeof FilterSchema>;

type FilterInitialValues = {
  core: FilterOutputValues;
  meta: FilterMetaOutputValues;
};

type Props = {
  onSubmit: (values: FilterOutputValues) => void;
  initialValues?: FilterInitialValues;
};

const processInitialValues = (initialValues?: FilterInitialValues) => {
  const processedCoreValues = processInitialCoreValues(initialValues?.core);
  const processedMetaValues = processInitialMetaValues(initialValues?.meta);
  return { ...processedCoreValues, ...processedMetaValues };
};

const FilterForm = ({ initialValues, onSubmit }: Props) => {
  const methods = useForm<FilterInputValues, any, FilterOutputValues>({
    mode: "all",
    defaultValues: processInitialValues(initialValues),
    resolver: async (data, context, options) => {
      // purely for resolver debugging
      const validationResult = await zodResolver(FilterSchema)(
        data,
        context,
        options,
      );
      console.log("formData:", data, "formValidation:", validationResult);
      return new Promise((res) => res(validationResult));
    },
  });
  const {
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  return (
    <Stack>
      <FormControl>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            {getFormMetaElements(
              control as unknown as Control<FilterMetaInputValues>,
              errors,
            )}
            {getFormCoreElements(
              //too lazy to fix this ...
              // in theory, this should be fine, we don't use control.reset so should be fine tm
              // control,
              control as unknown as Control<FilterCoreInputValues>,
              errors,
              setValue as unknown as UseFormSetValue<FilterCoreInputValues>,
            )}
          </FormProvider>
          <Button type={"submit"}>{"Save"}</Button>
        </form>
      </FormControl>
    </Stack>
  );
};

export { FilterForm };
