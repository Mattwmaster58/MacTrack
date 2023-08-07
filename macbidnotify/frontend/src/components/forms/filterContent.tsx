import { Stack } from "@mui/system";
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { TagInput } from "../elements/tagInput";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { TagProps } from "../../types/TagInput";

enum MatchType {
  ANY = "any",
  ALL = "all",
}

export interface FilterContentValues {
  boolean_function: MatchType;
  terms: TagProps["data"][];
  exclude: TagProps["data"][];
  min_retail_price: number | null;
  max_retail_price: number | null;
}

interface Props {
  onSubmit: (data: FilterContentValues) => void;
}

const FilterContent = ({ onSubmit }: Props) => {
  const methods = useForm({
    mode: "all",
    defaultValues: {
      boolean_function: MatchType.ANY,
      terms: ["test?"],
      exclude: ["do these work?"],
      min_retail_price: null,
      max_retail_price: null,
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
          <Stack flexDirection="column" useFlexGap spacing={2}>
            <Stack flexDirection="column" useFlexGap spacing={2}>
              <Stack
                flexDirection="row"
                alignItems="center"
                useFlexGap
                spacing={2}
              >
                <Typography alignItems={"center"}>
                  Include items where
                </Typography>
                <Controller
                  control={control}
                  name="boolean_function"
                  render={({ field }) => (
                    <Select {...field}>
                      <MenuItem value={MatchType.ANY}>{MatchType.ANY}</MenuItem>
                      <MenuItem value={MatchType.ALL}>{MatchType.ALL}</MenuItem>
                    </Select>
                  )}
                />
                of the following terms match
              </Stack>
              <Controller
                name="terms"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TagInput onTagsChange={onChange} value={value} />
                )}
              />
            </Stack>
            <Stack
              flexDirection="row"
              alignItems="center"
              useFlexGap
              spacing={2}
            >
              <Typography alignItems={"center"}>
                and exclude those that contain any of the following
              </Typography>
              <Controller
                name="exclude"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TagInput onTagsChange={onChange} value={value} />
                )}
              />
            </Stack>
          </Stack>
          <Stack flexDirection="row" useFlexGap spacing={2}>
            <Controller
              name="max_retail_price"
              control={control}
              render={({ field }) => <TextField inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} {...field} />}
            />
            <Controller
              name="min_retail_price"
              control={control}
              render={({ field }) => <TextField inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} {...field} />}
            />
          </Stack>
        </FormProvider>
        <Button type="submit">Submit</Button>
      </form>
    </FormControl>
  );
};

export { FilterContent };
