import React, { useState, useEffect, useRef } from "react";
import RiskAnalysisService from "../../services/RiskAnalysisService";
import AssetService from "../../services/AssetService";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CustomPagination from "../../pagination/components/custom-pagination/CustomPagination";
import CustomPaginationService from "../../pagination/services/CustomPaginationService";
import { Page } from "../../pagination/Page";
import Moment from "react-moment";
import { Sort } from "../../models/Sort";

export default () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [riskAnalyzesPage, setRiskAnalyzesPage] = useState(new Page());
  const [assets, setAssets] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [sort, setSort] = useState({ field: "", direction: Sort.DESC });
  const searchInput = useRef(null);

  useEffect(() => {
    document.title = "Gestion Des Analyses Des Risques";
    fetchAssets();
    return () => {
      setRiskAnalyzesPage(null);
    };
  }, []);

  useEffect(() => {
    fetchRiskAnalyzesPage();
  }, [sort])

  const fetchAssets = async () => {
    try {
      setAssets(await AssetService.getAssets());
    } catch (e) {}
  };

  const fetchRiskAnalyzesPage = async () => {
    const search = searchInput?.current?.value || "";
    try {
      setIsLoading(true);
      setIsError(false);
      setIsUnAuthorized(false);
      setRiskAnalyzesPage(new Page());
      const response = await RiskAnalysisService.getRiskAnalysisPage(
        search,
        riskAnalyzesPage?.pageable || new Page(),
        sort
      );
      setIsLoading(false);
      setRiskAnalyzesPage(response);
      setIsError(false);
    } catch (e) {
      const status = e.response?.status || null;
      setIsLoading(false);
      setRiskAnalyzesPage(null);
      if (status === 403) {
        setIsUnAuthorized(true);
        setIsError(false);
      } else {
        setIsError(true);
        setIsUnAuthorized(false);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        Toast.fire({
          icon: "error",
          title: `Une erreur est survenue, veuillez ressayer!`,
        });
      }
    } finally {
      if (search !== "" && search !== null) {
        searchInput.current.value = search;
      }
    }
  };

  const getNextPage = () => {
    riskAnalyzesPage.pageable = CustomPaginationService.getNextPage(
      riskAnalyzesPage
    );
    fetchRiskAnalyzesPage();
  };

  const getPreviousPage = () => {
    riskAnalyzesPage.pageable = CustomPaginationService.getPreviousPage(
      riskAnalyzesPage
    );
    fetchRiskAnalyzesPage();
  };

  const getPageInNewSize = (pageSize) => {
    riskAnalyzesPage.pageable = CustomPaginationService.getPageInNewSize(
      riskAnalyzesPage,
      pageSize
    );
    fetchRiskAnalyzesPage();
  };

  const onSearchSubmit = async (event) => {
    event.preventDefault();
    setSort({field: '', direction: Sort.DESC});
    // Search users
    if (!isUnAuthorized && !isError && !isLoading) {
      getPageInNewSize(20);
    }
  };

  const deleteRiskAnalysis = async (assetId, riskAnalysisId) => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer l'analyse de risque",
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
            "L'analyse de reisque à été supprimée avec succés!",
            "success"
          );
          // Clear search
          searchInput.current.value = "";
          // Fetch users
          fetchRiskAnalyzesPage();
        } catch (err) {
          Swal.fire(
            "Erreur!",
            err?.response?.data?.message ||
              `Une erreur est survenue, veuillez ressayer!`,
            "error"
          );
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const updateRiskAnalysisStatus = async (assetId, riskAnalysis, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await AssetService.updateAssetRiskAnalysisStatus(
        assetId,
        riskAnalysis?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `L'analyse de risque à été ${
          status ? "approuvée" : "rejetée"
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

  return (
    <div>
      {/* Content Wrapper. Contains page content */}
      <div className="content-wrapper pb-5">
        {/* Content Header (Page header) */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Analyses Des Risque</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">
                    Analyses Des Risque
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
              {!isUnAuthorized && !isError && !isLoading && (
                <div className="col-12 text-center">
                  <CustomPagination
                    page={riskAnalyzesPage}
                    loading={isLoading}
                    nextPageEvent={getNextPage}
                    previousPageEvent={getPreviousPage}
                    pageSizeEvent={getPageInNewSize}
                  />
                </div>
              )}
              {/** SEARCH */}
              <div className="col-sm-12 col-md-10 col-lg-10 col-xl-10 mx-auto mb-4">
                <form onSubmit={onSearchSubmit}>
                  <div className="form-row">
                    <div className="col-sm-12 col-md-10 col-lg-10 col-xl-10 mx-auto">
                      <div className="form-group row">
                        <label htmlFor="asset" className="col-sm-2 col-form-label">
                          Actif
                        </label>
                        <div className="col-sm-10">
                          <select
                            id="asset"
                            name="search"
                            ref={searchInput}
                            className="form-control"
                            disabled={isUnAuthorized || isLoading ? true : ""}
                          >
                            <option></option>
                            {assets !== null &&
                              assets !== undefined &&
                              assets?.map((asset, key) => (
                                <option key={key} value={asset?.id}>
                                  {asset?.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-12 col-md-2 col-lg-2 col-xl-2 mx-auto">
                      <button
                        type="submit"
                        className="btn btn-warning btn-block font-weight-bold"
                      >
                        <FontAwesomeIcon icon="search-dollar" /> Rechercher
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="col-12 mb-3 text-center">
                <Link
                  to="/riskanalyzes/create"
                  className="btn btn-primary btn-sm"
                >
                  <FontAwesomeIcon icon="plus-circle" /> Ajouter une analyse de
                  risque
                </Link>
              </div>

              {/** DELTING PROGRESS */}
              {(isDeleting || isApproving) && (
                <div className="col-12 mt-2 mb-3">
                  <div className="overlay text-center">
                    <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                  </div>
                </div>
              )}

              <div
                className="col-12 bg-white p-2 shadow shadow-sm rounded mb-5"
                style={{ borderTop: "black 2px solid" }}
              >
                <div className="table-responsive">
                  <table className="table table-hover table-bordered ">
                    <thead className="thead-light text-center">
                      <tr>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "asset",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "asset" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                  ? `sort-alpha-up-alt`
                                  : `sort-alpha-down-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Actif</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "probability",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "probability" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                  ? `sort-alpha-up-alt`
                                  : `sort-alpha-down-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Probabilité</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "financialImpact",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "financialImpact" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                  ? `sort-alpha-up-alt`
                                  : `sort-alpha-down-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Impact financier</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "operationalImpact",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "operationalImpact" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                  ? `sort-alpha-up-alt`
                                  : `sort-alpha-down-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Impact operationnel</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "reputationalImpact",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "reputationalImpact" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                  ? `sort-alpha-up-alt`
                                  : `sort-alpha-down-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Impact réputationnel</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "impact",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "impact" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                  ? `sort-alpha-up-alt`
                                  : `sort-alpha-down-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Impact</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "status",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "status" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                  ? `sort-alpha-down-alt`
                                  : `sort-alpha-up-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Statut</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "identificationDate",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "identificationDate" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                  ? `sort-alpha-up-alt`
                                  : `sort-alpha-down-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Date d'identification</th>
                        <th colSpan={4}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {isLoading && (
                        <tr>
                          <td colSpan={12} className="text-center bg-light">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!isLoading &&
                        riskAnalyzesPage !== null &&
                        riskAnalyzesPage?.content?.length === 0 && (
                          <tr>
                            <td
                              colSpan={12}
                              className="text-center alert alert-dark"
                            >
                              <h2 className="font-weight-bold">
                                <FontAwesomeIcon icon="exclamation-circle" />{" "}
                                Aucune analyse de risque n'a été trouvée!
                              </h2>
                            </td>
                          </tr>
                        )}
                      {(isError || isUnAuthorized) && (
                        <tr>
                          <td
                            colSpan={12}
                            className={`text-center alert ${
                              isError ? "alert-warning" : "alert-danger"
                            }`}
                          >
                            <h2 className="font-weight-bold">
                              <FontAwesomeIcon icon="exclamation-circle" />{" "}
                              {isError
                                ? "Une erreur est survenue!"
                                : "Vous n'êtes pas autorisé!"}
                              <button
                                onClick={() => {
                                  fetchRiskAnalyzesPage();
                                  fetchAssets();
                                }}
                                className="btn btn-warning font-weight-bold ml-2"
                              >
                                <FontAwesomeIcon icon="sync" /> Ressayer
                              </button>
                            </h2>
                          </td>
                        </tr>
                      )}

                      {riskAnalyzesPage &&
                        riskAnalyzesPage?.content?.map(
                          (riskAnalysisResponse, key) => (
                            <tr key={key}>
                              <td>
                                <Link
                                  to={`/assets/view/${riskAnalysisResponse?.assetId}`}
                                >
                                  {riskAnalysisResponse?.assetName}
                                </Link>
                              </td>
                              <td>
                                {
                                  riskAnalysisResponse?.riskAnalysis
                                    ?.probability
                                }
                              </td>
                              <td>
                                {
                                  riskAnalysisResponse?.riskAnalysis
                                    ?.financialImpact
                                }
                              </td>
                              <td>
                                {
                                  riskAnalysisResponse?.riskAnalysis
                                    ?.operationalImpact
                                }
                              </td>
                              <td>
                                {
                                  riskAnalysisResponse?.riskAnalysis
                                    ?.reputationalImpact
                                }
                              </td>
                              <td>
                                {riskAnalysisResponse?.riskAnalysis?.impact}
                              </td>
                              <td>
                                {riskAnalysisResponse?.riskAnalysis?.status ? (
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
                              </td>
                              <td>
                                <Moment format="YYYY/MM/DD HH:mm:ss">
                                  {
                                    riskAnalysisResponse?.riskAnalysis
                                      ?.identificationDate
                                  }
                                </Moment>
                              </td>
                              <td>
                                <button
                                  onClick={(event) =>
                                    updateRiskAnalysisStatus(
                                      riskAnalysisResponse?.assetId,
                                      riskAnalysisResponse?.riskAnalysis,
                                      !riskAnalysisResponse?.riskAnalysis
                                        ?.status
                                    )
                                  }
                                  className={`btn btn-${
                                    riskAnalysisResponse?.riskAnalysis?.status
                                      ? "danger"
                                      : "success"
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
                                  {riskAnalysisResponse?.riskAnalysis?.status
                                    ? " Rejeter"
                                    : " Approuver"}
                                </button>
                              </td>
                              <td>
                                <Link
                                  to={`/riskanalyzes/${riskAnalysisResponse?.assetId}/${riskAnalysisResponse?.riskAnalysis?.id}/edit`}
                                >
                                  <button className="btn btn-primary btn-sm">
                                    <FontAwesomeIcon
                                      icon="edit"
                                      color="white"
                                    />
                                  </button>
                                </Link>
                              </td>
                              <td>
                                <button
                                  onClick={(event) =>
                                    deleteRiskAnalysis(
                                      riskAnalysisResponse?.assetId,
                                      riskAnalysisResponse?.riskAnalysis?.id
                                    )
                                  }
                                  className={`btn btn-danger btn-sm ${
                                    isDeleting ? "disabled" : ""
                                  }`}
                                >
                                  <FontAwesomeIcon
                                    icon="trash-alt"
                                    color="white"
                                  />
                                </button>
                              </td>
                              <td>
                                <Link
                                  to={`/riskanalyzes/view/${riskAnalysisResponse?.assetId}/${riskAnalysisResponse?.riskAnalysis?.id}`}
                                >
                                  <button className="btn btn-secondary btn-sm">
                                    <FontAwesomeIcon
                                      icon="binoculars"
                                      color="white"
                                    />
                                  </button>
                                </Link>
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>
                {/* /.card */}
              </div>
              {/* /.col */}
            </div>
            {/* /.row */}
          </div>
          {/* /.container-fluid */}
        </section>
        {/* /.content */}
      </div>
    </div>
  );
};
