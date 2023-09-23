import { z } from "zod";
import { FilterCoreOutputValues, FilterCoreSchema } from "./filterCoreSchema";
import {
  FilterMetaInputValues,
  FilterMetaSchema,
  FilterMetaSchemaBase,
} from "./filterMetaSchema";
import { pydanticDatetimeParsed } from "./pydantic";

export const FilterSchema = FilterCoreSchema.and(FilterMetaSchema);
export type FilterOutputValues = z.output<typeof FilterSchema>;
export type FilterInputValues = z.input<typeof FilterSchema>;
export type Filter = z.infer<typeof FilterSchema>;
export type FilterInitialValues = FilterCoreOutputValues &
  FilterMetaInputValues;
export const FilterMetaDataBaseSchema = FilterMetaSchemaBase.extend({
  id: z.number().int(),
  updated_at: pydanticDatetimeParsed,
  created_at: pydanticDatetimeParsed,
});
const FilterMetaDataSchema = z.object({
  meta: FilterMetaDataBaseSchema,
});
export const FilterDataSchema = FilterCoreSchema.and(FilterMetaDataSchema);
export type FilterData = z.infer<typeof FilterDataSchema>;

// todo: use a extendable paginated response schema
export const FilterDataPaginatedResponse = z.object({
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  data: z.array(FilterDataSchema),
});
