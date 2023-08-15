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
      includes: z.array(z.string().nonempty()).nonempty("Enter some terms"),
      excludes: z.array(z.string().nonempty()),
    }),
  })
  .required();

const restOfItemFilterSchema = z
  .object({
    min_retail_price: z
      .string()
      .optional()
      .transform((s) => parseFloat(s ?? "") || -1),
    max_retail_price: z
      .string()
      .optional()
      .transform((s) => parseFloat(s ?? "") || -1),
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

const ItemFilterSchema = z.intersection(
  restOfItemFilterSchema,
  ftsQueryRootKey,
);

export type ItemFilterOutputValues = z.output<typeof ItemFilterSchema>;
export type ItemFilterInputValues = z.input<typeof ItemFilterSchema>;
export { ItemFilterSchema };
