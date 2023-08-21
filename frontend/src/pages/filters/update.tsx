import React from "react";
import { TitledPage } from "../../components/titledPage";
import { FilterForm } from "../../forms/filterForm";
import { useNewFilterMutation } from "../../hooks/useNewFilterMutation";
import {
  FilterInitialValues,
  FilterOutputValues,
} from "../../types/filterSchema";
import { useUpdateFilterMutation } from "../../hooks/useUpdateFilterMutation";
import { useFilterQuery } from "../../hooks/useFilterQuery";
import { Centered } from "../../components/centered";
import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

type Props = {
  filterId: number;
};

// const UpdateFilter = ({ filterId }: Props) => {
const UpdateFilter = () => {
  const { filterId: filterIdStr } = useParams<{ filterId: string }>();
  const filterId = parseInt(filterIdStr!);
  const {
    mutate,
    isError: isMutateError,
    isSuccess: isMutateSuccess,
    error: mutateError,
  } = useUpdateFilterMutation(filterId);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { data, error, isLoading, isError, isSuccess } =
    useFilterQuery(filterId);
  const onSubmit = (vals: FilterOutputValues) => {
    mutate(vals);
  };

  if (isMutateError) {
    enqueueSnackbar(`Failed to save: ${JSON.stringify(error)}`, {
      variant: "error",
    });
  } else if (isMutateSuccess) {
    // todo: this shows twice (react strict mode rendering twice?)
    enqueueSnackbar(`Filter updated`, { variant: "success", key: filterId });
    navigate("/filters");
  }

  const loadingElem = (
    <Centered>
      <CircularProgress />
    </Centered>
  );

  return (
    <TitledPage title={"Edit Filter"}>
      {isLoading ? (
        loadingElem
      ) : (
        <FilterForm
          onSubmit={onSubmit}
          initialValues={data as FilterInitialValues}
        />
      )}
    </TitledPage>
  );
};

export { UpdateFilter };
