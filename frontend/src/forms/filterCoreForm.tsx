import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
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
import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FormProvider,
  useForm,
  UseFormSetValue,
} from "react-hook-form";
import { FilterMatchType } from "../types/FilterMatchType";
import { TagInput } from "../components/tagInput";
import {
  FilterCoreInputValues,
  FilterCoreOutputValues,
  FilterCoreSchema,
} from "../types/filterCoreSchema";

import { deepmerge } from "../common/deepmerge";

const DEFAULT_FILTER_CORE_VALUES = {
  core: {
    fts_query: {
      boolean_function: FilterMatchType.ALL,
      include_description: false,
      includes: [],
      excludes: [],
    },
    min_retail_price: -1,
    max_retail_price: -1,
    new_: true,
    open_box: true,
    damaged: false,
  },
};

interface Props {
  onSubmit: (data: FilterCoreOutputValues) => void;
  initialValues?: FilterCoreOutputValues;
}

interface initialTransform<T> {
  path: string;
  initialTransform: (val: T) => T;
}

const processInitialValues = (
  initialValues?: FilterCoreOutputValues,
): FilterCoreOutputValues => {
  // this complexity arises from having to rectify 3 slightly different types:
  // database (pydantic), input form type, and output form type
  // dear future me: please don't have to do transforms on nested values
  const minusOneToEmptyString = (val: string | number) =>
    val === -1 ? "" : val;
  const initialValueTransform: initialTransform<
    keyof FilterCoreOutputValues["core"]
  >[] = [
    // @ts-ignore
    { path: "min_retail_price", initialTransform: minusOneToEmptyString },
    // @ts-ignore
    { path: "max_retail_price", initialTransform: minusOneToEmptyString },
  ];
  const mergedInitialValues = deepmerge(
    DEFAULT_FILTER_CORE_VALUES,
    initialValues ?? {},
  );
  for (const { path, initialTransform } of initialValueTransform) {
    // todo: actually make these types work. it should be technically possible,
    //  but is currently not emotionally possible for me
    // @ts-ignore
    mergedInitialValues.core[path] = initialTransform(
      // @ts-ignore
      mergedInitialValues.core[path],
    );
  }
  return mergedInitialValues as unknown as FilterCoreOutputValues;
};

function getFormCoreElements(
  control: Control<FilterCoreInputValues>,
  rootErrors: FieldErrors<FilterCoreInputValues>,
) {
  const rootPath = "core";
  const errors = rootErrors[rootPath] ?? {};

  return (
    <Stack flexDirection={"column"} spacing={1}>
      <Stack flexDirection={"column"} spacing={1}>
        <Typography variant={"h5"}>{"Search terms"}</Typography>
        <Stack flexDirection={"row"} alignItems={"baseline"} spacing={1}>
          <Typography alignItems={"center"}>{"Include items where"}</Typography>
          <Controller
            control={control}
            name={`${rootPath}.fts_query.boolean_function`}
            render={({ field }) => (
              <Select {...field}>
                <MenuItem value={FilterMatchType.ANY}>{"Any"}</MenuItem>
                <MenuItem value={FilterMatchType.ALL}>{"All"}</MenuItem>
              </Select>
            )}
          />
          {"of the following terms match"}
        </Stack>
        <Controller
          name={`${rootPath}.fts_query.includes`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TagInput
              onTagsChange={onChange}
              value={value}
              externalErrorMessage={errors.fts_query?.includes?.message}
            />
          )}
        />
        <Typography alignItems={"center"}>
          {"and exclude those that contain any of the following"}
        </Typography>
        <Controller
          name={`${rootPath}.fts_query.excludes`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TagInput
              onTagsChange={onChange}
              value={value}
              externalErrorMessage={errors.fts_query?.excludes?.message}
            />
          )}
        />
      </Stack>
      <Controller
        name={`${rootPath}.fts_query.include_description`}
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value}
                onChange={(ev) => field.onChange(ev.target.checked)}
              />
            }
            label={"Also search item description with these terms"}
          />
        )}
      />
      <Typography variant={"h5"}>{"Retail price"}</Typography>
      <Stack flexDirection={"row"} spacing={2}>
        <Controller
          name={`${rootPath}.min_retail_price`}
          control={control}
          render={({ field }) => (
            <TextField
              label={"Minimum"}
              error={!!errors.min_retail_price?.message}
              helperText={errors.min_retail_price?.message ?? "\u00a0"}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              {...field}
            />
          )}
        />
        <Controller
          name={`${rootPath}.max_retail_price`}
          control={control}
          render={({ field }) => (
            <TextField
              label={"Maximum"}
              error={!!errors.max_retail_price?.message}
              helperText={errors.max_retail_price?.message ?? "\u00a0"}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              {...field}
            />
          )}
        />
      </Stack>
      <Typography variant={"h5"}>{"Item Condition"}</Typography>
      <FormGroup row>
        <Controller
          name={`${rootPath}.new_`}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(ev) => field.onChange(ev.target.checked)}
                />
              }
              label={"New"}
            />
          )}
        />
        <Controller
          name={`${rootPath}.open_box`}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(ev) => field.onChange(ev.target.checked)}
                />
              }
              label={"Open Box"}
            />
          )}
        />
        <Controller
          name={`${rootPath}.damaged`}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(ev) => field.onChange(ev.target.checked)}
                />
              }
              label={"Damaged"}
            />
          )}
        />
      </FormGroup>
      <FormHelperText error={!!errors.new_?.message}>
        {errors.new_?.message}
      </FormHelperText>
    </Stack>
  );
}

const FilterCoreForm = ({ onSubmit, initialValues }: Props) => {
  const methods = useForm<FilterCoreInputValues, any, FilterCoreOutputValues>({
    mode: "all",
    defaultValues: processInitialValues(initialValues),
    resolver: async (data, context, options) => {
      // purely for resolver debugging
      const validationResult = await zodResolver(FilterCoreSchema)(
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
  // todo: abstract these controller thingymabobs

  return (
    <FormControl>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
          {getFormCoreElements(control, errors)}
        </FormProvider>
        <Button type={"submit"}>{"Submit"}</Button>
      </form>
    </FormControl>
  );
};

export { FilterCoreForm, getFormCoreElements, processInitialValues };
