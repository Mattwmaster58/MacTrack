import { useFiltersQuery } from "../hooks/useFiltersQuery";
import { Stack } from "@mui/system";
import { FilterCard } from "../components/elements/filtersCard";
import { CircularProgress } from "@mui/material";
import { FilterMeta } from "../types/filterMetaSchema";
import { TitledPage } from "../components/elements/titledPage";

const Filters = () => {
  const { data, isLoading, isError } = useFiltersQuery();

  const filterCards = (data ?? []).map((meta, idx) => (
    <FilterCard key={idx} meta={meta as unknown as FilterMeta} />
  ));

  return (
    <TitledPage title={"Filters"}>
      <Stack width={"100%"} alignItems={"center"}>
        {isLoading ? <CircularProgress /> : filterCards}
      </Stack>
    </TitledPage>
  );
};

export { Filters };
