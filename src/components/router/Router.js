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
import Processes from "../processes/Processes";
import ProcessView from "../processes/ProcessView";
import ProcessForm from "../processes/ProcessForm";
import Typologies from "../typologies/Typologies";
import TypologyView from "../typologies/TypologyView";
import TypologyForm from "../typologies/TypologyForm";
import Threats from "../threats/Threats";
import ThreatView from "../threats/ThreatView";
import ThreatForm from "../threats/ThreatForm";
import RiskScenarioView from "../riskScenarios/RiskScenarioView";
import RiskScenarioForm from "../riskScenarios/RiskScenarioForm";
import VulnerabilityForm from "../vulnerabilities/VulnerabilityForm";
import VulnerabilityView from "../vulnerabilities/VulnerabilityView";
import Vulnerabilities from "../vulnerabilities/Vulnerabilities";
import RiskScenarios from "../riskScenarios/RiskScenarios";
import Assets from "../assets/Assets";
import AssetView from "../assets/AssetView";
import AssetForm from "../assets/AssetForm";
import RiskAnalyzes from "../riskAnalyzes/RiskAnalyzes";
import RiskAnalysisView from "../riskAnalyzes/RiskAnalysisView";
import RiskAnalysisForm from "../riskAnalyzes/RiskAnalysisForm";

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
          <UserRoute exact={true} path="/processes">
            <Processes />
          </UserRoute>
          <UserRoute exact={true} path="/processes/view/:id">
            <ProcessView />
          </UserRoute>
          <UserRoute exact={true} path="/processes/:id/edit">
            <ProcessForm />
          </UserRoute>
          <UserRoute exact={true} path="/processes/create">
            <ProcessForm />
          </UserRoute>
          <UserRoute exact={true} path="/typologies">
            <Typologies />
          </UserRoute>
          <UserRoute exact={true} path="/typologies/view/:id">
            <TypologyView />
          </UserRoute>
          <UserRoute exact={true} path="/typologies/create">
            <TypologyForm />
          </UserRoute>
          <UserRoute exact={true} path="/typologies/:id/edit">
            <TypologyForm />
          </UserRoute>
          <UserRoute exact={true} path="/threats">
            <Threats />
          </UserRoute>
          <UserRoute exact={true} path="/threats/view/:typologyId/:threatId">
            <ThreatView />
          </UserRoute>
          <UserRoute exact={true} path="/threats/:typologyId/:threatId/edit">
            <ThreatForm />
          </UserRoute>
          <UserRoute exact={true} path="/threats/create">
            <ThreatForm />
          </UserRoute>
          <UserRoute exact={true} path="/riskscenarios">
            <RiskScenarios />
          </UserRoute>
          <UserRoute exact={true} path="/riskscenarios/view/:typologyId/:riskScenarioId">
            <RiskScenarioView />
          </UserRoute>
          <UserRoute exact={true} path="/riskscenarios/:typologyId/:riskScenarioId/edit">
            <RiskScenarioForm />
          </UserRoute>
          <UserRoute exact={true} path="/riskscenarios/create">
            <RiskScenarioForm />
          </UserRoute>
          <UserRoute exact={true} path="/vulnerabilities">
            <Vulnerabilities />
          </UserRoute>
          <UserRoute exact={true} path="/vulnerabilities/view/:typologyId/:vulnerabilityId">
            <VulnerabilityView />
          </UserRoute>
          <UserRoute exact={true} path="/vulnerabilities/:typologyId/:vulnerabilityId/edit">
            <VulnerabilityForm />
          </UserRoute>
          <UserRoute exact={true} path="/vulnerabilities/create">
            <VulnerabilityForm />
          </UserRoute>
          <UserRoute exact={true} path="/assets">
            <Assets />
          </UserRoute>
          <UserRoute exact={true} path="/assets/view/:id">
            <AssetView />
          </UserRoute>
          <UserRoute exact={true} path="/assets/:id/edit">
            <AssetForm />
          </UserRoute>
          <UserRoute exact={true} path="/assets/create">
            <AssetForm />
          </UserRoute>
          <UserRoute exact={true} path="/riskanalyzes">
            <RiskAnalyzes />
          </UserRoute>
          <UserRoute exact={true} path="/riskanalyzes/view/:assetId/:riskAnalysisId">
            <RiskAnalysisView />
          </UserRoute>
          <UserRoute exact={true} path="/riskanalyzes/create">
            <RiskAnalysisForm />
          </UserRoute>
          <UserRoute exact={true} path="/riskanalyzes/:assetId/:riskAnalysisId/edit">
            <RiskAnalysisForm />
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
