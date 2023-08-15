import Skeleton from "@mui/material/Skeleton";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useSearchQuery } from "../../hooks/useSearchQuery";
import {ItemFilterOutputValues} from "../forms/itemFilterForm/itemFilterSchema";
import { AuctionLotCard } from "./AuctionLotCard/auctionLotCard";

interface Props {
  params: ItemFilterOutputValues;
}

const SearchQueryContainer = ({ params }: Props) => {
  const { isLoading, data } = useSearchQuery(params);
  console.log(data);
  return isLoading ? (
    <Skeleton>Testing {isLoading}</Skeleton>
  ) : (
    <Grid2 container direction={"row"} spacing={3}>
      {(data ?? []).map((lot, idx) => (
        <Grid2>
          <AuctionLotCard key={idx} auctionInfo={lot} />
        </Grid2>
      ))}
    </Grid2>
  );
};
export { SearchQueryContainer };
