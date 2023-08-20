import { Card, Typography } from "@mui/material";
import { Filter } from "../../types/filterSchema";

interface Props {
  filter: Filter;
}

const FilterCard = ({ filter }: Props) => {
  return (
    <Card>
      <Typography variant={"h1"}>{filter.meta.name}</Typography>
    </Card>
  );
};

export { FilterCard };
