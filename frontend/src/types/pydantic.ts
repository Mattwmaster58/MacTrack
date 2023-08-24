import { RefinementCtx, z } from "zod";
import { isValid, parseISO } from "date-fns";

// everything from the API will be UTC, even though we currently don't say so
// todo: write a custom custom de/serializer for this so it's acutally somewhat enforced
const pydanticDatetime = z
  .string()
  .regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
const pydanticDatetimeTransform = (
  val: string | null,
  ctx: z.RefinementCtx,
) => {
  if (val === null) return null;
  const parsed = parseISO(val);
  if (!isValid(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Failed to deserialize to date-fns data",
    });
    return z.NEVER;
  }
  return parsed;
};
export const pydanticDatetimeParsedNullable = pydanticDatetime
  .nullable()
  .transform(pydanticDatetimeTransform);
export const pydanticDatetimeParsed = pydanticDatetime.transform(
  pydanticDatetimeTransform as (val: string, ctx: RefinementCtx) => Date,
);
