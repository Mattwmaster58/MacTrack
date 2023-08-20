import { z } from "zod";
import { FilterCoreOutputValues, FilterCoreSchema } from "./filterCoreSchema";
import { FilterMetaInputValues, FilterMetaSchema } from "./filterMetaSchema";

export const FilterSchema = FilterCoreSchema.and(FilterMetaSchema);
export type FilterOutputValues = z.output<typeof FilterSchema>;
export type FilterInputValues = z.input<typeof FilterSchema>;
export type Filter = z.infer<typeof FilterSchema>;
export type FilterInitialValues = FilterCoreOutputValues &
  FilterMetaInputValues;
export type FilterData = FilterOutputValues & {
  meta: {
    id: number;
    updated_at: string;
    created_at: string;
  };
};
