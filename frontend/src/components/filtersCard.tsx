import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import parseISO from "date-fns/parseISO";
import { FilterData } from "../types/filterSchema";
import { formatDistanceToNow } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { useAccessibleOnClick } from "../common/useAccessibleOnClick";

interface Props {
  filter: FilterData;
}

const FilterCard = ({ filter }: Props) => {
  const lastUpdatedUtc = formatDistanceToNow(
    zonedTimeToUtc(parseISO(filter.meta.updated_at), "UTC"),
  );
  return (
    <Card
      sx={{
        height: "7rem",
        width: "21rem",
      }}
    >
      <CardActionArea
        {...useAccessibleOnClick(`/filters/update/${filter.meta.id}`)}
        sx={{ height: "100%", width: "100%" }}
      >
        <CardContent>
          <Typography noWrap variant={"h5"}>
            {filter.meta.name}
          </Typography>
        </CardContent>
        <CardActions>
          <Typography
            variant={"body2"}
            color={"CaptionText"}
          >{`Updated ${lastUpdatedUtc} ago`}</Typography>
        </CardActions>
      </CardActionArea>
    </Card>
  );
};

export { FilterCard };
