import { ThemeProvider } from "@mui/system";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { queryClient } from "./common/queryClient";
import { TopBar } from "./components/elements/topBar";
import { SignIn } from "./pages/signIn";
import { theme } from "./theme";

function App() {
  let routes = (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      <Route path="/" element={<TopBar />}>
        <Route
          path="logout"
          action={() => {
            console.log("logout");
            return true;
          }}
        />
        <Route path="search" element={<div />} />
        <Route path="dashboard" element={<div />} />
      </Route>
    </Routes>
  );

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        {/*<ThemeProvider theme={theme}>*/}
          <BrowserRouter>{routes}</BrowserRouter>
        {/*</ThemeProvider>*/}
      </QueryClientProvider>
    </React.StrictMode>
  );

  // return (
  //   <QueryClientProvider client={queryClient}>
  //     <div className="App">
  //       <ItemFilter onSubmit={setFilterValues} />
  //       {filterValues && <SearchQueryContainer params={filterValues} />}
  //     </div>
  //   </QueryClientProvider>
  // );
}

export default App;
