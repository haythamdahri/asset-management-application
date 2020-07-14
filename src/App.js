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
import PrivateRoute, {
  AuthenticatedGuard,
} from "./services/AuthGuard";
import Footer from "./components/Footer";

function App() {
  return (
      <Router>
        <div
          className="container-fluid"
          style={{
            minHeight: "100vh",
            fontFamily:
              "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif",
          }}
        >
          <Switch>
            <PrivateRoute exact={true} path="/">
              <Home />
            </PrivateRoute>
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
        </div>
      </Router>
    );
}

export default App;