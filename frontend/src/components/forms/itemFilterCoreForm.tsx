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
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FilterMatchType } from "../../types/FilterMatchType";
import { TagInput } from "../elements/tagInput";
import {
  FilterCoreInputValues,
  FilterCoreOutputValues,
  FilterCoreSchema,
} from "../../types/filterCoreSchema";

const DEFAULT_ITEM_FILTER_VALUES = {
  fts_query: {
    boolean_function: FilterMatchType.ALL,
    columns: ["product_name", "title"],
    includes: [],
    excludes: [],
  },
  min_retail_price: 10,
  max_retail_price: -1,
  new_: true,
  open_box: true,
  damaged: false,
};

interface Props {
  onSubmit: (data: FilterCoreOutputValues) => void;
  initialValues?: FilterCoreOutputValues;
}

interface initialTransform<T> {
  path: string;
  initialTransform: (val: T) => T;
}

const processInitialValues = (initialValues?: FilterCoreOutputValues) => {
  // this complexity arises from having to rectify 3 slightly different types:
  // database (pydantic), input form type, and output form type
  const minusOneToEmptyString = (val: string | number) =>
    val === -1 ? "" : val;
  const initialValueTransform: initialTransform<any>[] = [
    { path: "min_retail_price", initialTransform: minusOneToEmptyString },
    { path: "max_retail_price", initialTransform: minusOneToEmptyString },
  ];
  const mergedInitialValues = deepmerge(
    initialValues ?? {},
    DEFAULT_ITEM_FILTER_VALUES,
  );
  for (const { path, initialTransform } of initialValueTransform) {
    // todo: actually make these types work. it should be technically possible,
    //  but is currently not emotionally possible for me
    // @ts-ignore
    mergedInitialValues[path] = initialTransform(mergedInitialValues[path]);
  }
  return mergedInitialValues;
};

const ItemFilterCoreForm = ({ onSubmit, initialValues }: Props) => {
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
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  // todo: abstract these controller thingymabobs

  const toggleDescriptionColumn = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setValue(
      "fts_query.columns",
      ev.target.checked
        ? ["description", "product_name", "title"]
        : ["product_name", "title"],
    );
  };

  return (
    <FormControl>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
          <Stack flexDirection="column" spacing={2}>
            <Stack flexDirection="column" spacing={2}>
              <Stack flexDirection="row" alignItems="center" spacing={2}>
                <Typography alignItems={"center"}>
                  Include items where
                </Typography>
                <Controller
                  control={control}
                  name="fts_query.boolean_function"
                  render={({ field }) => (
                    <Select {...field}>
                      <MenuItem value={FilterMatchType.ANY}>Any</MenuItem>
                      <MenuItem value={FilterMatchType.ALL}>All</MenuItem>
                    </Select>
                  )}
                />
                of the following terms match
              </Stack>
              <Controller
                name="fts_query.includes"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TagInput
                    onTagsChange={onChange}
                    value={value}
                    externalErrorMessage={errors.fts_query?.includes?.message}
                  />
                )}
              />
            </Stack>
            <Stack flexDirection="row" alignItems="center" spacing={2}>
              <Typography alignItems={"center"}>
                and exclude those that contain any of the following
              </Typography>
              <Controller
                name="fts_query.excludes"
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
              name="fts_query.columns"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch {...field} onChange={toggleDescriptionColumn} />
                  }
                  label="Include description in search"
                />
              )}
            />
            <Typography>Retail price</Typography>
            <Stack flexDirection="row" spacing={2}>
              <Controller
                name="min_retail_price"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Minimum"
                    error={!!errors.min_retail_price?.message}
                    helperText={errors.min_retail_price?.message ?? "\u00a0"}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    {...field}
                  />
                )}
              />
              <Controller
                name="max_retail_price"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Maximum"
                    error={!!errors.max_retail_price?.message}
                    helperText={errors.max_retail_price?.message ?? "\u00a0"}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    {...field}
                  />
                )}
              />
            </Stack>
            <FormGroup row>
              <Controller
                name="open_box"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(ev) => field.onChange(ev.target.checked)}
                      />
                    }
                    label="Open Box"
                  />
                )}
              />
              <Controller
                name="damaged"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(ev) => field.onChange(ev.target.checked)}
                      />
                    }
                    label="Damaged"
                  />
                )}
              />
              <Controller
                name="new_"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(ev) => field.onChange(ev.target.checked)}
                      />
                    }
                    label="New"
                  />
                )}
              />
            </FormGroup>
            <FormHelperText error={!!errors.new_?.message}>
              {errors.new_?.message}
            </FormHelperText>
          </Stack>
        </FormProvider>
        <Button type="submit">Submit</Button>
      </form>
    </FormControl>
  );
};

export { ItemFilterCoreForm };
