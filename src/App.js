import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import SignIn from "./components/SignIn";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import {
  AuthenticatedGuard,
  PrivilegedRoute,
  UserRoute,
} from "./services/AuthGuard";
import RoleType from "./models/RoleType";
import Menu from "./components/Menu";
import Footer from "./components/Footer";
import AuthService from "./services/AuthService";
import Header from "./components/Header";
import Contact from "./components/Contact";
import Users from "./components/Users";

function App() {
  return (
    <Router>
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
        <PrivilegedRoute
          role={RoleType.ROLE_ADMIN}
          exact={true}
          path="/users"
        >
          <Users />
        </PrivilegedRoute>
        <AuthenticatedGuard exact={true} path="/signin">
          <SignIn />
        </AuthenticatedGuard>
        <Route exact={true} path="/notfound">
          <NotFound />
        </Route>
        {/** Not Found Page */}
        <Route path="">
          <Redirect to="/notfound" />
        </Route>
      </Switch>
      {AuthService.isAuthenticated() && <Footer />}
    </Router>
  );
}

export default App;
