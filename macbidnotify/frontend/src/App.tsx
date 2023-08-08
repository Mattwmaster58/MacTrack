import React, { useState } from "react";
import "./App.css";
import { ItemFilter } from "./components/forms/Filter/itemFilter";
import { ItemFilterValues } from "./components/forms/Filter/types/itemFilterValues";

function App() {
  const [filterValues, setFilterValues] = useState<ItemFilterValues>();

  return (
    <div className="App">
      <ItemFilter onSubmit={setFilterValues}/>
    </div>
  );
}

export default App;
