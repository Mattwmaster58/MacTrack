import { QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import "./App.css";
import { queryClient } from "./common/queryClient";
import { SearchQueryContainer } from "./components/elements/searchQueryContainer";
import { ItemFilter } from "./components/forms/ItemFilter/itemFilter";
import { ItemFilterValues } from "./components/forms/ItemFilter/types/itemFilterValues";

function App() {
  const [filterValues, setFilterValues] = useState<ItemFilterValues>();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <ItemFilter onSubmit={setFilterValues} />
        {filterValues && <SearchQueryContainer params={filterValues} />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
