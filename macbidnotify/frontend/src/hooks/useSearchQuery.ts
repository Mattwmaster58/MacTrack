import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ItemFilterValues } from "../components/forms/ItemFilter/types/itemFilterValues";

const path = "/search";
const useSearchQuery = (itemsFilterValues: ItemFilterValues) => {
  return useQuery([path, itemsFilterValues], {
    queryFn: async () => {
      return await axios.get(path, { params: itemsFilterValues });
    },
  });
};

export { useSearchQuery };
