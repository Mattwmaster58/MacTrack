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
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FilterMatchType } from "../../../types/FilterMatchType";
import { TagInput } from "../../elements/tagInput";
import {
  ItemFilterInputValues,
  ItemFilterOutputValues,
  ItemFilterSchema,
} from "./itemFilterSchema";

interface Props {
  onSubmit: (data: ItemFilterOutputValues) => void;
  initialValues?: ItemFilterOutputValues;
}

const ItemFilterForm = ({ onSubmit, initialValues }: Props) => {
  const methods = useForm<ItemFilterInputValues, any, ItemFilterOutputValues>({
    mode: "all",
    defaultValues: {
      fts_query: {
        boolean_function: FilterMatchType.ALL,
        columns: ["product_name", "title"],
        includes: [],
        excludes: [],
      },
      min_retail_price: "",
      max_retail_price: "",
      new_: true,
      open_box: true,
      damaged: false,
    },
    resolver: async (data, context, options) => {
      // you can debug your validation schema here
      console.log("formData", data);
      console.log(
        "validation result",
        await zodResolver(ItemFilterSchema)(data, context, options),
      );
      return zodResolver(ItemFilterSchema)(data, context, options);
    },
  });
  const {
    getValues,
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
  console.log("errors prop:", errors);

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

export { ItemFilterForm };
