import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { deepmerge } from "deepmerge-ts";
import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FormProvider,
  UseFormSetValue,
  useForm,
} from "react-hook-form";
import { FilterMatchType } from "../../types/FilterMatchType";
import { TagInput } from "../elements/tagInput";
import {
  FilterMetaInputValues,
  FilterMetaOutputValues,
  FilterMetaSchema,
} from "../../types/filterMetaSchema";
import { FilterMeta } from "../../types/filterMetaSchema";

const DEFAULT_FILTER_META_VALUES = {
  name: "",
};

interface Props {
  onSubmit: (data: FilterMetaOutputValues) => void;
  initialValues?: FilterMetaOutputValues;
}

function getFormMetaElements(
  control: Control<FilterMetaInputValues>,
  errors: FieldErrors<FilterMetaInputValues>,
) {
  return (
    <Controller
      name={"name"}
      control={control}
      render={({ field }) => (
        <TextField
          sx={{ width: "100%" }}
          label={"Filter Name"}
          error={!!errors.name?.message}
          helperText={errors.name?.message ?? "\u00a0"}
          {...field}
        />
      )}
    />
  );
}

function processInitialValues(initialValues?: FilterMetaOutputValues) {
  return deepmerge(initialValues ?? {}, DEFAULT_FILTER_META_VALUES);
}

const FilterMetaForm = ({ onSubmit, initialValues }: Props) => {
  const methods = useForm<FilterMeta, any, FilterMeta>({
    mode: "all",
    defaultValues: processInitialValues(initialValues),
    resolver: async (data, context, options) => {
      // purely for resolver debugging
      const validationResult = await zodResolver(FilterMetaSchema)(
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
    formState: { errors },
  } = methods;

  return (
    <FormControl>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
          {getFormMetaElements(control, errors)}
        </FormProvider>
        <Button type={"submit"}>{"Submit"}</Button>
      </form>
    </FormControl>
  );
};

export { FilterMetaForm, getFormMetaElements, processInitialValues };
