import { deepmergeCustom } from "deepmerge-ts";

// we rarely want to merge arrays when using deepmerge
export const deepmerge = deepmergeCustom({ mergeArrays: false });
