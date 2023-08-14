import { z } from 'zod' // should match the type definitions in @api/routes/data/filter.py
// should match the type definitions in @api/routes/data/filter.py
// currently maintained by hand :/

const ConditionsEnum = z.enum(["OPEN BOX", "DAMAGED", "NEW"]);
const BooleanFunctionEnum = z.enum(["AND", "OR"]);

const ItemFilterSchema = z
  .object({
    fts_query: z
      .object({
        boolean_function: BooleanFunctionEnum,
        columns: z.array(z.string().nonempty()).nonempty(),
        includes: z.array(z.string().nonempty()).nonempty(),
        excludes: z.array(z.string().nonempty()).optional(),
      })
      .required(),
    min_retail_price: z
      .string()
      .optional()
      .transform((s) => parseFloat(s ?? "") || -1),
    max_retail_price: z
      .string()
      .optional()
      .transform((s) => parseFloat(s ?? "") || -1),
    conditions: z.array(ConditionsEnum),
  })
  .partial()
  .refine(
      // todo: verify this works as expected
      // see also: https://github.com/colinhacks/zod/issues/479
    ({ min_retail_price, max_retail_price }) => {
      console.log(min_retail_price, max_retail_price);
      const bounds = [min_retail_price, max_retail_price];
      if (bounds.includes(undefined) || bounds.includes(-1)) {
        return true;
      }
      return min_retail_price! <= max_retail_price!;
    },
    {
      message: "Maximum must be greater than minimum",
      path: ["min_retail_price"],
    }
  );

export type ItemFilterOutputValues = z.output<typeof ItemFilterSchema>;
export type ItemFilterInputValues = z.input<typeof ItemFilterSchema>;
export { ItemFilterSchema };
