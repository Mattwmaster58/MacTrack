import { useFiltersQuery } from "../../hooks/useFiltersQuery";
import { Stack } from "@mui/system";
import { FilterCard } from "../../components/filtersCard";
import { Button, CircularProgress } from "@mui/material";
import { TitledPage } from "../../components/titledPage";
import { Add } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import Grid2 from "@mui/material/Unstable_Grid2";
import { PageRow } from "../../components/pageRow";
import { useState } from "react";

const Filters = () => {
  const [pagination, setPagination] = useState({ limit: 0, offset: 0 });
  const { data, isLoading, isFetching, isError } = useFiltersQuery(
    pagination.limit,
    pagination.offset,
  );

  const onPageChange = (limit: number, offset: number) => {
    console.log(limit, offset);
    setPagination({ limit, offset });
  };

  const filterCardsContainer = (
    <Stack>
      <Grid2 container spacing={1}>
        {(data?.data ?? []).map((filter, idx) => (
          <Grid2 key={idx}>
            <FilterCard filter={filter} />
          </Grid2>
        ))}
      </Grid2>
      {!isLoading ? (
        <PageRow
          limit={pagination.limit}
          offset={pagination.offset}
          total={data?.total ?? 1}
          onChange={onPageChange}
        />
      ) : null}
    </Stack>
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
      {isFetching ? loadingElem : filterCardsContainer}
    </TitledPage>
  );
};

export { Filters };
