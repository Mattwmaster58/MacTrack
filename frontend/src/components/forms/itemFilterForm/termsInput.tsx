import { MenuItem, Select, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import { Control, Controller } from "react-hook-form";
import { FilterMatchType } from "../../../types/FilterMatchType";
import { TagInput } from "../../elements/tagInput";
import { ItemFilterValues } from "./types/itemFilterValues";

export function TermsInput<TFieldArrayValues>(
  control: Control<ItemFilterValues, any>
) {
  return (
    <Stack flexDirection="column" spacing={2}>
      <Stack flexDirection="column" spacing={2}>
        <Stack flexDirection="row" alignItems="center" spacing={2}>
          <Typography alignItems={"center"}>Include items where</Typography>
          <Controller
            control={control}
            name="boolean_function"
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
          name="terms"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TagInput onTagsChange={onChange} value={value} />
          )}
        />
      </Stack>
      <Stack flexDirection="row" alignItems="center" spacing={2}>
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
  );
}
