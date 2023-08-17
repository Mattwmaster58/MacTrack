import React, { useState } from "react";
import { FilterCoreForm } from "./filterCoreForm";
import { Stack } from "@mui/system";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormControl, TextField } from "@mui/material";
import { FilterCoreOutputValues } from "../../types/filterCoreSchema";

const FilterMetaSchema = z.object({
  name: z
    .string()
    .nonempty("Name must be specified")
    .max(128, "Name is too long"),
});
type FilterMeta = z.infer<typeof FilterMetaSchema>;

const FilterForm = () => {
  const methods = useForm<FilterMeta>({
    mode: "all",
    defaultValues: {},
    resolver: async (data, context, options) => {
      // purely for resolver debugging
      const validationResult = await zodResolver(FilterMetaSchema)(
        data,
        context,
        options,
      );
      console.log("formData:", data, "formValidation:", validationResult);
      return new Promise((res) => res(validationResult));
    },
  });
  const {
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const [filterCoreValues, setFilterCoreValues] =
    useState<FilterCoreOutputValues | null>(null);

  const onSubmit = (v: any) => {
    console.log(v);
  };

  return (
    <Stack>
      <FormControl>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <Controller
              name={"name"}
              control={control}
              render={({ field }) => (
                <TextField
                  label={"Name"}
                  error={!!errors.name?.message}
                  helperText={errors.name?.message ?? "\u00a0"}
                  {...field}
                />
              )}
            />
          </FormProvider>
        </form>
      </FormControl>
      <FilterCoreForm onSubmit={setFilterCoreValues} />
    </Stack>
  );
};

export { FilterForm };
