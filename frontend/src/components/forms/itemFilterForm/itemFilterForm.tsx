import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  FormControlLabel,
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
import { ItemFilterInputValues, ItemFilterSchema } from "./types/itemFilter";

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
          <Stack flexDirection="column" spacing={2}>
            <Stack flexDirection="column" spacing={2}>
              <Stack flexDirection="row" alignItems="center" spacing={2}>
                <Typography alignItems={"center"}>Include items
                  where</Typography>
                <Controller
                  control={control}
                  name="fts_query.boolean_function"
                  render={({ field }) => <Select {...field}>
                      <MenuItem value={FilterMatchType.ANY}>Any</MenuItem>
                      <MenuItem value={FilterMatchType.ALL}>All</MenuItem>
                    </Select>}
                />
                of the following terms match
              </Stack>
              <Controller
                name="fts_query.includes"
                control={control}
                render={({ field: { onChange, value } }) => <TagInput onTagsChange={onChange} value={value}/>}
              />
            </Stack>
            <Stack flexDirection="row" alignItems="center" spacing={2}>
              <Typography alignItems={"center"}>
                and exclude those that contain any of the following
              </Typography>
              <Controller
                name="fts_query.excludes"
                control={control}
                render={({ field: { onChange, value } }) => <TagInput onTagsChange={onChange} value={value}/>}
              />
            </Stack>
          </Stack>
          <Stack>
            <Typography>Retail price</Typography>
            <Stack flexDirection="row" spacing={2}>
              <Controller
                defaultValue={""}
                name="min_retail_price"
                control={control}
                render={({ field }) => <TextField
                    label="Minimum"
                    error={!!errors.min_retail_price?.message}
                    helperText={errors.min_retail_price?.message ?? "\u00a0"}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    {...field}
                  />}
              />
              <Controller
                defaultValue={""}
                name="max_retail_price"
                control={control}
                render={({ field }) => <TextField
                    label="Maximum"
                    error={!!errors.max_retail_price?.message}
                    helperText={errors.max_retail_price?.message ?? "\u00a0"}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    {...field}
                  />}
              />
            </Stack>
          </Stack>
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
