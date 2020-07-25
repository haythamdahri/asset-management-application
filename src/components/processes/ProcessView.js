import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import ProcessService from "../../services/ProcessService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { SRLWrapper } from "simple-react-lightbox";

export default () => {
  const [process, setProcess] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assetsMore, setAssetsMore] = useState({
    expanded: false,
    itemsCount: 5,
  });
  let history = useHistory();
  const aborderController = new AbortController();

  // User Id Extraction from URL
  let { id } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Des Processes";
    fetchProcess();
    return () => {
      ref.current = false;
    };
  }, []);

  const fetchProcess = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setIsError(false);
    setProcess({});
    try {
      const process = await ProcessService.getProcess(id);
      if (!process.hasOwnProperty("id")) {
        setProcess(null);
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
      } else {
        setProcess(process);
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      const status = e?.response?.status || null;
      setIsLoading(false);
      setProcess({});
      console.log(status);
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setIsError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setIsError(false);
          setProcess(null);
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

  const deleteProcess = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer le processus?",
      text: "Voulez-vous supprimer le processus?",
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
          await ProcessService.deleteProcess(id);
          Swal.fire(
            "Operation éffectuée!",
            "Le processus à été supprimé avec succés!",
            "success"
          );
          history.push("/processes");
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

  const updateProcessStatus = async (process, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await ProcessService.updateProcessStatus(process?.id, status);
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de la classification à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set process status
      process.status = status;
      window.scrollTo(0, 0);
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

  const updateClassificationStatus = async (process, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await ProcessService.updateProcessClassificationStatus(
        process?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut du processus à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set process status
      process.classification.status = status;
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
                <div className="ribbon bg-success text-lg">Processus</div>
              </div>
            </div>

            {(isError || isUnAuthorized || process === null) && !isLoading && (
              <div className="col-10 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {isError && "Une erreur est survenue!"}
                    {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                    {process === null && "Aucun processus n'a été trouvé"}
                    <button
                      onClick={() => fetchProcess()}
                      className="btn btn-warning font-weight-bold ml-2"
                    >
                      <FontAwesomeIcon icon="sync" /> Ressayer
                    </button>
                  </h2>
                </div>
              </div>
            )}

            {isLoading && !isError && process !== null && (
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

            {!isLoading && !isError && !isUnAuthorized && process !== null && (
              <>
                <div className="col-12 text-center mt-2">
                  <Link to={`/processes/${process.id}/edit`}>
                    <button className="btn btn-secondary btn-sm">
                      <FontAwesomeIcon icon="edit" color="white" />
                    </button>
                  </Link>{" "}
                  <button
                    onClick={() => deleteProcess()}
                    className="btn btn-danger btn-sm"
                    disabled={isDeleting ? "disabled" : ""}
                  >
                    <FontAwesomeIcon icon="trash-alt" color="white" />
                  </button>
                </div>

                {/** PROCESS DATA */}
                <div
                  className="col-md-12 bg-white mx-auto mt-3 mb-3"
                  style={{ borderTop: "blue solid 2px" }}
                >
                  <div className="card-header d-flex p-0">
                    <ul className="nav nav-tabs nav-pills with-arrow lined flex-column flex-sm-row text-center col-12">
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link active"
                          href="#processes"
                          data-toggle="tab"
                        >
                          Processus
                        </a>
                      </li>
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link"
                          href="#classification"
                          data-toggle="tab"
                        >
                          Classification
                        </a>
                      </li>
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link"
                          href="#asssets"
                          data-toggle="tab"
                        >
                          Actifs
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="card-body">
                    <div className="tab-content">
                      <div className="tab-pane active" id="processes">
                        <div className="table table-responsive float-left">
                          <table className="table table-striped">
                            <thead align="center">
                              <tr>
                                <th scope="col">Nom</th>
                                <td>{process?.name}</td>
                              </tr>
                            </thead>
                            <tbody align="center">
                              <tr>
                                <th scope="col">Description</th>
                                <td>{process?.description}</td>
                              </tr>
                              <tr>
                                <th scope="col">Processus Parent</th>
                                <td>{process?.parentProcess}</td>
                              </tr>
                              <tr>
                                <th scope="col">Organisme</th>
                                <td>
                                  <Link
                                    to={`/organizations/view/${process?.organization?.id}`}
                                  >
                                    {process?.organization?.name}
                                  </Link>
                                </td>
                              </tr>
                              <tr>
                                <th scope="col">Statut</th>
                                <td>
                                  {process?.status ? (
                                    <>
                                      <FontAwesomeIcon
                                        icon="check-circle"
                                        color="green"
                                      />{" "}
                                      APPROUVÉ
                                    </>
                                  ) : (
                                    <>
                                      <FontAwesomeIcon
                                        icon="times-circle"
                                        color="red"
                                      />{" "}
                                      NON APPROUVÉ
                                    </>
                                  )}
                                  <button
                                    onClick={(event) =>
                                      updateProcessStatus(
                                        process,
                                        !process?.status
                                      )
                                    }
                                    className={`ml-2 btn btn-${
                                      process?.status ? "danger" : "success"
                                    } btn-sm ${isApproving ? "disabled" : ""}`}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        process.status
                                          ? "minus-circle"
                                          : "check-circle"
                                      }
                                      color="white"
                                    />
                                    {process?.status
                                      ? " Rejecter"
                                      : " Approuver"}
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <th scope="col">Description</th>
                                <td>
                                  {process?.description &&
                                    process?.description?.length > 0 && (
                                      <CKEditor
                                        editor={ClassicEditor}
                                        data={process?.description || ""}
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
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* /.tab-pane */}
                      <div className="tab-pane" id="classification">
                        <div className="col-12">
                          <div className={`shadow shadow-sm alert ${process?.classification?.status ? 'alert-success' : 'alert-danger'}`}>
                            <h5>
                              <i className="icon fas fa-ban" /> Statut de la classification!
                            </h5>
                            La classification du processus est {`${process?.classification?.status ? 'approuvé' : 'rejeté'}`}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="callout callout-danger">
                            <h5>Confidentialité</h5>
                            <p>
                              {process?.classification?.confidentiality || 0}
                            </p>
                          </div>
                          <div className="callout callout-info">
                            <h5>Disponibilité</h5>
                            <p>{process?.classification?.availability || 0}</p>
                          </div>
                          <div className="callout callout-warning">
                            <h5>Intégrité</h5>
                            <p>{process?.classification?.integrity || 0}</p>
                          </div>
                          <div className="callout callout-success">
                            <h5>Traçabilité</h5>
                            <p>{process?.classification?.traceability || 0}</p>
                          </div>
                          <div className="callout callout-primary">
                            <h5>Score</h5>
                            <p>{process?.classification?.score || 0}</p>
                          </div>
                          <div className="callout callout-info">
                            <h5>Date d'identification</h5>
                            <p>
                              {process?.classification?.identificationDate}
                            </p>
                          </div>
                          {process?.classification !== null && (
                            <div className="text-center">
                              <button
                                onClick={(event) =>
                                  updateClassificationStatus(
                                    process,
                                    !process?.classification?.status
                                  )
                                }
                                className={`w-50 btn btn-${
                                  process?.classification?.status
                                    ? "danger"
                                    : "success"
                                } btn-sm ${isApproving ? "disabled" : ""}`}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    process?.classification?.status
                                      ? "minus-circle"
                                      : "check-circle"
                                  }
                                  color="white"
                                />
                                {process?.classification?.status
                                  ? " Rejecter"
                                  : " Approuver"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/** Assets */}
                      <div className="tab-pane" id="asssets">
                        <div className="col-12">
                          <ul
                            className="list-group list-group-flush font-weight-bold text-secondary text-center"
                            style={{
                              borderTop: "solid 2px blue",
                              letterSpacing: "1px",
                            }}
                          >
                            {!isLoading &&
                              process?.assets?.map((asset, key) => (
                                <div key={key}>
                                  {key < assetsMore.itemsCount && (
                                    <li className="list-group-item" key={key}>
                                      <Link to={`/assets/view/${asset?.id}`}>
                                        {asset?.name}
                                      </Link>
                                    </li>
                                  )}
                                </div>
                              ))}
                            {process?.assets?.length > 5 &&
                              !assetsMore.expanded && (
                                <Link
                                  to="#"
                                  onClick={() =>
                                    setAssetsMore({
                                      itemsCount: process?.assets?.length,
                                      expanded: true,
                                    })
                                  }
                                >
                                  Voir plus
                                </Link>
                              )}
                            {process?.assets?.length > 5 &&
                              assetsMore.expanded && (
                                <Link
                                  to="#"
                                  onClick={() =>
                                    setAssetsMore({
                                      itemsCount: 5,
                                      expanded: false,
                                    })
                                  }
                                >
                                  Voir moins
                                </Link>
                              )}

                            {!isLoading &&
                              (process?.assets?.length === 0 ||
                                process?.assets === null) && (
                                <li className="list-group-item">
                                  <FontAwesomeIcon icon="exclamation-circle" />{" "}
                                  Aucun actif n'a été associé a ce processus
                                </li>
                              )}
                          </ul>
                        </div>
                      </div>
                      {/* /.tab-content */}
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
