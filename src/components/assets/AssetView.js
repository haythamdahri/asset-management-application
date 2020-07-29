import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import AssetService from "../../services/AssetService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Moment from "react-moment";
import RiskAnalyzesTable from "../riskanalyzes/RiskAnalyzesTable";

export default () => {
  const [asset, setAsset] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  let history = useHistory();
  const aborderController = new AbortController();

  // User Id Extraction from URL
  let { id } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Des Actifs";
    fetchAsset();
    return () => {
      ref.current = false;
    };
  }, [id]);

  const fetchAsset = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setIsError(false);
    setAsset({});
    try {
      const asset = await AssetService.getAsset(id);
      if (!asset.hasOwnProperty("id")) {
        setAsset(null);
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
      } else {
        setAsset(asset);
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      const status = e?.response?.status || null;
      setIsLoading(false);
      setAsset({});
      console.log(status);
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setIsError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setIsError(false);
          setAsset(null);
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

  const deleteAsset = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer l'actif'?",
      text: "Voulez-vous supprimer l'actif?",
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
          await AssetService.deleteAsset(id);
          Swal.fire(
            "Operation éffectuée!",
            "L'actif à été supprimé avec succés!",
            "success"
          );
          history.push("/assets");
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

  const updateAssetStatus = async (asset, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await AssetService.updateAssetStatus(asset?.id, status);
      Swal.fire(
        "Operation éffectuée!",
        `Le statut d'actif' à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set asset status
      asset.status = status;
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

  const updateClassificationStatus = async (asset, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await AssetService.updateProcessClassificationStatus(
        asset?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de la classification d'actif à été ${
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
                      onClick={() => fetchAsset()}
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
                    onClick={() => deleteAsset()}
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
                          href="#asset"
                          data-toggle="tab"
                        >
                          Actif
                        </a>
                      </li>
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link"
                          href="#classification"
                          data-toggle="tab"
                        >
                          Classification d'actif
                        </a>
                      </li>
                      <li className="nav-item flex-sm-fill">
                        <a
                          className="nav-link"
                          href="#riskanalysis"
                          data-toggle="tab"
                        >
                          Analyses Des Risques
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="card-body">
                    <div className="tab-content">
                      <div className="tab-pane active" id="asset">
                        <div className="table table-responsive float-left">
                          <table className="table table-striped">
                            <thead align="center">
                              <tr>
                                <th scope="col">Nom</th>
                                <td>{asset?.name}</td>
                              </tr>
                            </thead>
                            <tbody align="center">
                              <tr>
                                <th scope="col">Description</th>
                                <td>
                                  <CKEditor
                                    editor={ClassicEditor}
                                    data={asset?.description}
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
                                <th scope="col">Localisation</th>
                                <td>
                                    <Link to={`/locations/view/${asset?.location?.id}`}>
                                    {asset?.location?.name}</Link></td>
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
                                      updateAssetStatus(
                                        asset,
                                        !asset?.status
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
                              asset?.classification?.status
                                ? "alert-success"
                                : "alert-danger"
                            }`}
                          >
                            <h5>
                              <i className="icon fas fa-ban" /> Statut de la
                              classification!
                            </h5>
                            La classification d'actif est{" "}
                            {`${
                              asset?.classification?.status
                                ? "approuvé"
                                : "rejeté"
                            }`}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="callout callout-danger">
                            <h5>Confidentialité</h5>
                            <p>
                              {asset?.classification?.confidentiality || 0}
                            </p>
                          </div>
                          <div className="callout callout-info">
                            <h5>Disponibilité</h5>
                            <p>{asset?.classification?.availability || 0}</p>
                          </div>
                          <div className="callout callout-warning">
                            <h5>Intégrité</h5>
                            <p>{asset?.classification?.integrity || 0}</p>
                          </div>
                          <div className="callout callout-success">
                            <h5>Traçabilité</h5>
                            <p>{asset?.classification?.traceability || 0}</p>
                          </div>
                          <div className="callout callout-primary">
                            <h5>Score</h5>
                            <p>{asset?.classification?.score || 0}</p>
                          </div>
                          <div className="callout callout-info">
                            <h5>Date d'identification</h5>
                            <p>
                              <Moment format="YYYY/MM/DD HH:mm:ss">
                                {asset?.classification?.identificationDate}
                              </Moment>
                            </p>
                          </div>
                          {process?.classification !== null && (
                            <div className="text-center">
                              <button
                                onClick={(event) =>
                                  updateClassificationStatus(
                                    asset,
                                    !asset?.classification?.status
                                  )
                                }
                                className={`w-50 btn btn-${
                                    asset?.classification?.status
                                    ? "danger"
                                    : "success"
                                } btn-sm ${isApproving ? "disabled" : ""}`}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    asset?.classification?.status
                                      ? "minus-circle"
                                      : "check-circle"
                                  }
                                  color="white"
                                />
                                {asset?.classification?.status
                                  ? " Rejeter"
                                  : " Approuver"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* /.tab-pane */}
                      <div className="tab-pane" id="riskanalysis">
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h3 className="card-title">
                                Analyses de risque de {asset?.name}
                              </h3>
                            </div>
                            {/* /.card-header */}
                            <div className="card-body">
                              <RiskAnalyzesTable asset={asset} />
                            </div>
                            {/* /.card-body */}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                    {/* /.tab-content */}
                    </div>
                    {/* /.tab-content */}
                
                </div>
                </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
