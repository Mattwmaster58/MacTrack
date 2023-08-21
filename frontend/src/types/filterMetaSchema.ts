import { z } from "zod";

export const FilterMetaSchemaBase = z.object({
  name: z
    .string()
    .nonempty("Name must be specified")
    .max(128, "Name is too long"),
  active: z.boolean(),
});

const FilterMetaSchema = z.object({
  meta: FilterMetaSchemaBase,
});

export type FilterMetaOutputValues = z.output<typeof FilterMetaSchema>;
export type FilterMetaInputValues = z.input<typeof FilterMetaSchema>;
export type FilterMeta = z.infer<typeof FilterMetaSchema>;
export { FilterMetaSchema };
