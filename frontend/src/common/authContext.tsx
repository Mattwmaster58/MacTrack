import React, { useState } from "react";

interface Auth {
  username: string | null;
  admin: boolean;
}

interface IAuthContext {
  auth: Auth;
  setAuth: (auth: Auth) => void;
}

export const AuthContext = React.createContext<IAuthContext>({
  auth: { username: null, admin: false },
  setAuth: (auth: Auth) => {},
});

export const AuthContextProvider = (props: any) => {
  const setAuth = (auth: Auth) => {
    setAuthState({ ...authState, auth: auth });
  };
  const initState = {
    auth: { username: null, admin: false },
    setAuth,
  };
  const [authState, setAuthState] = useState<IAuthContext>(initState);

  return (
    <AuthContext.Provider value={authState}>
      {props.children}
    </AuthContext.Provider>
  );
};
