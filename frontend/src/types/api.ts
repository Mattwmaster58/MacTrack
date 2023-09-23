import { z } from "zod";

export interface ApiResponse {
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T[];
}

const BasePaginatedResponseSchema = z.object({
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export const GetPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) => {
  return BasePaginatedResponseSchema.extend({
    data: z.array(dataSchema),
  });
};
