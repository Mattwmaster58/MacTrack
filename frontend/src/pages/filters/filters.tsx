import { useFiltersQuery } from "../../hooks/useFiltersQuery";
import { Stack } from "@mui/system";
import { FilterCard } from "../../components/filtersCard";
import { Button, CircularProgress } from "@mui/material";
import { TitledPage } from "../../components/titledPage";
import { Add } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import Grid2 from "@mui/material/Unstable_Grid2";

const Filters = () => {
  const { data, isLoading, isError } = useFiltersQuery();

  const filterCardsContainer = (
    <Grid2 container>
      {(data ?? []).map((filter, idx) => (
        <Grid2 key={idx}>
          <FilterCard filter={filter} />
        </Grid2>
      ))}
    </Grid2>
  );

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
      {isLoading ? loadingElem : filterCardsContainer}
    </TitledPage>
  );
};

export { Filters };
