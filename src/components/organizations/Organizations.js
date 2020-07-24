import React, { useState, useRef, useEffect } from "react";
import CustomPagination from "../../pagination/components/custom-pagination/CustomPagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { Page } from "../../pagination/Page";
import OrganizationService from "../../services/OrganizationService";
import Swal from "sweetalert2";
import CustomPaginationService from "../../pagination/services/CustomPaginationService";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [organizationsPage, setOrganizationsPage] = useState(new Page());
  const [isDeleting, setIsDeleting] = useState(false);
  const searchInput = useRef(null);

  document.title = "Gestion Organismes";

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const search = searchInput?.current?.value || "";
    try {
      setIsLoading(true);
      setIsError(false);
      setIsUnAuthorized(false);
      setOrganizationsPage(new Page());
      const response = await OrganizationService.getOrganizationsPage(
        search,
        organizationsPage?.pageable || new Page()
      );
      setIsLoading(false);
      setOrganizationsPage(response);
      setIsError(false);
    } catch (e) {
      const status = e.response?.status || null;
      setIsLoading(false);
      setOrganizationsPage(null);
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
    organizationsPage.pageable = CustomPaginationService.getNextPage(
      organizationsPage
    );
    fetchOrganizations();
  };

  const getPreviousPage = () => {
    organizationsPage.pageable = CustomPaginationService.getPreviousPage(
      organizationsPage
    );
    fetchOrganizations();
  };

  const getPageInNewSize = (pageSize) => {
    organizationsPage.pageable = CustomPaginationService.getPageInNewSize(
      organizationsPage,
      pageSize
    );
    fetchOrganizations();
  };

  const onSearchSubmit = async (event) => {
    event.preventDefault();
    // Search users
    if (!isUnAuthorized && !isError && !isLoading) {
      getPageInNewSize(20);
    }
  };

  const deleteOrganization = async (id) => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer l'organization?",
      text: "Voulez-vous supprimer l'organization?",
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
          await OrganizationService.deleteOrganization(id);
          Swal.fire(
            "Operation éffectuée!",
            "L'organisme à été supprimé avec succés!",
            "success"
          );
          // Clear search
          searchInput.current.value = "";
          // Fetch users
          fetchOrganizations();
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
                <h1>Users</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Organizations</li>
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
                    page={organizationsPage}
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
                        placeholder="Nom organisme, descirption..."
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
                <Link to="/organizations/create" className="btn btn-primary btn-sm">
                  <FontAwesomeIcon icon="user-plus" /> Ajouter un organisme
                </Link>
              </div>

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
                organizationsPage?.content?.length > 0 &&
                organizationsPage?.content?.map((organization, key) => (
                  <div 
                    key={key}
                    className="card col-sm-12 col-md-5 col-lg-5 col-xl-5 mx-auto p-2 bg-white shadow shadow-sm rounded mb-4 callout callout-success"
                  >
                      <div className="row no-gutters">
                        <div className="col-md-4">
                          <img
                            src={`${process.env.REACT_APP_API_URL}/api/v1/organizations/${organization?.id}/image/file`}
                            className="card-img"
                            alt={`organization${organization?.id}`}
                          />
                        </div>
                        <div className="col-md-8">
                          <div className="card-body">
                            <h1 className="card-title mb-5 font-weight-bold">{organization?.name}</h1>
                            <p className="card-text  mt-5">
                              <small className="text-muted mx-auto text-center block-center">
                                <Link
                                  to={`/organizations/${organization.id}/edit`}
                                >
                                  <button className="btn btn-primary btn-sm mr-3">
                                    <FontAwesomeIcon
                                      icon="edit"
                                      color="white"
                                    />
                                  </button>
                                </Link>
                                <button
                                  onClick={(event) =>
                                    deleteOrganization(organization?.id)
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
                                <Link
                                  to={`/organizations/view/${organization?.id}`}
                                >
                                  <button className="btn btn-light btn-sm ml-3">
                                    <FontAwesomeIcon icon="eye" color="black" />{" "}
                                    Voir l'organisme
                                  </button>
                                </Link>
                              </small>
                            </p>
                          </div>
                        </div>
                      </div>
                  </div>
                ))}

              {isLoading && (
                <div className="col-12 text-center">
                  {" "}
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              )}

              {!isLoading &&
                organizationsPage !== null &&
                organizationsPage?.content?.length === 0 && (
                  <div className="col-12">
                    <div colSpan={14} className="text-center alert alert-dark">
                      <h2 className="font-weight-bold">
                        <FontAwesomeIcon icon="exclamation-circle" /> Aucun
                        organisme trouvé!
                      </h2>
                    </div>
                  </div>
                )}

              {(isError || isUnAuthorized) && (
                <div className="col-12">
                  <div
                    colSpan={14}
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
                        onClick={() => fetchOrganizations()}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>
                    </h2>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
