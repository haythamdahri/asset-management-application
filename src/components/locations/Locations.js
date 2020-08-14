import React, { useState, useEffect, useRef } from "react";
import LocationService from "../../services/LocationService";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CustomPagination from "../../pagination/components/custom-pagination/CustomPagination";
import CustomPaginationService from "../../pagination/services/CustomPaginationService";
import { Page } from "../../pagination/Page";
import { Sort } from "../../models/Sort";

export default () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [locationsPage, setLocationsPage] = useState(new Page());
  const [isDeleting, setIsDeleting] = useState(false);
  const [sort, setSort] = useState({ field: "", direction: Sort.DESC });
  const searchInput = useRef(null);

  useEffect(() => {
    document.title = "Gestion Des Localisations";
    fetchLocations();
    return () => {
      setLocationsPage(null);
    };
  }, [sort]);

  const fetchLocations = async () => {
    const search = searchInput?.current?.value || "";
    try {
      setIsLoading(true);
      setIsError(false);
      setIsUnAuthorized(false);
      setLocationsPage(new Page());
      const response = await LocationService.getLocationsPage(
        search,
        locationsPage?.pageable || new Page(),
        sort
      );
      setIsLoading(false);
      setLocationsPage(response);
      setIsError(false);
    } catch (e) {
      const status = e.response?.status || null;
      setIsLoading(false);
      setLocationsPage(null);
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
    locationsPage.pageable = CustomPaginationService.getNextPage(locationsPage);
    fetchLocations();
  };

  const getPreviousPage = () => {
    locationsPage.pageable = CustomPaginationService.getPreviousPage(locationsPage);
    fetchLocations();
  };

  const getPageInNewSize = (pageSize) => {
    locationsPage.pageable = CustomPaginationService.getPageInNewSize(
      locationsPage,
      pageSize
    );
    fetchLocations();
  };

  const onSearchSubmit = async (event) => {
    event.preventDefault();
    setSort({field: '', direction: Sort.DESC});
    // Search locations
    if (!isUnAuthorized && !isError && !isLoading) {
      getPageInNewSize(20);
    }
  };

  const deleteLocation = async (id) => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer la localisation",
      text: "Voulez-vous supprimer la localisation?",
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
          await LocationService.deleteLocation(id);
          Swal.fire(
            "Operation éffectuée!",
            "La localisation à été supprimée avec succés!",
            "success"
          );
          // Clear search
          searchInput.current.value = "";
          // Fetch locations
          fetchLocations();
        } catch (err) {
          Swal.fire(
            "Erreur!",
            err?.response?.message ||
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
                <h1>Localisations</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Localisations</li>
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
                    page={locationsPage}
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
                        placeholder="Nom, adresse 1, adresse 2, ville  ..."
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
                <Link to="/locations/create" className="btn btn-primary btn-sm">
                  <FontAwesomeIcon icon="plus-circle" /> Ajouter une localisation
                </Link>
              </div>

              {/** DELTING PROGRESS */}
              {(isDeleting) && (
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
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Nom de la localisation</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "state",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "state" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                ? `sort-alpha-down-alt`
                                : `sort-alpha-up-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Région</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "city",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "city" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                ? `sort-alpha-down-alt`
                                : `sort-alpha-up-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Ville</th>
                        <th
                          style={{cursor: 'pointer'}}
                          onClick={(e) =>
                            setSort({
                              field: "zip",
                              direction:
                                sort.direction === Sort.DESC
                                  ? Sort.ASC
                                  : Sort.DESC,
                            })
                          }
                        >
                          {sort?.field === "zip" ? (
                            <FontAwesomeIcon
                              icon={
                                sort.direction === Sort.DESC
                                ? `sort-alpha-down-alt`
                                : `sort-alpha-up-alt`
                              }
                            />
                          ) : (<FontAwesomeIcon icon="sort" />)}{" "}Code postal</th>
                        <th colSpan={3}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {isLoading && (
                        <tr>
                          <td colSpan={7} className="text-center bg-light">
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
                        locationsPage !== null &&
                        locationsPage?.content?.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center alert alert-dark"
                            >
                              <h2 className="font-weight-bold">
                                <FontAwesomeIcon icon="exclamation-circle" />{" "}
                                Aucune localisation n'a été trouvée!
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
                                onClick={() => fetchLocations()}
                                className="btn btn-warning font-weight-bold ml-2"
                              >
                                <FontAwesomeIcon icon="sync" /> Ressayer
                              </button>
                            </h2>
                          </td>
                        </tr>
                      )}

                      {locationsPage &&
                        locationsPage?.content?.map((location, key) => (
                          <tr key={key}>
                            <td>
                              <Link to={`/locations/view/${location?.id}`}>
                                {location?.name}
                              </Link>
                            </td>
                            <td>
                                {location?.state}
                            </td>
                            <td>
                                {location?.city}
                            </td>
                            <td>
                                {location?.zip}
                            </td>
                            <td>
                              <Link to={`/locations/${location?.id}/edit`}>
                                <button className="btn btn-primary btn-sm">
                                  <FontAwesomeIcon icon="edit" color="white" />
                                </button>
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={(event) => deleteLocation(location?.id)}
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
                              <Link to={`/locations/view/${location?.id}`}>
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
