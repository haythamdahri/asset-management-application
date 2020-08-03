import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SettingService from "../../services/SettingService";

export default () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [setting, setSetting] = useState({});

  document.title = "Paramétrage de l'application";

  useEffect(() => {
    setIsLoading(true);
    setIsUnAuthorized(false);
    setIsError(false);
    SettingService.getApplicationSetting()
      .then((setting) => {
        setSetting(setting);
        setIsLoading(false);
        setIsUnAuthorized(false);
        setIsError(false);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setIsLoading(false);
        } else {
          setIsUnAuthorized(false);
          setIsError(true);
        }
        setIsLoading(false);
      });
  }, [retry]);

  return (
    <div className="content-wrapper" style={{ minHeight: "1416.81px" }}>
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Paramétrage</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item" key="LI1">
                  <Link to="/">
                    <FontAwesomeIcon icon="home" /> Acceuil
                  </Link>
                </li>
                <li className="breadcrumb-item active" key="LI2">
                  Paramétrage de l'application
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
            <div className="col-12">
              {/** LOADING */}
              {isLoading && (
                <div className="small-box">
                  <div className="overlay">
                    <i className="fas fa-2x fa-sync-alt fa-spin" />
                  </div>
                </div>
              )}

              {/** UNAUTHORIZED */}
              {isUnAuthorized && (
                <div className="alert alert-warning text-center display-3">
                  <FontAwesomeIcon icon="exclamation-circle" /> Vous n'êtes pas
                  autorisé!
                </div>
              )}

              {/** ERROR */}
              {isError && (
                <div className="alert alert-warning text-center display-3">
                  <FontAwesomeIcon icon="exclamation-circle" /> Une erreur est
                  survenue, veuillez ressayer
                  <button
                    onClick={(e) => setRetry(!retry)}
                    className="btn btn-info btn-sm"
                  >
                    <FontAwesomeIcon icon="sync" /> Ressayer
                  </button>
                </div>
              )}

              {/** SETTING DATA */}
              {!isUnAuthorized && !isError && !isLoading && (
                <>
                  <div className="callout callout-info">
                    <h5>
                      <i className="fas fa-info"></i> Paramétrage:
                    </h5>
                    Paramétrage d'application dynamique
                  </div>

                  <div className="card card-default">
                    <div className="card-header bg-white" style={{borderTop: '2px solid blue'}}>
                      <h3 className="card-title">
                        <i className="fas fa-bullhorn mr-4"></i>
                        Paramétrage courant
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="callout callout-danger">
                        <h5>Options de probabilité d'analyse de risque</h5>
                        <p>
                          {setting?.probabilities?.map((probability, key) => 
                              <>
                               {probability}{key === setting?.probabilities?.length - 1 ? "" : ", "}
                              </>
                          )}
                        </p>
                      </div>
                      <div className="callout callout-info">
                        <h5>I am an info callout!</h5>

                        <p>Follow the steps to continue to payment.</p>
                      </div>
                      <div className="callout callout-warning">
                        <h5>I am a warning callout!</h5>

                        <p>This is a yellow callout.</p>
                      </div>
                      <div className="callout callout-success">
                        <h5>I am a success callout!</h5>

                        <p>This is a green callout.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
