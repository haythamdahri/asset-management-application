import React from "react";
import SignIn from "../authentication/SignIn";
import NotFound from "../NotFound";
import Home from "../Home";
import { AuthenticatedGuard, UserRoute } from "../../services/AuthGuard";
import Menu from "../Menu";
import Footer from "../Footer";
import AuthService from "../../services/AuthService";
import Header from "../Header";
import Contact from "../Contact";
import Users from "../users/Users";
import Groups from "../groups/Groups";
import GroupForm from "../groups/GroupForm";
import UserView from "../users/UserView";
import GroupView from "../groups/GroupView";
import UserForm from "../users/UserForm";
import PasswordRequest from "../authentication/PasswordRequest";
import PasswordReset from "../authentication/PasswordReset";
import SimpleReactLightbox from "simple-react-lightbox";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Profile from "../profile/Profile";
import Organizations from "../organizations/Organizations";
import OrganizationView from "../organizations/OrganizationView";
import OrganizationForm from "../organizations/OrganizationForm";

export default () => {
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
          <UserRoute exact={true} path="/users">
            <Users />
          </UserRoute>
          <UserRoute exact={true} path="/users/view/:id">
            <UserView />
          </UserRoute>
          <UserRoute exact={true} path="/users/:id/edit">
            <UserForm />
          </UserRoute>
          <UserRoute exact={true} path="/users/create">
            <UserForm />
          </UserRoute>
          <UserRoute exact={true} path="/groups">
            <Groups />
          </UserRoute>
          <UserRoute exact={true} path="/groups/:id/edit">
            <GroupForm />
          </UserRoute>
          <UserRoute exact={true} path="/groups/create">
            <GroupForm />
          </UserRoute>
          <UserRoute exact={true} path="/groups/view/:id">
            <GroupView />
          </UserRoute>
          <UserRoute exact={true} path="/profile">
            <Profile />
          </UserRoute>
          <UserRoute exact={true} path="/organizations">
            <Organizations />
          </UserRoute>
          <UserRoute exact={true} path="/organizations/:id/edit">
            <OrganizationForm />
          </UserRoute>
          <UserRoute exact={true} path="/organizations/create">
            <OrganizationForm />
          </UserRoute>
          <UserRoute exact={true} path="/organizations/view/:id">
            <OrganizationView />
          </UserRoute>
          <AuthenticatedGuard exact={true} path="/signin">
            <SignIn />
          </AuthenticatedGuard>
          <Route exact={true} path="/reset-password">
            <PasswordRequest />
          </Route>
          <Route exact={true} path="/reset-password/:token">
            <PasswordReset />
          </Route>
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
};
