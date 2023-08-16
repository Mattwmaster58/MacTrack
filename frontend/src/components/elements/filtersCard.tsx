import { FilterMeta } from "../../types/filterMetaSchema";
import { Card, Typography } from "@mui/material";

interface Props {
  meta: FilterMeta;
}

const FilterCard = ({ meta }: Props) => {
  return (
    <Card>
      <Typography variant="h1">{meta.name}</Typography>
    </Card>
  );
};

export { FilterCard };
