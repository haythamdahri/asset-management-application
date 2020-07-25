import React, { useState, useEffect, useRef } from "react";
import ProcessService from "../../services/ProcessService";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CustomPagination from "../../pagination/components/custom-pagination/CustomPagination";
import CustomPaginationService from "../../pagination/services/CustomPaginationService";
import { Page } from "../../pagination/Page";

export default () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [processesPage, setProcessesPage] = useState(new Page());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const searchInput = useRef(null);

  useEffect(() => {
    document.title = "Gestion Processus";
    fetchProcesses();
    return () => {
      setProcessesPage(null);
    };
  }, []);

  const fetchProcesses = async () => {
    const search = searchInput?.current?.value || "";
    try {
      setIsLoading(true);
      setIsError(false);
      setIsUnAuthorized(false);
      setProcessesPage(new Page());
      const response = await ProcessService.getProcessesPage(
        search,
        processesPage?.pageable || new Page()
      );
      setIsLoading(false);
      setProcessesPage(response);
      setIsError(false);
    } catch (e) {
      const status = e.response?.status || null;
      setIsLoading(false);
      setProcessesPage(null);
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
    processesPage.pageable = CustomPaginationService.getNextPage(processesPage);
    fetchProcesses();
  };

  const getPreviousPage = () => {
    processesPage.pageable = CustomPaginationService.getPreviousPage(
      processesPage
    );
    fetchProcesses();
  };

  const getPageInNewSize = (pageSize) => {
    processesPage.pageable = CustomPaginationService.getPageInNewSize(
      processesPage,
      pageSize
    );
    fetchProcesses();
  };

  const onSearchSubmit = async (event) => {
    event.preventDefault();
    // Search users
    if (!isUnAuthorized && !isError && !isLoading) {
      getPageInNewSize(20);
    }
  };

  const deleteProcess = async (id) => {
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
          // Clear search
          searchInput.current.value = "";
          // Fetch users
          fetchProcesses();
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

  const updateProcessStatus = async (process, status) => {
    // Perform User delete
    try {
        setIsApproving(true);
        await ProcessService.updateProcessStatus(process?.id, status);
        Swal.fire(
          "Operation éffectuée!",
          `Le statut du processus à été ${status ? 'approuvé' : 'rejeté'} avec succés!`,
          "success"
        );
        // Set process status
        process.status = status;
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
                <h1>Processus</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Processus</li>
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
                    page={processesPage}
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
                        placeholder="Nom du processus ..."
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
                <Link to="/processes/create" className="btn btn-primary btn-sm">
                  <FontAwesomeIcon icon="user-plus" /> Ajouter un processus
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
                        <th>Nom du processus</th>
                        <th>Description</th>
                        <th>Organisme</th>
                        <th>Statut</th>
                        <th>Processus Superieur</th>
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
                        processesPage !== null &&
                        processesPage?.content?.length === 0 && (
                          <tr>
                            <td
                              colSpan={9}
                              className="text-center alert alert-dark"
                            >
                              <h2 className="font-weight-bold">
                                <FontAwesomeIcon icon="exclamation-circle" />{" "}
                                Aucun Processus n'a été trouvé!
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
                                onClick={() => fetchProcesses()}
                                className="btn btn-warning font-weight-bold ml-2"
                              >
                                <FontAwesomeIcon icon="sync" /> Ressayer
                              </button>
                            </h2>
                          </td>
                        </tr>
                      )}

                      {processesPage &&
                        processesPage?.content?.map((process, key) => (
                          <tr key={key}>
                            <td>
                              <Link to={`/processes/view/${process?.id}`}>
                                {process?.name}
                              </Link>
                            </td>
                            <td
                              dangerouslySetInnerHTML={{
                                __html: `${process?.description?.slice(
                                  0,
                                  20
                                )} ${
                                  process?.description?.length > 20 ? "..." : ""
                                }`,
                              }}
                            ></td>
                            <td>
                              <Link
                                to={`/organizations/view/${process?.organization?.id}`}
                              >
                                {process?.organization?.name}
                              </Link>
                            </td>
                            <td>
                              {process?.status ? (
                                  <>
                                  <FontAwesomeIcon
                                  icon="check-circle"
                                  color="green"
                                /> APPROUVÉ
                                  </>
                              ) : (
                                  <>
                                  <FontAwesomeIcon
                                  icon="times-circle"
                                  color="red"
                                /> NON APPROUVÉ
                                  </>
                              )}
                            </td>
                            <td>
                              <Link
                                to={`/processes/view/${process?.parentProcess?.id}`}
                              >
                                {process?.parentProcess?.name}
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={(event) => updateProcessStatus(process, !process?.status)}
                                className={`btn btn-${process?.status ? 'danger' : 'success'} btn-sm ${
                                  isApproving ? "disabled" : ""
                                }`}
                              >
                                <FontAwesomeIcon
                                      icon={process.status ? 'minus-circle' : 'check-circle'}
                                      color="white"
                                    />
                                    {process?.status ? ' Rejecter' : ' Approuver'}
                              </button>
                            </td>
                            <td>
                              <Link to={`/processes/${process?.id}/edit`}>
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
                                onClick={(event) => deleteProcess(process?.id)}
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
                              <Link to={`/processes/view/${process?.id}`}>
                                <button className="btn btn-secondary btn-sm">
                                  <FontAwesomeIcon
                                    icon="binoculars"
                                    color="white"
                                  />
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))}
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
