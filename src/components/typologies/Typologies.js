import React, { useState, useEffect, useRef } from "react";
import TypologyService from "../../services/TypologyService";
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
  const [typologiesPage, setTypologiesPage] = useState(new Page());
  const [isDeleting, setIsDeleting] = useState(false);
  const searchInput = useRef(null);

  useEffect(() => {
    document.title = "Gestion Des Typoliges Des Actifs";
    fetchTypologies();
    return () => {
      setTypologiesPage(null);
    };
  }, []);

  const fetchTypologies = async () => {
    const name = searchInput?.current?.value || "";
    try {
      setIsLoading(true);
      setIsError(false);
      setIsUnAuthorized(false);
      setTypologiesPage(new Page());
      const response = await TypologyService.getTypologiesPage(
        name,
        typologiesPage?.pageable || new Page()
      );
      setIsLoading(false);
      setTypologiesPage(response);
      setIsError(false);
    } catch (e) {
      const status = e.response?.status || null;
      setIsLoading(false);
      setTypologiesPage(null);
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
      if (name !== "" && name !== null) {
        searchInput.current.value = name;
      }
    }
  };

  const getNextPage = () => {
    typologiesPage.pageable = CustomPaginationService.getNextPage(setTypologiesPage);
    fetchTypologies();
  };

  const getPreviousPage = () => {
    typologiesPage.pageable = CustomPaginationService.getPreviousPage(setTypologiesPage);
    fetchTypologies();
  };

  const getPageInNewSize = (pageSize) => {
    typologiesPage.pageable = CustomPaginationService.getPageInNewSize(
      typologiesPage,
      pageSize
    );
    fetchTypologies();
  };

  const onSearchSubmit = async (event) => {
    event.preventDefault();
    // Search users
    if (!isUnAuthorized && !isError && !isLoading) {
      getPageInNewSize(20);
    }
  };

  const deleteTypology = async (id) => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer la typologie des actifs",
      text: "Voulez-vous supprimer la typologie des actifs?",
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
            "La typologie à été supprimée avec succés!",
            "success"
          );
          // Clear search
          searchInput.current.value = "";
          // Fetch users
          fetchTypologies();
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

  return (
    <div>
      {/* Content Wrapper. Contains page content */}
      <div className="content-wrapper pb-5">
        {/* Content Header (Page header) */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Typologies</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Typologies des actifs</li>
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
                    page={typologiesPage}
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
                        placeholder="Nom de la typologie ..."
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
                <Link to="/typologies/create" className="btn btn-primary btn-sm">
                  <FontAwesomeIcon icon="plus-circle" /> Ajouter une typologie
                </Link>
              </div>

              {/** DELTING PROGRESS */}
              {(isDeleting ) && (
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
                        <th>Nom de la typologie</th>
                        <th>Description</th>
                        <th colSpan={3}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {isLoading && (
                        <tr>
                          <td colSpan={5} className="text-center bg-light">
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
                        typologiesPage !== null &&
                        typologiesPage?.content?.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center alert alert-dark"
                            >
                              <h2 className="font-weight-bold">
                                <FontAwesomeIcon icon="exclamation-circle" />{" "}
                                Aucune typologie des actifs n'a été trouvée!
                              </h2>
                            </td>
                          </tr>
                        )}
                      {(isError || isUnAuthorized) && (
                        <tr>
                          <td
                            colSpan={5}
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
                                onClick={() => fetchTypologies()}
                                className="btn btn-warning font-weight-bold ml-2"
                              >
                                <FontAwesomeIcon icon="sync" /> Ressayer
                              </button>
                            </h2>
                          </td>
                        </tr>
                      )}

                      {typologiesPage &&
                        typologiesPage?.content?.map((typology, key) => (
                          <tr key={key}>
                            <td>
                              <Link to={`/typologies/view/${typology?.id}`}>
                                {typology?.name}
                              </Link>
                            </td>
                            <td
                              dangerouslySetInnerHTML={{
                                __html: `${typology?.description?.slice(
                                  0,
                                  20
                                )} ${
                                  typology?.description?.length > 20 ? "..." : ""
                                }`,
                              }}
                            ></td>
                             <td>
                              <Link to={`/typologies/${typology?.id}/edit`}>
                                <button className="btn btn-primary btn-sm">
                                  <FontAwesomeIcon icon="edit" color="white" />
                                </button>
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={(event) => deleteTypology(typology?.id)}
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
                              <Link to={`/typologies/view/${typology?.id}`}>
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
