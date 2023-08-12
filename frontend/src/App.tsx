import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import "./App.css";
import { queryClient } from "./common/queryClient";
import { TopBar } from "./components/elements/topBar";
import { SignInModal } from "./pages/SignInModal";

const root = <QueryClientProvider client={queryClient}><TopBar/><SignInModal open handleClose={() => {}}/></QueryClientProvider>;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={root}>
      <Route path="login" element={<SignInModal open handleClose={() => {}}/>} action={() => {console.log("he"); return false}}/>
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
  )
);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
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
