import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import TypologyService from "../../services/TypologyService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import ThreatsTable from "../threats/ThreatsTable";
import RiskScenariosTable from "../riskScenarios/RiskScenariosTable";
import VulnerabilitiesTable from "../vulnerabilities/VulnerabilitiesTable";

export default () => {
  const [typology, setTypology] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  let history = useHistory();
  const aborderController = new AbortController();

  // User Id Extraction from URL
  let { id } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Des Typologies Des Actifs";
    fetchTypology();
    return () => {
      ref.current = false;
    };
  }, [id]);

  useEffect(() => {
    if (typology !== null && typology.hasOwnProperty("id") && typology !== "") {
      // Associate js files
      const script = document.createElement("script");
      script.src = "/js/content.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [typology]);

  const fetchTypology = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setIsError(false);
    setTypology({});
    try {
      const typology = await TypologyService.getTypology(id);
      if (!typology.hasOwnProperty("id") || typology === "") {
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
        setTypology(null);
      } else {
        setTypology(typology);
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      const status = e?.response?.status || null;
      setIsLoading(false);
      setTypology({});
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setIsError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setIsError(false);
          setTypology(null);
          break;
        default:
          setIsError(true);
          setIsUnAuthorized(false);
      }
    }
    return () => {
      aborderController.abort();
    };
  };

  const deleteTypology = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer la typologies des actifs?",
      text: "Voulez-vous supprimer la typologies des actifs?",
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
          await TypologyService.deleteTypology(id);
          Swal.fire(
            "Operation éffectuée!",
            "La typologie des actifs à été suppriméa avec succés!",
            "success"
          );
          history.push("/typologies");
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

  return (
    <div
      className="content-wrapper bg-light pb-5 mb-5"
      style={{ marginBottom: "100rem" }}
    >
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Typologie</div>
              </div>
            </div>

            {(isError || isUnAuthorized || typology === null) && !isLoading && (
              <div className="col-10 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {isError && "Une erreur est survenue!"}
                    {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                    {typology === null && "Aucune typologie n'a été trouvé"}
                    <button
                      onClick={() => fetchTypology()}
                      className="btn btn-warning font-weight-bold ml-2"
                    >
                      <FontAwesomeIcon icon="sync" /> Ressayer
                    </button>
                  </h2>
                </div>
              </div>
            )}

            {isLoading && !isError && typology !== null && (
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

            {!isLoading && !isError && !isUnAuthorized && typology !== null && (
              <>
                <div className="col-12 text-center mt-2">
                  <Link to={`/typologies/${typology?.id}/edit`}>
                    <button className="btn btn-secondary btn-sm">
                      <FontAwesomeIcon icon="edit" color="white" />
                    </button>
                  </Link>{" "}
                  <button
                    onClick={() => deleteTypology()}
                    className="btn btn-danger btn-sm"
                    disabled={isDeleting ? "disabled" : ""}
                  >
                    <FontAwesomeIcon icon="trash-alt" color="white" />
                  </button>
                </div>

                {/** typology DATA */}
                <div
                  className="col-md-12 bg-white mx-auto mt-3 mb-3"
                  style={{ borderTop: "blue solid 2px" }}
                >
                  <div className="card-header d-flex p-0">
                    <ul className="nav nav-tabs nav-pills with-arrow lined flex-column flex-sm-row text-center col-12">
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link active"
                          href="#typology"
                          data-toggle="tab"
                        >
                          <i className="nav-icon fas fa-i-cursor" /> Typologie
                        </a>
                      </li>
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link"
                          href="#threats"
                          data-toggle="tab"
                        >
                          <i className="nav-icon fas fa-fingerprint" /> Menaces
                        </a>
                      </li>
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link"
                          href="#vulnerabilities"
                          data-toggle="tab"
                        >
                          <i className="nav-icon fas fa-lock-open" />{" "}
                          Vulnérabilités
                        </a>
                      </li>
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link"
                          href="#asssets"
                          data-toggle="tab"
                        >
                          <i className="nav-icon fas fa-object-ungroup" />{" "}
                          Scénarios des risques
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="card-body">
                    <div className="tab-content">
                      <div className="tab-pane active" id="typology">
                        <div className="table table-responsive float-left">
                          <table className="table table-striped">
                            <thead align="center">
                              <tr>
                                <th scope="col">Nom</th>
                                <td>{typology?.name}</td>
                              </tr>
                            </thead>
                            <tbody align="center">
                              <tr>
                                <th scope="col">Description</th>
                                <td>
                                  <CKEditor
                                    editor={ClassicEditor}
                                    data={typology?.description}
                                    config={{
                                      toolbar: [],
                                      removePlugins: ["Heading", "Link"],
                                      isReadOnly: true,
                                    }}
                                    disabled={true}
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* /.tab-pane */}
                      <div className="tab-pane" id="threats">
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h3 className="card-title">
                                Menaces du {typology?.name}
                              </h3>
                            </div>
                            {/* /.card-header */}
                            <div className="card-body">
                              <ThreatsTable typology={typology} />
                            </div>
                            {/* /.card-body */}
                          </div>
                        </div>
                      </div>

                      {/* /.tab-pane */}
                      <div className="tab-pane" id="vulnerabilities">
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h3 className="card-title">
                                Scénarios de risque du {typology?.name}
                              </h3>
                            </div>
                            {/* /.card-header */}
                            <div className="card-body">
                              <VulnerabilitiesTable typology={typology} />
                            </div>
                            {/* /.card-body */}
                          </div>
                        </div>
                      </div>

                      {/* /.tab-pane */}
                      <div className="tab-pane" id="asssets">
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h3 className="card-title">
                                Scénarios de risque du {typology?.name}
                              </h3>
                            </div>
                            {/* /.card-header */}
                            <div className="card-body">
                              <RiskScenariosTable typology={typology} />
                            </div>
                            {/* /.card-body */}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /.tab-content */}
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
