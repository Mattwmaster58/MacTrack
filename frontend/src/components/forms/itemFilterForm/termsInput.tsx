import { MenuItem, Select, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import { Control, Controller, CriteriaMode } from 'react-hook-form'
import { FilterMatchType } from "../../../types/FilterMatchType";
import { TagInput } from "../../elements/tagInput";
import {
  ItemFilterInputValues,
  ItemFilterOutputValues,
} from './types/itemFilter'

export function TermsInput<TFieldArrayValues>(
  control: Control<ItemFilterInputValues, any>
) {
  return (
    <Stack flexDirection="column" spacing={2}>
      <Stack flexDirection="column" spacing={2}>
        <Stack flexDirection="row" alignItems="center" spacing={2}>
          <Typography alignItems={"center"}>Include items where</Typography>
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
            <TagInput onTagsChange={onChange} value={value} />
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
            <TagInput onTagsChange={onChange} value={value} />
          )}
        />
      </Stack>
    </Stack>
  );
}
