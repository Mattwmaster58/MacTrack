import { z } from "zod";
// should match the type definitions in @api/routes/data/filter.py
// currently maintained by hand :/

const ConditionsEnum = z.enum(["OPEN BOX", "DAMAGED", "NEW"]);
const BooleanFunctionEnum = z.enum(["AND", "OR"]);

const ftsQueryRootKey = z
  .object({
    fts_query: z.object({
      boolean_function: BooleanFunctionEnum,
      columns: z.array(z.string().nonempty()).nonempty(),
      includes: z
        .array(z.string().nonempty())
        .nonempty("At least one term must be specified"),
      excludes: z.array(z.string().nonempty()),
    }),
  })
  .required();

// this gets complicated because we want to accomplish 2 things.
//  - one is the ability to have this input empty, 2 is to transform that empty input into a
//  type matching primitive sentinel value for storing in the database
// basically, the input values of the schema needs to be a *subset* type of the output type
const possiblyEmptyPriceInput = z
  .union([z.string(), z.number()])
  .transform((s) => parseFloat((s ?? "").toString()) || -1);

const restOfItemFilterSchema = z
  .object({
    min_retail_price: possiblyEmptyPriceInput,
    max_retail_price: possiblyEmptyPriceInput,
    damaged: z.boolean(),
    new_: z.boolean(),
    open_box: z.boolean(),
  })
  .refine(
    ({ min_retail_price, max_retail_price }) => {
      return (
        [min_retail_price, max_retail_price].includes(-1) ||
        min_retail_price < max_retail_price
      );
    },
    {
      message: "Minimum must be less than maximum",
      path: ["min_retail_price"],
    },
  )
  .refine(
    ({ damaged, new_, open_box }) => [damaged, new_, open_box].includes(true),
    { message: "Select at least one condition", path: ["new_"] },
  );

const FilterCoreSchema = z.intersection(
  restOfItemFilterSchema,
  ftsQueryRootKey,
);

export type FilterCoreOutputValues = z.output<typeof FilterCoreSchema>;
export type FilterCoreInputValues = z.input<typeof FilterCoreSchema>;
export { FilterCoreSchema };
