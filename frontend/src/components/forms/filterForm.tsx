import React from "react";
import {
  getFormCoreElements,
  processInitialValues as processInitialCoreValues,
} from "./filterCoreForm";
import { Stack } from "@mui/system";
import {
  Control,
  FormProvider,
  useForm,
  UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormControl } from "@mui/material";
import {
  FilterCoreInputValues,
  FilterCoreOutputValues,
  FilterCoreSchema,
} from "../../types/filterCoreSchema";
import {
  FilterMetaInputValues,
  FilterMetaSchema,
} from "../../types/filterMetaSchema";
import {
  getFormMetaElements,
  processInitialValues as processInitialMetaValues,
} from "./filterMetaForm";
import { LoadingButton } from "@mui/lab";

const FilterSchema = FilterCoreSchema.and(FilterMetaSchema);
export type FilterOutputValues = z.output<typeof FilterSchema>;
export type FilterInputValues = z.input<typeof FilterSchema>;
export type Filter = z.infer<typeof FilterSchema>;

type FilterInitialValues = FilterCoreOutputValues & FilterMetaInputValues;

type Props = {
  onSubmit: (values: FilterOutputValues) => void;
  initialValues?: FilterInitialValues;
};

const processInitialValues = (initialValues?: FilterInitialValues) => {
  return {
    ...processInitialCoreValues(initialValues),
    ...processInitialMetaValues(initialValues),
  };
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
    formState: { errors, isSubmitting },
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
          <Stack direction={"row"} justifyContent={"flex-end"}>
            <LoadingButton
              loading={isSubmitting}
              variant={"contained"}
              type={"submit"}
            >
              {"Save"}
            </LoadingButton>
          </Stack>
        </form>
      </FormControl>
    </Stack>
  );
};

export { FilterForm };
