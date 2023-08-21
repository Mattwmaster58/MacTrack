import React from "react";
import { TitledPage } from "../../components/titledPage";
import { FilterForm } from "../../forms/filterForm";
import { useNewFilterMutation } from "../../hooks/useNewFilterMutation";
import { FilterOutputValues } from "../../types/filterSchema";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const NewFilter = () => {
  const { mutateAsync, isSuccess, isError, error } = useNewFilterMutation();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const onSubmit = async (vals: FilterOutputValues) => {
    // this need to be async, so we can be informed of the forms isSubmitting
    // mutate will usually catch and throw away this error for us, but async requires us
    // to throw it away ourselves AIUI
    await mutateAsync(vals).catch();
  };

  if (isError) {
    enqueueSnackbar(`Failed to save: ${JSON.stringify(error)}`, {
      variant: "error",
    });
  } else if (isSuccess) {
    // todo: this shows twice (react strict mode rendering twice?)
    enqueueSnackbar(`Filter created`, { variant: "success", key: "newFilter" });
    navigate("/filters");
  }

  return (
    <TitledPage title={"New Filter"}>
      <FilterForm onSubmit={onSubmit} />
    </TitledPage>
  );
};

export { NewFilter };
