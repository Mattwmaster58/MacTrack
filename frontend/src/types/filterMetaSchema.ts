import { z } from "zod";

const FilterMetaSchema = z.object({
  name: z
    .string()
    .nonempty("Name must be specified")
    .max(128, "Name is too long"),
});

export type FilterMetaOutputValues = z.output<typeof FilterMetaSchema>;
export type FilterMetaInputValues = z.input<typeof FilterMetaSchema>;
export type FilterMeta = z.infer<typeof FilterMetaSchema>;
export { FilterMetaSchema };
