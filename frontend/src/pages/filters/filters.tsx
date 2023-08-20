import { useFiltersQuery } from "../../hooks/useFiltersQuery";
import { Stack } from "@mui/system";
import { FilterCard } from "../../components/elements/filtersCard";
import { Button, CircularProgress, IconButton } from "@mui/material";
import { FilterMeta } from "../../types/filterMetaSchema";
import { TitledPage } from "../../components/elements/titledPage";
import { Add } from "@mui/icons-material";
import { Link, NavLink } from "react-router-dom";

const Filters = () => {
  const { data, isLoading, isError } = useFiltersQuery();

  const filterCards = (data ?? []).map((meta, idx) => (
    <FilterCard key={idx} filter={meta} />
  ));

  let rightElement = (
    <Button variant={"contained"} startIcon={<Add />}>
      <NavLink to={"/filters/new"}>{"New filter"}</NavLink>
    </Button>
  );

  const loadingElem = (
    <Stack width={"100%"} alignItems={"center"}>
      <CircularProgress />
    </Stack>
  );

  return (
    <TitledPage title={"Filters"} rightElement={rightElement}>
      {isLoading ? loadingElem : filterCards}
    </TitledPage>
  );
};

export { Filters };
