import React, { useState } from "react";
import { TitledPage } from "../../components/elements/titledPage";
import { FilterCoreForm } from "../../components/forms/filterCoreForm";
import { FilterCoreOutputValues } from "../../types/filterCoreSchema";

const NewFilter = () => {
  const [filterCore, setFilterCore] = useState<FilterCoreOutputValues | null>(
    null,
  );
  const filterCore = <FilterCoreForm onSubmit={setFilterCore} />;
  return (
    <TitledPage title={"New Filter"}>
      <NewFilter />
    </TitledPage>
  );
};

export { NewFilter };
