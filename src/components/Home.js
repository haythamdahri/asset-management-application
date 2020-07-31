import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import AssetService from "../services/AssetService";
import UserService from "../services/UserService";
import ProcessService from "../services/ProcessService";
import OrganizationService from "../services/OrganizationService";

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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
