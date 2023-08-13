import { ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { queryClient } from "./common/queryClient";
import { TopBar } from "./components/elements/topBar";
import { Dashboard } from './pages/dashboard'
import { Register } from "./pages/register";
import { SignIn } from "./pages/signIn";
import { theme } from "./theme";

function App() {
  let routes = (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<TopBar />}>
        <Route path="advanced-search" element={<div />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <BrowserRouter>{routes}</BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App
