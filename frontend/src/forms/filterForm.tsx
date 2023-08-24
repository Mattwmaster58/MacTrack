import React, { useContext, useState } from "react";
import {
  getFormCoreElements,
  processInitialValues as processInitialCoreValues,
} from "./filterCoreForm";
import { Stack } from "@mui/system";
import {
  Control,
  FormProvider,
  useForm,
  UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonGroup, FormControl } from "@mui/material";
import { FilterCoreInputValues } from "../types/filterCoreSchema";
import { FilterMetaInputValues } from "../types/filterMetaSchema";
import {
  getFormMetaElements,
  processInitialValues as processInitialMetaValues,
} from "./filterMetaForm";
import { LoadingButton } from "@mui/lab";
import {
  FilterInitialValues,
  FilterInputValues,
  FilterOutputValues,
  FilterSchema,
} from "../types/filterSchema";
import { AuthContext } from "../common/authContext";
import { FilterPreviewModel } from "../components/filterPreviewModel";

type Props = {
  onSubmit: (values: FilterOutputValues) => void;
  initialValues?: FilterInitialValues;
};

const processInitialValues = (initialValues?: FilterInitialValues) => {
  const processedCore = processInitialCoreValues(initialValues);
  const processedMeta = processInitialMetaValues(initialValues);
  // in theory, a plain unpacking here would be fine,
  // but we use an explicit prop here to ensure meta/core do not bleed into eachothers values
  // maybe it would be better to explicitly fail here than do this just in case. w/e
  return {
    meta: processedMeta.meta,
    core: processedCore.core,
  };
};

const FilterForm = ({ initialValues, onSubmit }: Props) => {
  const {
    auth: { admin },
  } = useContext(AuthContext);

  const processedInitialValues = processInitialValues(initialValues);
  const methods = useForm<FilterInputValues, any, FilterOutputValues>({
    mode: "all",
    defaultValues: processedInitialValues,
    resolver: async (data, context, options) => {
      // purely for resolver debugging
      const validationResult = await zodResolver(FilterSchema)(
        data,
        context,
        options,
      );
      console.log("formData:", data, "formValidation:", validationResult);
      return new Promise((res) => res(validationResult));
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  let adminComponents;
  if (admin) {
    adminComponents = (
      <LoadingButton loading={isSubmitting}>{"force run now"}</LoadingButton>
    );
  } else {
    adminComponents = null;
  }

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<
    FilterOutputValues | undefined
  >();
  const setPreviewClosed = () => setPreviewOpen(false);
  const handlePreviewSubmit = (vals: FilterOutputValues) => {
    setPreviewData(vals);
    setPreviewOpen(true);
  };

  return (
    <Stack>
      {previewData && (
        <FilterPreviewModel
          open={previewOpen}
          handleClose={setPreviewClosed}
          title={previewData.meta.name ?? "default value"}
          data={previewData}
        />
      )}
      <FormControl>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            {getFormMetaElements(
              // too lazy to fix this ...
              // in theory, this should be fine, we don't use control.reset so should be fine tm
              // control,
              control as unknown as Control<FilterMetaInputValues>,
              errors,
            )}
            {getFormCoreElements(
              control as unknown as Control<FilterCoreInputValues>,
              errors,
            )}
          </FormProvider>
          <Stack justifyContent={"end"} direction={"row"}>
            <ButtonGroup variant={"contained"}>
              {adminComponents}
              <LoadingButton
                loading={false}
                onClick={handleSubmit(handlePreviewSubmit)}
              >
                {"View historical results"}
              </LoadingButton>
              <LoadingButton loading={isSubmitting} type={"submit"}>
                {"Save"}
              </LoadingButton>
            </ButtonGroup>
          </Stack>
        </form>
      </FormControl>
    </Stack>
  );
};

export { FilterForm };
