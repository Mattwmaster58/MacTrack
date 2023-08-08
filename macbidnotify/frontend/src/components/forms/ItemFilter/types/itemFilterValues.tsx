import { FilterMatchType } from "../../../../types/FilterMatchType";
import { TagProps } from "../../../../types/TagInput";


export interface ItemFilterValues {
  boolean_function: FilterMatchType;
  terms: TagProps["data"][];
  exclude: TagProps["data"][];
  min_retail_price: number | null;
  max_retail_price: number | null;
  title_column: boolean;
  product_name_column: boolean;
  description_column: boolean;
}