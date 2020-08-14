import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SettingService from "../../services/SettingService";
import Moment from "react-moment";

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
                    className="btn btn-white btn-sm"
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
                    <div
                      className="card-header bg-white"
                      style={{ borderTop: "2px solid blue" }}
                    >
                      <h3 className="card-title">
                        <i className="fas fa-bullhorn mr-4"></i>
                          Paramétrage courant | <b>Dernière mise à jour:</b> <Moment format="YYYY/MM/DD HH:mm:ss">{setting.identificationDate}</Moment>
                      </h3>
                      <b className="float-right" style={{ cursor: "pointer" }}>
                        <Link to="/settings/edit">
                          <FontAwesomeIcon icon="edit" />
                        </Link>
                      </b>
                    </div>
                    <div className="card-body">
                      <div className="callout callout-danger">
                        <h5>Options de probabilité d'analyse de risque</h5>
                        <p>
                          {setting?.probabilities?.map((probability, key) => (
                            <label key={key}>
                              {probability}
                              {key === setting?.probabilities?.length - 1
                                ? ""
                                : "-"}
                            </label>
                          ))}
                        </p>
                      </div>
                      <div className="callout callout-info">
                        <h5>Options d'impact financier d'analyse de risque</h5>
                        <p>
                          {setting?.financialImpacts?.map(
                            (financialImpact, key) => (
                              <label key={key}>
                                {financialImpact}
                                {key === setting?.financialImpacts?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>
                      <div className="callout callout-warning">
                        <h5>
                          Options d'impact operationnel d'analyse de risque
                        </h5>

                        <p>
                          {setting?.operationalImpacts?.map(
                            (operationalImpact, key) => (
                              <label key={key}>
                                {operationalImpact}
                                {key === setting?.operationalImpacts?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>
                      <div className="callout callout-success">
                        <h5>
                          Options d'impact reputationnel d'analyse de risque
                        </h5>

                        <p>
                          {setting?.reputationalImpacts?.map(
                            (reputationalImpact, key) => (
                              <label key={key}>
                                {reputationalImpact}
                                {key ===
                                setting?.reputationalImpacts?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>
                      <div className="callout callout-danger">
                        <h5>
                          Options d'impact financier cible d'analyse de risque
                        </h5>
                        <p>
                          {setting?.targetFinancialImpacts?.map(
                            (targetFinancialImpact, key) => (
                              <label key={key}>
                                {targetFinancialImpact}
                                {key ===
                                setting?.targetFinancialImpacts?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>
                      <div className="callout callout-info">
                        <h5>
                          Options d'impact operationnel cible d'analyse de
                          risque
                        </h5>
                        <p>
                          {setting?.targetOperationalImpacts?.map(
                            (targetOperationalImpact, key) => (
                              <label key={key}>
                                {targetOperationalImpact}
                                {key ===
                                setting?.targetOperationalImpacts?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>
                      <div className="callout callout-warning">
                        <h5>
                          Options d'impact reputationnel cible d'analyse de
                          risque
                        </h5>

                        <p>
                          {setting?.targetReputationalImpacts?.map(
                            (targetReputationalImpact, key) => (
                              <label key={key}>
                                {targetReputationalImpact}
                                {key ===
                                setting?.targetReputationalImpacts?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>
                      <div className="callout callout-success">
                        <h5>
                          Options de probabilité cible d'analyse de risque
                        </h5>

                        <p>
                          {setting?.targetProbabilities?.map(
                            (targetProbability, key) => (
                              <label key={key}>
                                {targetProbability}
                                {key ===
                                setting?.targetProbabilities?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>
                      <div className="callout callout-danger">
                        <h5>
                          Options du risque risiduel cible d'analyse de risque
                        </h5>
                        <p>
                          {setting?.acceptableResidualRisks?.map(
                            (acceptableResidualRisk, key) => (
                              <label key={key}>
                                {acceptableResidualRisk}
                                {key ===
                                setting?.acceptableResidualRisks?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>

                      <hr />

                      <div className="callout callout-info">
                        <h5>Options de confidentialité</h5>
                        <p>
                          {setting?.confidentialities?.map(
                            (confidentiality, key) => (
                              <label key={key}>
                                {confidentiality}
                                {key === setting?.confidentialities?.length - 1
                                  ? ""
                                  : "-"}
                              </label>
                            )
                          )}
                        </p>
                      </div>
                      <div className="callout callout-warning">
                        <h5>Options de disponibilité</h5>

                        <p>
                          {setting?.availabilities?.map((availability, key) => (
                            <label key={key}>
                              {availability}
                              {key === setting?.availabilities?.length - 1
                                ? ""
                                : "-"}
                            </label>
                          ))}
                        </p>
                      </div>
                      <div className="callout callout-success">
                        <h5>Options d'intégrité</h5>

                        <p>
                          {setting?.integrities?.map((integrity, key) => (
                            <label key={key}>
                              {integrity}
                              {key === setting?.integrities?.length - 1
                                ? ""
                                : "-"}
                            </label>
                          ))}
                        </p>
                      </div>
                      <div className="callout callout-danger">
                        <h5>Options de traçabilité</h5>
                        <p>
                          {setting?.traceabilities?.map((traceability, key) => (
                            <label key={key}>
                              {traceability}
                              {key === setting?.traceabilities?.length - 1
                                ? ""
                                : "-"}
                            </label>
                          ))}
                        </p>
                      </div>
                      <div className="callout callout-danger">
                        <h5>Attentatives maximales sans captcha</h5>
                        <p>
                            <label >
                              {setting?.maxAttemptsWithoutCaptcha}
                            </label>
                        </p>
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
