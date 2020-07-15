import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import Unauthorized from "../components/Unauthorized";
import AuthService from "./AuthService";

export default function PrivateRoute({ children, ...props }) {
  return (
    <Route
      {...props}
      render={({ location }) =>
        AuthService.isAuthorized() ? (
          children
        ) : AuthService.isAuthenticated() ? (
          <Unauthorized />
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

export function UserRoute({ children, ...props }) {
  return (
    <Route
      {...props}
      render={({ location }) =>
        AuthService.isAuthenticated() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

export function PrivilegedRoute({ children, ...props }) {
  const [loading, setLoading] = useState(true);
  const [userPrivileged, setUserPrivileged] = useState(true);

  useEffect(() => {
    checkRole(props.role);
    return () => {
      
    }
  }, [props])

  const checkRole = async (roleType) => {
    try {
      const hasRole = await AuthService.hasAsyncRole(roleType);
      setLoading(false);
      setUserPrivileged(hasRole);
    } catch(e) {
      setLoading(false);
      setUserPrivileged(false);
    }
  }
  return (
    <Route
      {...props}
      render={({ location }) =>
        !loading && (
          AuthService.isAuthenticated() ? (
            userPrivileged ? (
              children
            ) : (
              <Redirect
                to={{
                  pathname: "/signin",
                  state: { from: location },
                }} />
            )
          ) : (
            <Redirect
              to={{
                pathname: "/signin",
                state: { from: location },
              }}
            />
          )
        )
      }
    />
  );
}

export function AuthenticatedGuard({ children, ...props }) {
  return (
    <Route
      {...props}
      render={({ location }) =>
        !AuthService.isAuthenticated() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}