import { z } from "zod";

const FilterMetaSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
});

export type FilterMeta = z.infer<typeof FilterMetaSchema>;
