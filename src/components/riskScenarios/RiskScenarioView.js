import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import TypologyService from "../../services/TypologyService";
import Moment from "react-moment";

export default () => {
  const [riskScenarioResponse, setRiskScenarioResponse] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  let history = useHistory();

  // User Id Extraction from URL
  let { typologyId, riskScenarioId } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Des Scénarios Des Risques";
    fetchRiskScenario();
    return () => {
      ref.current = false;
    };
  }, []);

  const fetchRiskScenario = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setError(false);
    setRiskScenarioResponse({});
    try {
      const riskScenario = await TypologyService.getRiskScenario(
        typologyId,
        riskScenarioId
      );
      if (!riskScenario.hasOwnProperty("riskScenario")) {
        setRiskScenarioResponse(null);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      } else {
        setRiskScenarioResponse(riskScenario);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      const status = e?.response?.status || null;
      setIsLoading(false);
      setRiskScenarioResponse({});
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setError(false);
          setRiskScenarioResponse(null);
          break;
        default:
          setError(true);
          setIsUnAuthorized(false);
      }
    }
  };

  const deleteRiskScenario = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer le scénario de risque?",
      text: "Voulez-vous supprimer le scénario de risque?",
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
          await TypologyService.deleteRiskScenario(typologyId, riskScenarioId);
          Swal.fire(
            "Operation éffectuée!",
            "Le scénario de risque à été supprimé avec succés!",
            "success"
          );
          history.push("/riskscenarios");
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
                <div className="ribbon bg-success text-lg">
                  Scénario de risque
                </div>
              </div>
            </div>

            {(error || isUnAuthorized || riskScenarioResponse === null) &&
              !isLoading && (
                <div className="col-10 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {error && "Une erreur est survenue!"}
                      {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                      {riskScenarioResponse === null &&
                        "Aucun scénario de risque n'a été trouvé"}
                      <button
                        onClick={() => fetchRiskScenario()}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>
                    </h2>
                  </div>
                </div>
              )}

            {isLoading && !error && riskScenarioResponse !== null && (
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
              riskScenarioResponse !== null && (
                <>
                  {/** RISK SCENARIO DATA */}

                  <div className="col-md-12 mx-auto mt-3 mb-3 text-center">
                    <Link
                      to={`/riskscenarios/${riskScenarioResponse?.typologyId}/${riskScenarioResponse?.riskScenario?.id}/edit`}
                    >
                      <button className="btn btn-secondary btn-sm">
                        <FontAwesomeIcon icon="edit" color="white" />
                      </button>
                    </Link>{" "}
                    <button
                      onClick={() => deleteRiskScenario()}
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
                                  riskScenarioResponse?.riskScenario?.status
                                    ? "alert-success"
                                    : "alert-danger"
                                }`}
                              >
                                <h5>
                                  <i className="icon fas fa-ban" /> Statut du
                                  scénario de risque!
                                </h5>
                                Le scénario de risque est{" "}
                                {`${
                                  riskScenarioResponse?.riskScenario?.status
                                    ? "approuvé"
                                    : "rejeté"
                                }`}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <th scope="col">Nom</th>
                            <td>{riskScenarioResponse?.riskScenario?.name}</td>
                          </tr>
                        </thead>
                        <tbody align="center">
                          <tr>
                            <th scope="col">Description</th>
                            <td>
                              {riskScenarioResponse?.riskScenario
                                ?.description &&
                                riskScenarioResponse?.riskScenario?.description
                                  ?.length > 0 && (
                                  <CKEditor
                                    editor={ClassicEditor}
                                    data={
                                      riskScenarioResponse?.riskScenario
                                        ?.description
                                    }
                                    config={{
                                      toolbar: [],
                                      removePlugins: ["Heading", "Link"],
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
                                  riskScenarioResponse?.riskScenario
                                    ?.identificationDate
                                }
                              </Moment>
                            </td>
                          </tr>
                          <tr>
                            <th scope="col">Statut</th>
                            <td>
                              {riskScenarioResponse?.riskScenario
                                ?.classification !== null && (
                                <div className="text-center">
                                  <button
                                    onClick={(event) =>
                                      updateRiskScenarioStatus(
                                        riskScenarioResponse?.typologyId,
                                        riskScenarioResponse?.riskScenario,
                                        !riskScenarioResponse?.riskScenario
                                          ?.status
                                      )
                                    }
                                    className={`w-50 btn btn-${
                                      riskScenarioResponse?.riskScenario?.status
                                        ? "danger"
                                        : "success"
                                    } btn-sm ${isApproving ? "disabled" : ""}`}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        riskScenarioResponse?.riskScenario
                                          ?.status
                                          ? "minus-circle"
                                          : "check-circle"
                                      }
                                      color="white"
                                    />
                                    {riskScenarioResponse?.riskScenario?.status
                                      ? " Rejeter"
                                      : " Approuver"}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th scope="col">Typologie</th>
                            <td>
                              <Link
                                to={`/typologies/view/${riskScenarioResponse?.typologyId}`}
                              >
                                {riskScenarioResponse?.typologyName}
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
