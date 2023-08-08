import Skeleton from "@mui/material/Skeleton";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useSearchQuery } from "../../hooks/useSearchQuery";
import { ItemFilterValues } from "../forms/ItemFilter/types/itemFilterValues";
import { AuctionLotCard } from "./auctionLotCard";

interface Props {
  params: ItemFilterValues;
}

const SearchQueryContainer = ({ params }: Props) => {
  const { isLoading, data } = useSearchQuery(params);
  console.log(data);
  return isLoading ? (
    <Skeleton>Testing {isLoading}</Skeleton>
  ) : (
    <Grid2 container direction={"row"}>
      {(data ?? []).map((lot, idx) => (
        <Grid2>
          <AuctionLotCard key={idx} auctionInfo={lot} />
        </Grid2>
      ))}
    </Grid2>
  );
};
export { SearchQueryContainer };
