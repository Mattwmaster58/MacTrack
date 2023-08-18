import React from "react";
import { TitledPage } from "../../components/elements/titledPage";
import {
  FilterCoreForm,
  useFilterCoreFormAndHandler,
} from "../../components/forms/filterCoreForm";
import { FilterCoreOutputValues } from "../../types/filterCoreSchema";

const NewFilter = () => {
  const onCoreSubmit = (vals: FilterCoreOutputValues) => {};
  const { form, handleSubmit } = useFilterCoreFormAndHandler({
    onSubmit: onCoreSubmit,
  });
  return (
    <TitledPage title={"New Filter"}>
      <NewFilter />
    </TitledPage>
  );
};

export { NewFilter };
