import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import AssetService from "../services/AssetService";
import UserService from "../services/UserService";
import ProcessService from "../services/ProcessService";
import OrganizationService from "../services/OrganizationService";
import TypologyService from "../services/TypologyService";
import RiskAnalysisService from "../services/RiskAnalysisService";
import EntityService from "../services/EntityService";
import GroupService from "../services/GroupService";
import LanguageService from "../services/LanguageService";
import LocationService from "../services/LocationService";
import RiskScenarioService from "../services/RiskScenarioService";
import RoleService from "../services/RoleService";
import ThreatService from "../services/ThreatService";
import VulnerabilityService from "../services/VulnerabilityService";

export default () => {
  document.title = "Acceuil";
  const [assetsData, setAssetsData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [usersData, setUsersData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [processesData, setProcessesData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [organizationsData, setOrganizationsData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [entitiesData, setEntitiesData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [groupsData, setGroupsData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [languagesData, setLanguagesData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [locationsData, setLocationsData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [riskAnalyszesData, setRiskAnalyszesData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [riskScenariosData, setRiskScenariosData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [rolesData, setRolesData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [threatsData, setThreatsData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [typologiesData, setTypologiesData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState({
    counter: 0,
    isError: false,
    isLoading: true,
  });
  const [isUnauthorized, setIsUnAuthorized] = useState(false);

  useEffect(() => {
    // Fetch Assets
    fetchAssets();
    // Fetch Users
    fetchUsersCounter();
    // Fetch Processes
    fetchProcessesCounter();
    // Fetch Organizations
    fetchOrganizationsCounter();
    // Fetch Entities
    fetchEntitiesCounter();
    // Fetch Groups
    fetchGroupsCounter();
    // Fetch Languages
    fetchLanguagesCounter();
  }, []);

  const fetchAssets = () => {
    AssetService.getAssetsCounter()
      .then((counter) => {
        setAssetsData({ counter: counter, isError: false, isLoading: false });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setAssetsData({ counter: 0, isError: false, isLoading: false });
        } else {
          setAssetsData({ counter: 0, isError: true, isLoading: false });
        }
      });
  }

  const fetchUsersCounter = () => {
    UserService.getUsersCounter()
      .then((counter) => {
        setUsersData({ counter: counter, isError: false, isLoading: false });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setUsersData({ counter: 0, isError: false, isLoading: false });
        } else {
          setUsersData({ counter: 0, isError: true, isLoading: false });
        }
      });
  }

  const fetchProcessesCounter = () => {
    ProcessService.getProcessesCounter()
      .then((counter) => {
        setProcessesData({ counter: counter, isError: false, isLoading: false });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setProcessesData({ counter: 0, isError: false, isLoading: false });
        } else {
          setProcessesData({ counter: 0, isError: true, isLoading: false });
        }
      });
  }

  const fetchOrganizationsCounter = () => {
    OrganizationService.getOrganizationsCounter()
      .then((counter) => {
        setOrganizationsData({ counter: counter, isError: false, isLoading: false });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setOrganizationsData({ counter: 0, isError: false, isLoading: false });
        } else {
          setOrganizationsData({ counter: 0, isError: true, isLoading: false });
        }
      });
  }

  const fetchEntitiesCounter = () => {
    EntityService.getEntitiesCounter()
      .then((counter) => {
        setEntitiesData({ counter: counter, isError: false, isLoading: false });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setEntitiesData({ counter: 0, isError: false, isLoading: false });
        } else {
          setEntitiesData({ counter: 0, isError: true, isLoading: false });
        }
      });
  }

  const fetchGroupsCounter = () => {
    GroupService.getGroupsCounter()
      .then((counter) => {
        setGroupsData({ counter: counter, isError: false, isLoading: false });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setGroupsData({ counter: 0, isError: false, isLoading: false });
        } else {
          setGroupsData({ counter: 0, isError: true, isLoading: false });
        }
      });
  }

  const fetchLanguagesCounter = () => {
    LanguageService.getLanguagesCounter()
      .then((counter) => {
        setLanguagesData({ counter: counter, isError: false, isLoading: false });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setLanguagesData({ counter: 0, isError: false, isLoading: false });
        } else {
          setLanguagesData({ counter: 0, isError: true, isLoading: false });
        }
      });
  }

  return (
    <div>
      {/* Content Wrapper. Contains page content */}
      <div className="content-wrapper pb-5">
        {/* Content Header (Page header) */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Acceuil</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                </ol>
              </div>
            </div>
          </div>
          {/* /.container-fluid */}
        </section>
        {/* Main content */}
        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-3 col-6">
                {/* small box */}
                <div className="small-box bg-info">
                  {assetsData.isLoading && !assetsData.isError && (
                    <div className="overlay">
                      <i className="fas fa-2x fa-sync-alt fa-spin" />
                    </div>
                  )}

                  <div className="inner">
                    <h3>{assetsData.counter}</h3>
                    <p>Actif</p>
                  </div>
                  <div className="icon">
                    <i className="ion ion-bag" />
                  </div>
                  <Link to="/assets" className="small-box-footer">
                    Plus d'informations{" "}
                    <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
              {/* ./col */}
              <div className="col-lg-3 col-6">
                {/* small box */}
                <div className="small-box bg-success">
                  {processesData.isLoading && !usersData.isError && (
                    <div className="overlay">
                      <i className="fas fa-2x fa-sync-alt fa-spin" />
                    </div>
                  )}
                  <div className="inner">
                    <h3>
                      {processesData.counter}
                    </h3>
                    <p>Processus</p>
                  </div>
                  <div className="icon">
                    <i className="ion ion-stats-bars" />
                  </div>
                  <Link to="/processes" className="small-box-footer">
                  Plus d'informations <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
              {/* ./col */}
              <div className="col-lg-3 col-6">
                {/* small box */}
                <div className="small-box bg-warning">
                  {usersData.isLoading && !usersData.isError && (
                    <div className="overlay">
                      <i className="fas fa-2x fa-sync-alt fa-spin" />
                    </div>
                  )}
                  <div className="inner">
                  <h3>{usersData.counter}</h3>
                    <p>Utilisateurs</p>
                  </div>
                  <div className="icon">
                    <i className="ion ion-person-add" />
                  </div>
                  <Link to="/users" className="small-box-footer">
                  Plus d'informations <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
              {/* ./col */}
              <div className="col-lg-3 col-6">
                {/* small box */}
                <div className="small-box bg-danger">
                  {organizationsData.isLoading && !organizationsData.isError && (
                    <div className="overlay">
                      <i className="fas fa-2x fa-sync-alt fa-spin" />
                    </div>
                  )}
                  <div className="inner">
                  <h3>{organizationsData.counter}</h3>
                    <p>Organismes</p>
                  </div>
                  <div className="icon">
                    <i className="ion ion-pie-graph" />
                  </div>
                  <Link to="/organizations" className="small-box-footer">
                    Plus d'informations <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
              {/* ./col */}
              {/* ./col */}
              <div className="col-lg-3 col-6">
                {/* small box */}
                <div className="small-box bg-primary">
                  {entitiesData.isLoading && !entitiesData.isError && (
                    <div className="overlay">
                      <i className="fas fa-2x fa-sync-alt fa-spin" />
                    </div>
                  )}
                  <div className="inner">
                  <h3>{entitiesData.counter}</h3>
                    <p>Entités</p>
                  </div>
                  <div className="icon">
                    <i class="fas fa-cog"></i>
                  </div>
                  <Link to="/entities" className="small-box-footer">
                    Plus d'informations <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
              {/* ./col */}
              {/* ./col */}
              <div className="col-lg-3 col-6">
                {/* small box */}
                <div className="small-box bg-light">
                  {groupsData.isLoading && !groupsData.isError && (
                    <div className="overlay">
                      <i className="fas fa-2x fa-sync-alt fa-spin" />
                    </div>
                  )}
                  <div className="inner">
                  <h3>{groupsData.counter}</h3>
                    <p>Groupes</p>
                  </div>
                  <div className="icon">
                  <i class="fas fa-users"></i>
                  </div>
                  <Link to="/groups" className="small-box-footer">
                    Plus d'informations <i className="fas fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>  
              {/* ./col */}
              {/* ./col */}
              <div className="col-lg-3 col-6">
                {/* small box */}
                <div className="small-box bg-success">
                  {languagesData.isLoading && !languagesData.isError && (
                    <div className="overlay">
                      <i className="fas fa-2x fa-sync-alt fa-spin" />
                    </div>
                  )}
                  <div className="inner">
                  <h3>{groupsData.counter}</h3>
                    <p>Langues</p>
                  </div>
                  <div className="icon">
                  <i class="fas fa-language"></i>
                  </div>
                  <b className="small-box-footer">
                    Groupes
                  </b>
                </div>
              </div>
              {/* ./col */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
