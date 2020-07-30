import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import AssetService from "../../services/AssetService";
import TypologyService from "../../services/TypologyService";
import Moment from "react-moment";
import {
  RISK_TREATEMENT_STRATEGY_TYPE,
  RISK_TYPE,
} from "../../services/ConstantsService";

export default () => {
  const [riskAnalysisResponse, setRiskAnalysisResponse] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  let history = useHistory();

  // User Id Extraction from URL
  let { assetId, riskAnalysisId } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Des Scénarios Des Risques";
    fetchRiskAnalysis();
    return () => {
      ref.current = false;
    };
  }, []);

  const fetchRiskAnalysis = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setError(false);
    setRiskAnalysisResponse({});
    try {
      const riskAnalysisResponse = await AssetService.getRiskAnalysis(
        assetId,
        riskAnalysisId
      );
      if (!riskAnalysisResponse.hasOwnProperty("riskAnalysis")) {
        setRiskAnalysisResponse(null);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      } else {
        setRiskAnalysisResponse(riskAnalysisResponse);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      const status = e?.response?.status || null;
      setIsLoading(false);
      setRiskAnalysisResponse({});
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setError(false);
          setRiskAnalysisResponse(null);
          break;
        default:
          setError(true);
          setIsUnAuthorized(false);
      }
    }
  };

  const deleteRiskAnalysis = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer l'analyse de risque?",
      text: "Voulez-vous supprimer l'analyse de risque?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Non, annuler",
    }).then(async (result) => {
      if (result.value) {
        // Perform User delete
        try {
          setIsDeleting(true);
          await AssetService.deleteRiskAnalysis(assetId, riskAnalysisId);
          Swal.fire(
            "Operation éffectuée!",
            "L'analyse de risque à été supprimée avec succés!",
            "success"
          );
          history.push("/riskanalyzes");
        } catch (err) {
          Swal.fire(
            "Erreur!",
            err?.response?.data?.message ||
              `Une erreur est survenue, veuillez ressayer!`,
            "error"
          );
          setIsDeleting(false);
        }
      }
    });
  };

  const updateRiskAnalysisStatus = async (typologyId, riskAnalysis, status) => {
    // Perform User
    try {
      setIsApproving(true);
      await AssetService.updateAssetRiskAnalysisStatus(
        assetId,
        riskAnalysis?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de l'analyse de risque à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set vulnerability status
      riskAnalysis.status = status;
    } catch (err) {
      Swal.fire(
        "Erreur!",
        err?.response?.message || `Une erreur est survenue, veuillez ressayer!`,
        "error"
      );
    } finally {
      setIsApproving(false);
    }
  };

  const updateThreatStatus = async (typologyId, threat, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await TypologyService.updateThreatStatus(typologyId, threat?.id, status);
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de la menace à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set threat status
      threat.status = status;
    } catch (err) {
      Swal.fire(
        "Erreur!",
        err?.response?.message || `Une erreur est survenue, veuillez ressayer!`,
        "error"
      );
    } finally {
      setIsApproving(false);
    }
  };

  const updateVulnerabilityStatus = async (
    typologyId,
    vulnerability,
    status
  ) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await TypologyService.updateVulnerabilityStatus(
        typologyId,
        vulnerability?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de la vulnérabilité à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set vulnerability status
      vulnerability.status = status;
    } catch (err) {
      Swal.fire(
        "Erreur!",
        err?.response?.message || `Une erreur est survenue, veuillez ressayer!`,
        "error"
      );
    } finally {
      setIsApproving(false);
    }
  };

  const updateRiskScenarioStatus = async (typologyId, riskScenario, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await TypologyService.updateRiskScenarioStatus(
        typologyId,
        riskScenario?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut du scénario de risque à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set risk scenario status
      riskScenario.status = status;
    } catch (err) {
      Swal.fire(
        "Erreur!",
        err?.response?.data?.message ||
          `Une erreur est survenue, veuillez ressayer!`,
        "error"
      );
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="content-wrapper bg-light pb-5 mb-5">
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Groupe</div>
              </div>
            </div>

            {(error || isUnAuthorized || riskAnalysisResponse === null) &&
              !isLoading && (
                <div className="col-10 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {error && "Une erreur est survenue!"}
                      {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                      {riskAnalysisResponse === null &&
                        "Aucune analyse de risque n'a été trouvée"}
                      <button
                        onClick={() => fetchRiskAnalysis()}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>
                    </h2>
                  </div>
                </div>
              )}

            {isLoading && !error && riskAnalysisResponse !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** DELTING PROGRESS */}
            {isDeleting && (
              <div className="col-12 mt-2 mb-3">
                <div className="overlay text-center">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {!isLoading &&
              !error &&
              !isUnAuthorized &&
              riskAnalysisResponse !== null && (
                <>
                  {/** DATA */}

                  <div
                    className="col-md-12 bg-white mx-auto mt-3 mb-3"
                    style={{ borderTop: "blue solid 2px" }}
                  >
                    <div className="card-header d-flex p-0">
                      <ul className="nav nav-tabs nav-pills with-arrow lined flex-column flex-sm-row text-center col-12">
                        <li className="nav-item flex-sm-fill">
                          <a
                            className="nav-link active"
                            href="#riskAnalysis"
                            data-toggle="tab"
                          >
                            <i className="nav-icon fas fa-i-cursor" /> Analyse
                            de risque
                          </a>
                        </li>
                        <li className="nav-item flex-sm-fill">
                          <a
                            className="nav-link"
                            href="#threats"
                            data-toggle="tab"
                          >
                            <i className="nav-icon fas fa-fingerprint" /> Menace
                          </a>
                        </li>
                        <li className="nav-item flex-sm-fill">
                          <a
                            className="nav-link"
                            href="#vulnerabilities"
                            data-toggle="tab"
                          >
                            <i className="nav-icon fas fa-lock-open" />{" "}
                            Vulnérabilité
                          </a>
                        </li>
                        <li className="nav-item flex-sm-fill">
                          <a
                            className="nav-link"
                            href="#riskScenarios"
                            data-toggle="tab"
                          >
                            <i className="nav-icon fas fa-object-ungroup" />{" "}
                            Scénarios des risque
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/** TABS */}
                    <div className="card-body">
                      <div className="tab-content">
                        <div className="tab-pane active" id="riskAnalysis">
                          <div className="col-md-12 mx-auto mt-3 mb-3 text-center">
                            <Link
                              to={`/riskanalyzes/${riskAnalysisResponse?.assetId}/${riskAnalysisResponse?.riskAnalysis?.id}/edit`}
                            >
                              <button className="btn btn-secondary btn-sm">
                                <FontAwesomeIcon icon="edit" color="white" />
                              </button>
                            </Link>{" "}
                            <button
                              onClick={() => deleteRiskAnalysis()}
                              className="btn btn-danger btn-sm"
                              disabled={isDeleting ? "disabled" : ""}
                            >
                              <FontAwesomeIcon icon="trash-alt" color="white" />
                            </button>
                          </div>
                          <div
                            className="col-md-12 bg-white mx-auto mt-3 mb-3"
                            style={{ borderTop: "blue solid 2px" }}
                          >
                            <div className="table table-responsive float-left">
                              <table className="table table-striped">
                                <thead align="center">
                                  <tr>
                                    <td colSpan={2}>
                                      <div
                                        className={`shadow shadow-sm alert ${
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.status
                                            ? "alert-success"
                                            : "alert-danger"
                                        }`}
                                      >
                                        <h5>
                                          <i className="icon fas fa-ban" />{" "}
                                          Statut de l'analyse de risque!
                                        </h5>
                                        L'analyse de risque est{" "}
                                        {`${
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.status
                                            ? "approuvée"
                                            : "rejetée"
                                        }`}
                                      </div>
                                    </td>
                                  </tr>
                                </thead>
                                <tbody align="center">
                                  <tr>
                                    <th scope="col">Probabilité</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.probability
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Impact financier</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.financialImpact
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Impact operationnel</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.operationalImpact
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Impact reputationnel</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.reputationalImpact
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Impact</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.impact
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Exposition</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.exposition
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Analyse de risque</th>
                                    <td>
                                      {
                                        RISK_TYPE.fr[
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.riskAnalysis
                                        ]
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">
                                      Stratégie de traitement de risque
                                    </th>
                                    <td>
                                      {
                                        RISK_TREATEMENT_STRATEGY_TYPE.fr[
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.riskTreatmentStrategy
                                        ]
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">
                                      Plan de traitement de risque
                                    </th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.riskTreatmentPlan
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Impact financier cible</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.targetFinancialImpact
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">
                                      Impact operationnel cible
                                    </th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.targetOperationalImpact
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">
                                      Impact réputationnel cible
                                    </th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.targetReputationalImpact
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Probabilité cible</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.targetProbability
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">
                                      Risque résiduel acceptable
                                    </th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.acceptableResidualRisk
                                      }
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Statut</th>
                                    <td>
                                      <div className="text-center">
                                        <button
                                          onClick={(event) =>
                                            updateRiskAnalysisStatus(
                                              riskAnalysisResponse?.assetId,
                                              riskAnalysisResponse?.riskAnalysis,
                                              !riskAnalysisResponse
                                                ?.riskAnalysis?.status
                                            )
                                          }
                                          className={`w-50 btn btn-${
                                            riskAnalysisResponse?.riskAnalysis
                                              ?.status
                                              ? "danger"
                                              : "success"
                                          } btn-sm ${
                                            isApproving ? "disabled" : ""
                                          }`}
                                        >
                                          <FontAwesomeIcon
                                            icon={
                                              riskAnalysisResponse?.riskAnalysis
                                                ?.status
                                                ? "minus-circle"
                                                : "check-circle"
                                            }
                                            color="white"
                                          />
                                          {riskAnalysisResponse?.riskAnalysis
                                            ?.status
                                            ? " Rejeter"
                                            : " Approuver"}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Actif</th>
                                    <td>
                                      <Link
                                        to={`/assets/view/${riskAnalysisResponse?.assetId}`}
                                      >
                                        {riskAnalysisResponse?.assetName}
                                      </Link>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div className="tab-pane" id="threats">
                          <div
                            className="col-md-12 bg-white mx-auto mt-3 mb-3"
                            style={{ borderTop: "blue solid 2px" }}
                          >
                            <div className="table table-responsive float-left">
                              <table className="table table-striped">
                                <thead align="center">
                                  <tr>
                                    <td colSpan={2}>
                                      <div
                                        className={`shadow shadow-sm alert ${
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.threat?.status
                                            ? "alert-success"
                                            : "alert-danger"
                                        }`}
                                      >
                                        <h5>
                                          <i className="icon fas fa-ban" />{" "}
                                          Statut de la menace!
                                        </h5>
                                        La menace est{" "}
                                        {`${
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.threat?.status
                                            ? "approuvée"
                                            : "rejetée"
                                        }`}
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Nom</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.threat?.name
                                      }
                                    </td>
                                  </tr>
                                </thead>
                                <tbody align="center">
                                  <tr>
                                    <th scope="col">Description</th>
                                    <td>
                                      {riskAnalysisResponse?.riskAnalysis
                                        ?.threat?.description &&
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.threat?.description?.length > 0 && (
                                          <CKEditor
                                            editor={ClassicEditor}
                                            data={
                                              riskAnalysisResponse?.riskAnalysis
                                                ?.threat?.description
                                            }
                                            config={{
                                              toolbar: [],
                                              removePlugins: [
                                                "Heading",
                                                "Link",
                                              ],
                                              isReadOnly: true,
                                            }}
                                            disabled={true}
                                          />
                                        )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Date d'identification</th>
                                    <td>
                                      <Moment format="YYYY/MM/DD HH:mm:ss">
                                        {
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.threat?.identificationDate
                                        }
                                      </Moment>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Statut</th>
                                    <td>
                                      <div className="text-center">
                                        {riskAnalysisResponse?.riskAnalysis
                                          ?.threat?.status
                                          ? "APPROUVÉ"
                                          : "REJETÉ"}
                                        {"  "}
                                        <FontAwesomeIcon
                                          icon={
                                            riskAnalysisResponse?.riskAnalysis
                                              ?.threat?.status
                                              ? "minus-circle"
                                              : "check-circle"
                                          }
                                          color={
                                            riskAnalysisResponse?.riskAnalysis
                                              ?.threat?.status
                                              ? "green"
                                              : "red"
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div className="tab-pane" id="vulnerabilities">
                          <div
                            className="col-md-12 bg-white mx-auto mt-3 mb-3"
                            style={{ borderTop: "blue solid 2px" }}
                          >
                            <div className="table table-responsive float-left">
                              <table className="table table-striped">
                                <thead align="center">
                                  <tr>
                                    <td colSpan={2}>
                                      <div
                                        className={`shadow shadow-sm alert ${
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.threat?.status
                                            ? "alert-success"
                                            : "alert-danger"
                                        }`}
                                      >
                                        <h5>
                                          <i className="icon fas fa-ban" />{" "}
                                          Statut de la vulnérabilité!
                                        </h5>
                                        La vulnérabilité est{" "}
                                        {`${
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.threat?.status
                                            ? "approuvée"
                                            : "rejetée"
                                        }`}
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Nom</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.vulnerability?.name
                                      }
                                    </td>
                                  </tr>
                                </thead>
                                <tbody align="center">
                                  <tr>
                                    <th scope="col">Description</th>
                                    <td>
                                      {riskAnalysisResponse?.riskAnalysis
                                        ?.vulnerability?.description &&
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.threat?.description?.length > 0 && (
                                          <CKEditor
                                            editor={ClassicEditor}
                                            data={
                                              riskAnalysisResponse?.riskAnalysis
                                                ?.vulnerability?.description
                                            }
                                            config={{
                                              toolbar: [],
                                              removePlugins: [
                                                "Heading",
                                                "Link",
                                              ],
                                              isReadOnly: true,
                                            }}
                                            disabled={true}
                                          />
                                        )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Date d'identification</th>
                                    <td>
                                      <Moment format="YYYY/MM/DD HH:mm:ss">
                                        {
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.vulnerability?.identificationDate
                                        }
                                      </Moment>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Statut</th>
                                    <td>
                                      <div className="text-center">
                                        {riskAnalysisResponse?.riskAnalysis
                                          ?.vulnerability?.status
                                          ? "APPROUVÉ"
                                          : "REJETÉ"}
                                        {"  "}
                                        <FontAwesomeIcon
                                          icon={
                                            riskAnalysisResponse?.riskAnalysis
                                              ?.vulnerability?.status
                                              ? "minus-circle"
                                              : "check-circle"
                                          }
                                          color={
                                            riskAnalysisResponse?.riskAnalysis
                                              ?.vulnerability?.status
                                              ? "green"
                                              : "red"
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div className="tab-pane" id="riskScenarios">
                          <div
                            className="col-md-12 bg-white mx-auto mt-3 mb-3"
                            style={{ borderTop: "blue solid 2px" }}
                          >
                            <div className="table table-responsive float-left">
                              <table className="table table-striped">
                                <thead align="center">
                                  <tr>
                                    <td colSpan={2}>
                                      <div
                                        className={`shadow shadow-sm alert ${
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.riskScenario?.status
                                            ? "alert-success"
                                            : "alert-danger"
                                        }`}
                                      >
                                        <h5>
                                          <i className="icon fas fa-ban" />{" "}
                                          Statut du scénario de risque!
                                        </h5>
                                        Le scénario de risque est{" "}
                                        {`${
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.riskScenario?.status
                                            ? "approuvé"
                                            : "rejeté"
                                        }`}
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Nom</th>
                                    <td>
                                      {
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.riskScenario?.name
                                      }
                                    </td>
                                  </tr>
                                </thead>
                                <tbody align="center">
                                  <tr>
                                    <th scope="col">Description</th>
                                    <td>
                                      {riskAnalysisResponse?.riskAnalysis
                                        ?.riskScenario?.description &&
                                        riskAnalysisResponse?.riskAnalysis
                                          ?.riskScenario?.description?.length >
                                          0 && (
                                          <CKEditor
                                            editor={ClassicEditor}
                                            data={
                                              riskAnalysisResponse?.riskAnalysis
                                                ?.riskScenario?.description
                                            }
                                            config={{
                                              toolbar: [],
                                              removePlugins: [
                                                "Heading",
                                                "Link",
                                              ],
                                              isReadOnly: true,
                                            }}
                                            disabled={true}
                                          />
                                        )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Date d'identification</th>
                                    <td>
                                      <Moment format="YYYY/MM/DD HH:mm:ss">
                                        {
                                          riskAnalysisResponse?.riskAnalysis
                                            ?.riskScenario?.identificationDate
                                        }
                                      </Moment>
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="col">Statut</th>
                                    <td>
                                      <div className="text-center">
                                        {riskAnalysisResponse?.riskAnalysis
                                          ?.riskScenario?.status
                                          ? "APPROUVÉ"
                                          : "REJETÉ"}
                                        {"  "}
                                        <FontAwesomeIcon
                                          icon={
                                            riskAnalysisResponse?.riskAnalysis
                                              ?.riskScenario?.status
                                              ? "minus-circle"
                                              : "check-circle"
                                          }
                                          color={
                                            riskAnalysisResponse?.riskAnalysis
                                              ?.riskScenario?.status
                                              ? "green"
                                              : "red"
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
      </section>
    </div>
  );
};
