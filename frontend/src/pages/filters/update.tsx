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
import { useParams } from "react-router-dom";

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
    error: mutateError,
  } = useUpdateFilterMutation(filterId);
  const { data, isLoading, isError } = useFilterQuery(filterId);
  const onSubmit = (vals: FilterOutputValues) => {
    mutate(vals);
  };

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
