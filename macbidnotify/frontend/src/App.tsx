import React, { useState } from "react";
import "./App.css";
import {
  FilterContent,
  FilterContentValues,
} from "./components/forms/filterContent";

function App() {
  const [filterValues, setFilterValues] = useState<FilterContentValues>();

  return (
    <div className="App">
      <FilterContent onSubmit={setFilterValues}/>
    </div>
  );
}

export default App;
