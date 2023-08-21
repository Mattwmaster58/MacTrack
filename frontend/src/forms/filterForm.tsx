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
import { FormControl } from "@mui/material";
import { FilterCoreInputValues } from "../types/filterCoreSchema";
import { FilterMetaInputValues } from "../types/filterMetaSchema";
import {
  getFormMetaElements,
  processInitialValues as processInitialMetaValues,
} from "./filterMetaForm";
import { LoadingButton } from "@mui/lab";
import {
  FilterInitialValues,
  FilterInputValues,
  FilterOutputValues,
  FilterSchema,
} from "../types/filterSchema";

type Props = {
  onSubmit: (values: FilterOutputValues) => void;
  initialValues?: FilterInitialValues;
};

const processInitialValues = (initialValues?: FilterInitialValues) => {
  const processedCore = processInitialCoreValues(initialValues);
  const processedMeta = processInitialMetaValues(initialValues);
  // in theory, a plain unpacking here would be fine,
  // but we use an explicit prop here to ensure meta/core do not bleed into eachothers values
  // maybe it would be better to explicitly fail here than do this just in case. w/e
  return {
    meta: processedMeta.meta,
    core: processedCore.core,
  };
};

const FilterForm = ({ initialValues, onSubmit }: Props) => {
  const processedInitialValues = processInitialValues(initialValues);
  const methods = useForm<FilterInputValues, any, FilterOutputValues>({
    mode: "all",
    defaultValues: processedInitialValues,
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
              // too lazy to fix this ...
              // in theory, this should be fine, we don't use control.reset so should be fine tm
              // control,
              control as unknown as Control<FilterCoreInputValues>,
              errors,
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
