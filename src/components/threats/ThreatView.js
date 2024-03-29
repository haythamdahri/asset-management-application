import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import TypologyService from "../../services/TypologyService";
import Moment from "react-moment";

export default () => {
  const [threatResponse, setThreatResponse] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  let history = useHistory();

  // User Id Extraction from URL
  let { typologyId, threatId } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    console.log(typologyId);
    console.log(threatId);
    document.title = "Gestion Des Menaces";
    fetchThreat();
    return () => {
      ref.current = false;
    };
  }, []);

  const fetchThreat = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setError(false);
    setThreatResponse({});
    try {
      const threat = await TypologyService.getThreat(typologyId, threatId);
      if (!threat.hasOwnProperty("threat")) {
        setThreatResponse(null);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      } else {
        setThreatResponse(threat);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      const status = e?.response?.status || null;
      setIsLoading(false);
      setThreatResponse({});
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setError(false);
          setThreatResponse(null);
          break;
        default:
          setError(true);
          setIsUnAuthorized(false);
      }
    }
  };

  const deleteThreat = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer la menaces?",
      text: "Voulez-vous supprimer la menace?",
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
          await TypologyService.deleteThreat(typologyId, threatId);
          Swal.fire(
            "Operation éffectuée!",
            "La menace à été supprimée avec succés!",
            "success"
          );
          history.push("/threats");
        } catch (err) {
          Swal.fire(
            "Erreur!",
            err?.response?.message ||
              `Une erreur est survenue, veuillez ressayer!`,
            "error"
          );
          setIsDeleting(false);
        }
      }
    });
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

  return (
    <div className="content-wrapper bg-light pb-5 mb-5">
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Menaces</div>
              </div>
            </div>

            {(error || isUnAuthorized || threatResponse === null) &&
              !isLoading && (
                <div className="col-10 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {error && "Une erreur est survenue!"}
                      {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                      {threatResponse === null &&
                        "Aucune menace n'a été trouvée"}
                      <button
                        onClick={() => fetchThreat()}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>
                    </h2>
                  </div>
                </div>
              )}

            {isLoading && !error && threatResponse !== null && (
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
              threatResponse !== null && (
                <>
                  {/** THREAT DATA */}

                  <div className="col-md-12 mx-auto mt-3 mb-3 text-center">
                    <Link
                      to={`/threats/${threatResponse?.typologyId}/${threatResponse?.threat?.id}/edit`}
                    >
                      <button className="btn btn-secondary btn-sm">
                        <FontAwesomeIcon icon="edit" color="white" />
                      </button>
                    </Link>{" "}
                    <button
                      onClick={() => deleteThreat()}
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
                                  threatResponse?.threat?.status
                                    ? "alert-success"
                                    : "alert-danger"
                                }`}
                              >
                                <h5>
                                  <i className="icon fas fa-ban" /> Statut de la
                                  menace!
                                </h5>
                                La menace est{" "}
                                {`${
                                  threatResponse?.threat?.status
                                    ? "approuvée"
                                    : "rejetée"
                                }`}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <th scope="col">Nom</th>
                            <td>{threatResponse?.threat?.name}</td>
                          </tr>
                        </thead>
                        <tbody align="center">
                          <tr>
                            <th scope="col">Description</th>
                            <td>
                              {threatResponse?.threat?.description &&
                                threatResponse?.threat?.description?.length >
                                  0 && (
                                  <CKEditor
                                    editor={ClassicEditor}
                                    data={threatResponse?.threat?.description}
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
                                {threatResponse?.threat?.identificationDate}
                              </Moment>
                            </td>
                          </tr>
                          <tr>
                            <th scope="col">Statut</th>
                            <td>
                              {threatResponse?.threat?.classification !==
                                null && (
                                <div className="text-center">
                                  <button
                                    onClick={(event) =>
                                      updateThreatStatus(
                                        threatResponse?.typologyId,
                                        threatResponse?.threat,
                                        !threatResponse?.threat?.status
                                      )
                                    }
                                    className={`w-50 btn btn-${
                                      threatResponse?.threat?.status
                                        ? "danger"
                                        : "success"
                                    } btn-sm ${isApproving ? "disabled" : ""}`}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        threatResponse?.threat?.status
                                          ? "minus-circle"
                                          : "check-circle"
                                      }
                                      color="white"
                                    />
                                    {threatResponse?.threat?.status
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
                                to={`/typologies/view/${threatResponse?.typologyId}`}
                              >
                                {threatResponse?.typologyName}
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
