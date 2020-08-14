import React, { useState, useEffect, useRef } from "react";
import RiskScenarioService from "../../services/RiskScenarioService";
import TypologyService from "../../services/TypologyService";
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
  const [riskScenariosPage, setRiskScenariosPage] = useState(new Page());
  const [isDeleting, setIsDeleting] = useState(false);
  const [sort, setSort] = useState({ field: "", direction: Sort.DESC });
  const [isApproving, setIsApproving] = useState(false);
  const searchInput = useRef(null);

  useEffect(() => {
    document.title = "Gestion Des Scénarios Des Risques";
    fetchRiskScenarios();
    return () => {
      setRiskScenariosPage(null);
    };
  }, [sort]);

  const fetchRiskScenarios = async () => {
    const search = searchInput?.current?.value || "";
    try {
      setIsLoading(true);
      setIsError(false);
      setIsUnAuthorized(false);
      setRiskScenariosPage(new Page());
      const response = await RiskScenarioService.getRiskScenariosPage(
        search,
        riskScenariosPage?.pageable || new Page(),
        sort
      );
      setIsLoading(false);
      setRiskScenariosPage(response);
      setIsError(false);
    } catch (e) {
      const status = e.response?.status || null;
      setIsLoading(false);
      setRiskScenariosPage(null);
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
    riskScenariosPage.pageable = CustomPaginationService.getNextPage(
      riskScenariosPage
    );
    fetchRiskScenarios();
  };

  const getPreviousPage = () => {
    riskScenariosPage.pageable = CustomPaginationService.getPreviousPage(
      riskScenariosPage
    );
    fetchRiskScenarios();
  };

  const getPageInNewSize = (pageSize) => {
    riskScenariosPage.pageable = CustomPaginationService.getPageInNewSize(
      riskScenariosPage,
      pageSize
    );
    fetchRiskScenarios();
  };

  const onSearchSubmit = async (event) => {
    event.preventDefault();
    setSort({field: '', direction: Sort.DESC});
    // Search users
    if (!isUnAuthorized && !isError && !isLoading) {
      getPageInNewSize(20);
    }
  };

  const deleteRiskScenario = async (typologyId, riskScenarioId) => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer la menace",
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
          await TypologyService.deleteRiskScenario(typologyId, riskScenarioId);
          Swal.fire(
            "Operation éffectuée!",
            "Le scénario de risque à été supprimée avec succés!",
            "success"
          );
          // Clear search
          searchInput.current.value = "";
          // Fetch users
          fetchRiskScenarios();
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
        `Le statut de la menace à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set riskScenario status
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
    <div>
      {/* Content Wrapper. Contains page content */}
      <div className="content-wrapper pb-5">
        {/* Content Header (Page header) */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Scénarios des risques</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">
                    Scénario des risques
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
                    page={riskScenariosPage}
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
                      <input
                        type="search"
                        id="userSearch"
                        placeholder="Nom du scénario de risque ..."
                        name="search"
                        className="form-control"
                        ref={searchInput}
                        disabled={isUnAuthorized || isLoading ? true : ""}
                      />
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
                <Link to="/riskscenarios/create" className="btn btn-primary btn-sm">
                  <FontAwesomeIcon icon="plus-circle" /> Ajouter un scénario de
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
                              field: "name",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "name" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                ? `sort-alpha-down-alt`
                                : `sort-alpha-up-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Nom de la vulnérabilité</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "description",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "description" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                ? `sort-alpha-down-alt`
                                : `sort-alpha-up-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Description</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "typology",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "typology" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                ? `sort-alpha-down-alt`
                                : `sort-alpha-up-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Typologie</th>
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
                                ? `sort-alpha-down-alt`
                                : `sort-alpha-up-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Date d'identification</th>
                        <th colSpan={4}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {isLoading && (
                        <tr>
                          <td colSpan={9} className="text-center bg-light">
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
                        riskScenariosPage !== null &&
                        riskScenariosPage?.content?.length === 0 && (
                          <tr>
                            <td
                              colSpan={9}
                              className="text-center alert alert-dark"
                            >
                              <h2 className="font-weight-bold">
                                <FontAwesomeIcon icon="exclamation-circle" />{" "}
                                Aucun scénario de risque n'a été trouvé!
                              </h2>
                            </td>
                          </tr>
                        )}
                      {(isError || isUnAuthorized) && (
                        <tr>
                          <td
                            colSpan={9}
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
                                onClick={() => fetchRiskScenarios()}
                                className="btn btn-warning font-weight-bold ml-2"
                              >
                                <FontAwesomeIcon icon="sync" /> Ressayer
                              </button>
                            </h2>
                          </td>
                        </tr>
                      )}

                      {riskScenariosPage &&
                        riskScenariosPage?.content?.map(
                          (riskScenarioResponse, key) => (
                            <tr key={key}>
                              <td>
                                <Link
                                  to={`/riskscenarios/view/${riskScenarioResponse?.typologyId}/${riskScenarioResponse?.riskScenario?.id}`}
                                >
                                  {riskScenarioResponse?.riskScenario?.name}
                                </Link>
                              </td>
                              <td
                                dangerouslySetInnerHTML={{
                                  __html: `${riskScenarioResponse?.riskScenario?.description?.slice(
                                    0,
                                    20
                                  )} ${
                                    riskScenarioResponse?.riskScenario
                                      ?.description?.length > 20
                                      ? "..."
                                      : ""
                                  }`,
                                }}
                              ></td>
                              <td>
                                <Link
                                  to={`/typologies/view/${riskScenarioResponse?.typologyId}`}
                                >
                                  {riskScenarioResponse?.typologyName}
                                </Link>
                              </td>
                              <td>
                                {riskScenarioResponse?.riskScenario?.status ? (
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
                                    riskScenarioResponse?.riskScenario
                                      ?.identificationDate
                                  }
                                </Moment>
                              </td>
                              <td>
                                <button
                                  onClick={(event) =>
                                    updateRiskScenarioStatus(
                                      riskScenarioResponse?.typologyId,
                                      riskScenarioResponse?.riskScenario,
                                      !riskScenarioResponse?.riskScenario
                                        ?.status
                                    )
                                  }
                                  className={`btn btn-${
                                    riskScenarioResponse?.riskScenario?.status
                                      ? "danger"
                                      : "success"
                                  } btn-sm ${isApproving ? "disabled" : ""}`}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      riskScenarioResponse?.riskScenario?.status
                                        ? "minus-circle"
                                        : "check-circle"
                                    }
                                    color="white"
                                  />
                                  {riskScenarioResponse?.riskScenario?.status
                                    ? " Rejecter"
                                    : " Approuver"}
                                </button>
                              </td>
                              <td>
                                <Link
                                  to={`/riskscenarios/${riskScenarioResponse?.typologyId}/${riskScenarioResponse?.riskScenario?.id}/edit`}
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
                                    deleteRiskScenario(
                                      riskScenarioResponse?.typologyId,
                                      riskScenarioResponse?.riskScenario?.id
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
                                  to={`/riskscenarios/view/${riskScenarioResponse?.typologyId}/${riskScenarioResponse?.riskScenario?.id}`}
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
