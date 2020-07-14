import React from "react";
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
  console.log(props.roles);
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