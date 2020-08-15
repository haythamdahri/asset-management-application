import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import ProcessService from "../../services/ProcessService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Moment from "react-moment";

export default () => {
  const [applicationProcess, setApplicationProcess] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processAssets, setProcessAssets] = useState({isLoading: true, data: []});
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
  }, [id]);

  const fetchProcess = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setIsError(false);
    setApplicationProcess({});
    try {
      const applicationProcess = await ProcessService.getProcess(id);
      if (!applicationProcess.hasOwnProperty("id")) {
        setApplicationProcess(null);
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
      } else {
        setApplicationProcess(applicationProcess);
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
        // Fetch Process Assets
        // Associate js files
        const script = document.createElement("script");
        script.src = "/js/content.js";
        script.async = true;
        document.body.appendChild(script);
      }
    } catch (e) {
      console.log(e);
      const status = e?.response?.status || null;
      setIsLoading(false);
      setApplicationProcess({});
      console.log(status);
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setIsError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setIsError(false);
          setApplicationProcess(null);
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
            err?.response?.message ||
              `Une erreur est survenue, veuillez ressayer!`,
            "error"
          );
          setIsDeleting(false);
        }
      }
    });
  };

  const updateProcessStatus = async (applicationProcess, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await ProcessService.updateProcessStatus(applicationProcess?.id, status);
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de la classification à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set process status
      applicationProcess.status = status;
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

  const updateClassificationStatus = async (applicationProcess, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await ProcessService.updateProcessClassificationStatus(
        applicationProcess?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de la classification du processus à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set process status
      applicationProcess.classification.status = status;
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

            {(isError || isUnAuthorized || applicationProcess === null) &&
              !isLoading && (
                <div className="col-10 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isError && "Une erreur est survenue!"}
                      {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                      {applicationProcess === null &&
                        "Aucun processus n'a été trouvé"}
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

            {!isLoading &&
              !isError &&
              !isUnAuthorized &&
              applicationProcess !== null && (
                <>
                  <div className="col-12 text-center mt-2">
                    <Link to={`/processes/${applicationProcess?.id}/edit`}>
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
                            <FontAwesomeIcon icon="microchip" /> Processus
                          </a>
                        </li>
                        <li className="nav-item flex-sm-fill">
                          <a
                            className="nav-link"
                            href="#classification"
                            data-toggle="tab"
                          >
                            <FontAwesomeIcon icon="i-cursor" /> Classification
                          </a>
                        </li>
                        <li className="nav-item flex-sm-fill">
                          <a
                            className="nav-link"
                            href="#asssets"
                            data-toggle="tab"
                          >
                            <FontAwesomeIcon icon="server" /> Actifs
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
                                  <td colSpan={2}>
                                    <div
                                      className={`shadow shadow-sm alert ${
                                        applicationProcess?.status
                                          ? "alert-success"
                                          : "alert-danger"
                                      }`}
                                    >
                                      <h5>
                                        <i className="icon fas fa-ban" /> Statut
                                        du processus!
                                      </h5>
                                      Le processus est{" "}
                                      {`${
                                        applicationProcess?.status
                                          ? "approuvé"
                                          : "rejeté"
                                      }`}
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="col">Nom</th>
                                  <td>{applicationProcess?.name}</td>
                                </tr>
                              </thead>
                              <tbody align="center">
                                <tr>
                                  <th scope="col">Description</th>
                                  <td>
                                    <CKEditor
                                      editor={ClassicEditor}
                                      data={applicationProcess?.description}
                                      config={{
                                        toolbar: [],
                                        removePlugins: ["Heading", "Link"],
                                        isReadOnly: true,
                                      }}
                                      disabled={true}
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="col">Processus Superieur</th>
                                  <td>
                                    <Link
                                      to={`/processes/view/${applicationProcess?.parentProcess?.id}`}
                                    >
                                      {applicationProcess?.parentProcess?.name}
                                    </Link>
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="col">Organisme</th>
                                  <td>
                                    <Link
                                      to={`/organizations/view/${applicationProcess?.organization?.id}`}
                                    >
                                      {applicationProcess?.organization?.name}
                                    </Link>
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="col">Statut</th>
                                  <td>
                                    {applicationProcess?.status ? (
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
                                          applicationProcess,
                                          !applicationProcess?.status
                                        )
                                      }
                                      className={`ml-2 btn btn-${
                                        applicationProcess?.status
                                          ? "danger"
                                          : "success"
                                      } btn-sm ${
                                        isApproving ? "disabled" : ""
                                      }`}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          applicationProcess?.status
                                            ? "minus-circle"
                                            : "check-circle"
                                        }
                                        color="white"
                                      />
                                      {applicationProcess?.status
                                        ? " Rejeter"
                                        : " Approuver"}
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* /.tab-pane */}
                        <div className="tab-pane" id="classification">
                          <div className="col-12">
                            <div
                              className={`shadow shadow-sm alert ${
                                applicationProcess?.classification?.status
                                  ? "alert-success"
                                  : "alert-danger"
                              }`}
                            >
                              <h5>
                                <i className="icon fas fa-ban" /> Statut de la
                                classification!
                              </h5>
                              La classification du processus est{" "}
                              {`${
                                applicationProcess?.classification?.status
                                  ? "approuvé"
                                  : "rejeté"
                              }`}
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="callout callout-danger">
                              <h5>Confidentialité</h5>
                              <p>
                                {applicationProcess?.classification
                                  ?.confidentiality || 0}
                              </p>
                            </div>
                            <div className="callout callout-info">
                              <h5>Disponibilité</h5>
                              <p>
                                {applicationProcess?.classification
                                  ?.availability || 0}
                              </p>
                            </div>
                            <div className="callout callout-warning">
                              <h5>Intégrité</h5>
                              <p>
                                {applicationProcess?.classification
                                  ?.integrity || 0}
                              </p>
                            </div>
                            <div className="callout callout-success">
                              <h5>Traçabilité</h5>
                              <p>
                                {applicationProcess?.classification
                                  ?.traceability || 0}
                              </p>
                            </div>
                            <div className="callout callout-primary">
                              <h5>Score</h5>
                              <p>
                                {applicationProcess?.classification?.score || 0}
                              </p>
                            </div>
                            <div className="callout callout-info">
                              <h5>Date d'identification</h5>
                              <p>
                                <Moment format="YYYY/MM/DD HH:mm:ss">
                                  {
                                    applicationProcess?.classification
                                      ?.identificationDate
                                  }
                                </Moment>
                              </p>
                            </div>
                            {applicationProcess?.classification !== null && (
                              <div className="text-center">
                                <button
                                  onClick={(event) =>
                                    updateClassificationStatus(
                                      applicationProcess,
                                      !applicationProcess?.classification
                                        ?.status
                                    )
                                  }
                                  className={`w-50 btn btn-${
                                    applicationProcess?.classification?.status
                                      ? "danger"
                                      : "success"
                                  } btn-sm ${isApproving ? "disabled" : ""}`}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      applicationProcess?.classification?.status
                                        ? "minus-circle"
                                        : "check-circle"
                                    }
                                    color="white"
                                  />
                                  {applicationProcess?.classification?.status
                                    ? " Rejeter"
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
                                applicationProcess?.assets?.length > 0 && (
                                  <div className="row">
                                    <div className="col-sm-12">
                                      <table
                                        id="permissions"
                                        className="table table-bordered table-striped dataTable dtr-inline"
                                        role="grid"
                                        aria-describedby="permissions_info"
                                      >
                                        <thead align="center">
                                          <tr role="row">
                                            <th>Role</th>
                                            <th>Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody align="center">
                                          {applicationProcess?.assets?.map(
                                            (asset, key) => (
                                              <tr key={key}>
                                                <th scope="col">
                                                  {asset?.name}
                                                </th>
                                                <td>
                                                  <Link
                                                    to={`/assets/view/${asset?.id}`}
                                                    className="btn btn-outline-primary btn-sm"
                                                  >
                                                    <FontAwesomeIcon icon="eye" />{" "}
                                                    Voir
                                                  </Link>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                              {!isLoading &&
                                (applicationProcess?.assets?.length === 0 ||
                                  applicationProcess?.assets === null) && (
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
