import React, { useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import SignIn from "./components/authentication/SignIn";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import { AuthenticatedGuard, UserRoute } from "./services/AuthGuard";
import RoleType from "./models/RoleType";
import Menu from "./components/Menu";
import Footer from "./components/Footer";
import AuthService from "./services/AuthService";
import Header from "./components/Header";
import Contact from "./components/Contact";
import Users from "./components/users/Users";
import UserView from "./components/users/UserView";
import UserForm from "./components/users/UserForm";
import PasswordRequest from "./components/authentication/PasswordRequest";
import PasswordReset from "./components/authentication/PasswordReset";
import SimpleReactLightbox from "simple-react-lightbox";

function App() {
  useEffect(() => {
    // Add event listener
    window.addEventListener("storage", (e) => {
      window.location.reload();
    });
    return () => {
      window.removeEventListener("storage");
    };
  });

  return (
    <Router>
      <SimpleReactLightbox>
      {AuthService.isAuthenticated() && (
        <>
          <Header />
          <Menu />
        </>
      )}
      <Switch>
        {/** DYNAMIC ROUTES */}
        <UserRoute exact={true} path="/">
          <Home />
        </UserRoute>
        <UserRoute exact={true} path="/contact">
          <Contact />
        </UserRoute>
        <UserRoute role={RoleType.ROLE_ADMIN} exact={true} path="/users">
          <Users />
        </UserRoute>
        <UserRoute exact={true} path="/users/:id">
          <UserView />
        </UserRoute>
        <UserRoute exact={true} path="/users/:id/edit">
          <UserForm />
        </UserRoute>
        <UserRoute exact={true} path="/users/new/edit">
          <UserForm />
        </UserRoute>
        <AuthenticatedGuard exact={true} path="/signin">
          <SignIn />
        </AuthenticatedGuard>
        <AuthenticatedGuard exact={true} path="/reset-password">
          <PasswordRequest />
        </AuthenticatedGuard>
        <AuthenticatedGuard exact={true} path="/reset-password/:token">
          <PasswordReset />
        </AuthenticatedGuard>
        <Route exact={true} path="/notfound">
          <NotFound />
        </Route>
        {/** Not Found Page */}
        <UserRoute path="">
          <Redirect to="/notfound" />
        </UserRoute>
      </Switch>
      {AuthService.isAuthenticated() && <Footer />}
      </SimpleReactLightbox>
    </Router>
  );
}

export default App;
