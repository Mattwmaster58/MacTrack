import { useFiltersQuery } from "../../hooks/useFiltersQuery";
import { Stack } from "@mui/system";
import { FilterCard } from "../../components/elements/filtersCard";
import { Button, CircularProgress, IconButton } from "@mui/material";
import { FilterMeta } from "../../types/filterMetaSchema";
import { TitledPage } from "../../components/elements/titledPage";
import { Add } from "@mui/icons-material";
import { Link, NavLink } from "react-router-dom";

const Filters = () => {
  // const { data, isLoading, isError } = useFiltersQuery();

  const data = null;
  const isLoading = false;

  const filterCards = (data ?? []).map((meta, idx) => (
    <FilterCard key={idx} meta={meta as unknown as FilterMeta} />
  ));

  let rightElement = (
    <Button variant={"contained"} startIcon={<Add />}>
      <NavLink to={"/filters/new"}>{"New filter"}</NavLink>
    </Button>
  );

  return (
    <TitledPage title={"Filters"} rightElement={rightElement}>
      <Stack width={"100%"} alignItems={"center"}>
        {isLoading ? <CircularProgress /> : filterCards}
      </Stack>
    </TitledPage>
  );
};

export { Filters };
