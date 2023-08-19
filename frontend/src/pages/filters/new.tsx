import React from "react";
import { TitledPage } from "../../components/elements/titledPage";
import {
  FilterForm,
  FilterOutputValues,
} from "../../components/forms/filterForm";
import { useNewFilterMutation } from "../../hooks/useNewFilterMutation";

const NewFilter = () => {
  const { mutate, isError, error } = useNewFilterMutation();

  const onSubmit = (vals: FilterOutputValues) => {
    mutate(vals);
  };

  return (
    <TitledPage title={"New Filter"}>
      <FilterForm onSubmit={onSubmit} />
    </TitledPage>
  );
};

export { NewFilter };
