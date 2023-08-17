import { ThemeProvider } from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { TopBar } from "./components/elements/topBar";
import { Dashboard } from "./pages/dashboard";
import { Register } from "./pages/register";
import { SignIn } from "./pages/signIn";
import { theme } from "./theme";
import { UnauthorizedCatcher } from "./pages/unauthorizedCatcher";
import { AuthContextProvider } from "./common/authContext";
import { QueryClientProvider } from "./common/queryClient";
import { CurrentUser } from "./pages/currentUser";
import AuthenticateRoute from "./common/authenticatedRoute";
import { SignOut } from "./pages/signOut";

// see: https://stackoverflow.com/a/71273212/3427299
function App() {
  const routes = (
    <Routes>
      <Route path="/current-user" element={<CurrentUser />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/sign-out" element={<SignOut />} />
      <Route
        path="/"
        element={<TopBar />}
        errorElement={<UnauthorizedCatcher />}
      >
        <Route path="advanced-search" element={<div />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="filters"
          element={<AuthenticateRoute children={<Dashboard />} />}
        >
          <Route path="new" />
          <Route path="{filter_id:int}/edit" />
        </Route>
      </Route>
    </Routes>
  );

  return (
    <QueryClientProvider>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <AuthContextProvider>
            <BrowserRouter>{routes}</BrowserRouter>
          </AuthContextProvider>
        </SnackbarProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
