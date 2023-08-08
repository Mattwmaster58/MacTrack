import Skeleton from "@mui/material/Skeleton";
import { useSearchQuery } from "../../hooks/useSearchQuery";
import { ItemFilterValues } from "../forms/ItemFilter/types/itemFilterValues";

interface Props {
  params: ItemFilterValues
}
const SearchQueryContainer = ({ params }: Props) => {
  const { isLoading, data } = useSearchQuery(params);
  console.log(data);
  return <Skeleton>Testing {isLoading}</Skeleton>;
};
export { SearchQueryContainer };
