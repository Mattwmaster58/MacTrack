import React, { createContext, useState } from "react";

interface Auth {
  user: string | null;
}

interface IAuthContext {
  auth: Auth;
  setAuth: (auth: Auth) => void;
}

export const AuthContext = React.createContext<IAuthContext>({
  auth: { user: null },
  setAuth: (auth: Auth) => {},
});

export const AuthContextProvider = (props: any) => {
  const setAuth = (auth: Auth) => {
    setAuthState({ ...authState, auth: auth });
  };
  const initState = {
    auth: { user: null },
    setAuth,
  };
  const [authState, setAuthState] = useState<IAuthContext>(initState);

  return (
    <AuthContext.Provider value={authState}>
      {props.children}
    </AuthContext.Provider>
  );
};
