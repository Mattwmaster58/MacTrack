import React from "react";
import { TitledPage } from "../../components/elements/titledPage";
import { FilterCoreForm } from "../../components/forms/filterCoreForm";
import { FilterForm } from "../../components/forms/filterForm";

const NewFilter = () => {
  return (
    <TitledPage title={"New Filter"}>
      <FilterForm onSubmit={(e) => console.log(e)} />
    </TitledPage>
  );
};

export { NewFilter };
