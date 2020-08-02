import React, { useState, useEffect, useRef } from "react";
import GroupService from "../../services/GroupService";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CustomPagination from "../../pagination/components/custom-pagination/CustomPagination";
import CustomPaginationService from "../../pagination/services/CustomPaginationService";
import { Page } from "../../pagination/Page";

export default () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [groupsPage, setGroupsPage] = useState(new Page());
  const [deleting, setDeleting] = useState(false);
  const searchInput = useRef(null);
  document.title = "Gestion Groups";

  useEffect(() => {
    fetchGroups();
    return () => {
      setGroupsPage(null);
    };
  }, []);

  const fetchGroups = async () => {
    const search = searchInput?.current?.value || "";
    try {
      setLoading(true);
      setError(false);
      setUnauthorized(false);
      setGroupsPage(new Page());
      const response = await GroupService.getGroupsPage(
        search,
        groupsPage?.pageable || new Page()
      );
      console.log(response);
      setLoading(false);
      setGroupsPage(response);
      setError(false);
    } catch (e) {
      const status = e.response?.status || null;
      setLoading(false);
      setGroupsPage(null);
      if (status === 403) {
        setUnauthorized(true);
        setError(false);
      } else {
        setError(true);
        setUnauthorized(false);
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
    groupsPage.pageable = CustomPaginationService.getNextPage(groupsPage);
    fetchGroups();
  };

  const getPreviousPage = () => {
    groupsPage.pageable = CustomPaginationService.getPreviousPage(groupsPage);
    fetchGroups();
  };

  const getPageInNewSize = (pageSize) => {
    groupsPage.pageable = CustomPaginationService.getPageInNewSize(
      groupsPage,
      pageSize
    );
    fetchGroups();
  };

  const onSearchSubmit = async (event) => {
    event.preventDefault();
    // Search users
    if (!unauthorized && !error && !loading) {
      getPageInNewSize(20);
    }
  };

  const deleteGroup = async (id) => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer le groupe?",
      text: "Voulez-vous supprimer le groupe?",
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
          setDeleting(true);
          await GroupService.deleteGroup(id);
          Swal.fire(
            "Operation éffectuée!",
            "Le groupe à été supprimé avec succés!",
            "success"
          );
          // Clear search
          searchInput.current.value = "";
          // Fetch users
          fetchGroups();
        } catch (err) {
          console.log(err);
          Swal.fire(
            "Erreur!",
            err?.response?.data?.message ||
              `Une erreur est survenue, veuillez ressayer!`,
            "error"
          );
        } finally {
          setDeleting(false);
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
                <h1>Groupes</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Groupes</li>
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
              {!unauthorized && !error && !loading && (
                <div className="col-12 text-center">
                  <CustomPagination
                    page={groupsPage}
                    loading={loading}
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
                        placeholder="Nom du groupe ..."
                        name="search"
                        className="form-control"
                        ref={searchInput}
                        disabled={unauthorized || loading ? true : ""}
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
                <Link to="/groups/create" className="btn btn-primary btn-sm">
                  <FontAwesomeIcon icon="plus-circle" /> Ajouter un groupe
                </Link>
              </div>

              {/** DELTING PROGRESS */}
              {deleting && (
                <div className="col-12 mt-2 mb-3">
                  <div className="overlay text-center">
                    <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                  </div>
                </div>
              )}

              {!loading &&
                !error &&
                !unauthorized &&
                groupsPage?.content?.length > 0 && (
                  <div
                    className="card card-solid col-12"
                    style={{ borderTop: "2px solid blue" }}
                  >
                    <div className="card-body pb-0">
                      <div className="row d-flex align-items-stretch">
                        {groupsPage?.content?.map((group, key) => (
                          <div
                            className="col-12 col-sm-6 col-md-4 d-flex align-items-stretch justify-content-center mx-auto"
                            key={key}
                          >
                            <div
                              className="card bg-light"
                              style={{ borderTop: "2px solid blue" }}
                            >
                              <div className="card-header border-bottom-0 bg-dark text-white">
                                Groupe
                              </div>
                              <div className="card-body pt-0">
                                <div className="row">
                                  <div className="col-7">
                                    <h2 className="lead mt-4">
                                      <b>
                                        <Link to={`/groups/view/${group?.id}`}>
                                          {group?.name}
                                        </Link>
                                      </b>
                                    </h2>
                                  </div>
                                  <div className="col-5 text-center">
                                    <img
                                      src="/dist/img/group.png"
                                      alt={group?.id}
                                      className="img-circle img-fluid"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="card-footer">
                                <div className="text-right">
                                  <Link to={`/groups/${group.id}/edit`}>
                                    <button className="btn btn-primary btn-sm mr-3">
                                      <FontAwesomeIcon
                                        icon="edit"
                                        color="white"
                                      />
                                    </button>
                                  </Link>
                                  <button
                                    onClick={(event) => deleteGroup(group?.id)}
                                    className={`btn btn-danger btn-sm ${
                                      deleting ? "disabled" : ""
                                    }`}
                                  >
                                    <FontAwesomeIcon
                                      icon="trash-alt"
                                      color="white"
                                    />
                                  </button>
                                  <Link to={`/groups/view/${group?.id}`}>
                                    <button className="btn btn-light btn-sm ml-3">
                                      <FontAwesomeIcon
                                        icon="eye"
                                        color="black"
                                      />{" "}
                                      Voir le groupe
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {loading && (
                <div className="col-12 text-center">
                  {" "}
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              )}

              {!loading &&
                groupsPage !== null &&
                groupsPage?.content?.length === 0 && (
                  <div className="col-12">
                    <div colSpan={14} className="text-center alert alert-dark">
                      <h2 className="font-weight-bold">
                        <FontAwesomeIcon icon="exclamation-circle" /> Aucun
                        groupe trouvé!
                      </h2>
                    </div>
                  </div>
                )}

              {(error || unauthorized) && (
                <div className="col-12">
                  <div
                    colSpan={14}
                    className={`text-center alert ${
                      error ? "alert-warning" : "alert-danger"
                    }`}
                  >
                    <h2 className="font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {error
                        ? "Une erreur est survenue!"
                        : "Vous n'êtes pas autorisé!"}
                      <button
                        onClick={() => fetchGroups()}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>
                    </h2>
                  </div>
                </div>
              )}
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
