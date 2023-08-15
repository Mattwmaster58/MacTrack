import { useFiltersQuery } from "../hooks/useFiltersQuery";
import { Stack, width } from "@mui/system";
import { FilterCard } from "../components/elements/filtersCard";
import { CircularProgress } from "@mui/material";

const Filters = () => {
  const { data, isLoading, isError } = useFiltersQuery();

  const filterCards = data.map((meta, idx) => (
    <FilterCard key={idx} meta={meta} />
  ));

  return (
    <Stack width={"100%"} alignItems={"center"}>
      {isLoading ? <CircularProgress /> : filterCards}
    </Stack>
  );
};
