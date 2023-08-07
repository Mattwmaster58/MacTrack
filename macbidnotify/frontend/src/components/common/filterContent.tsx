import { Stack } from "@mui/system";
import { Button, MenuItem, Select, Typography } from "@mui/material";
import React from "react";
import { TagInput } from "./tagInput";
import { Controller, FormProvider, useForm } from "react-hook-form";

enum MatchType {
  ANY = "any",
  ALL = "all",
}

const FilterContent: React.FC = () => {
  const methods = useForm({
    mode: "all",
    defaultValues: {
      boolean_function: MatchType.ANY,
      terms: ["test?"],
      exclude: ["do these work?"],
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const onSubmit = handleSubmit((data: any) => console.log(data));
  console.log("errors", errors);
  return (
    <form onSubmit={onSubmit}>
      <FormProvider {...methods}>
        <Stack flexDirection="column" useFlexGap spacing={2}>
          <Stack flexDirection="column" useFlexGap spacing={2}>
            <Stack
              flexDirection="row"
              alignItems="center"
              useFlexGap
              spacing={2}
            >
              <Typography alignItems={"center"}>Include items where</Typography>
              <Controller
                control={control}
                name="boolean_function"
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={MatchType.ANY}>{MatchType.ANY}</MenuItem>
                    <MenuItem value={MatchType.ALL}>{MatchType.ALL}</MenuItem>
                  </Select>
                )}
              />
              of the following terms match
            </Stack>
            <Controller
              name="terms"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TagInput onTagsChange={onChange} value={value} />
              )}
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center" useFlexGap spacing={2}>
            <Typography alignItems={"center"}>
              and exclude those that contain any of the following
            </Typography>
            <Controller
              name="exclude"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TagInput onTagsChange={onChange} value={value} />
              )}
            />
          </Stack>
        </Stack>
      </FormProvider>
      <Button>Submit</Button>

    </form>
  );
};

export { FilterContent };
