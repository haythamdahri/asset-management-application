import React, { useState, useEffect, useRef } from "react";
import UserService from "../../services/UserService";
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
  const [usersPage, setUsersPage] = useState(new Page());
  const [deleting, setDeleting] = useState(false);
  const searchInput = useRef(null);

  useEffect(() => {
    document.title = "Gestion Utilisateurs";
    fetchUsers();
    return () => {
      setUsersPage(null);
    };
  }, []);

  const fetchUsers = async () => {
    const search = searchInput?.current?.value || "";
    try {
      setLoading(true);
      setError(false);
      setUnauthorized(false);
      setUsersPage(new Page());
      const response = await UserService.getUsersPage(
        search,
        usersPage?.pageable || new Page()
      );
      setLoading(false);
      setUsersPage(response);
      setError(false);
    } catch (e) {
      const status = e.response?.status || null;
      setLoading(false);
      setUsersPage(null);
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
    usersPage.pageable = CustomPaginationService.getNextPage(usersPage);
    fetchUsers();
  };

  const getPreviousPage = () => {
    usersPage.pageable = CustomPaginationService.getPreviousPage(usersPage);
    fetchUsers();
  };

  const getPageInNewSize = (pageSize) => {
    usersPage.pageable = CustomPaginationService.getPageInNewSize(
      usersPage,
      pageSize
    );
    fetchUsers();
  };

  const onSearchSubmit = async (event) => {
    event.preventDefault();
    // Search users
    if (!unauthorized && !error && !loading) {
      getPageInNewSize(20);
    }
  };

  const deleteUser = async (id) => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer l'utilisateur?",
      text: "Voulez-vous supprimer l'utilisateur?",
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
          await UserService.deleteUser(id);
          Swal.fire(
            "Operation éffectuée!",
            "L'utilisateur à été supprimé avec succés!",
            "success"
          );
          // Clear search
          searchInput.current.value = "";
          // Fetch users
          fetchUsers();
        } catch (err) {
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
                <h1>Users</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <FontAwesomeIcon icon="home" /> Acceuil
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Utilisateurs</li>
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
                    page={usersPage}
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
                        placeholder="Nom, Username, Email, Website, Zip ..."
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
                <Link to="/users/create" className="btn btn-primary btn-sm">
                  <FontAwesomeIcon icon="user-plus" /> Ajouter un utilisateur
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

              <div
                className="col-12 bg-white p-2 shadow shadow-sm rounded mb-5"
                style={{ borderTop: "black 2px solid" }}
              >
                <div className="table-responsive">
                  <table className="table table-hover table-bordered ">
                    <thead className="thead-light text-center">
                      <tr>
                        <th>Nom</th>
                        <th>Titre</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Username</th>
                        <th>Département</th>
                        <th>Localisation</th>
                        <th>Manager</th>
                        <th>Notes</th>
                        <th>Groupes</th>
                        <th>Connexion activée</th>
                        <th colSpan={3}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {loading && (
                        <tr>
                          <td colSpan={14} className="text-center bg-light">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading &&
                        usersPage !== null &&
                        usersPage?.content?.length === 0 && (
                          <tr>
                            <td
                              colSpan={14}
                              className="text-center alert alert-dark"
                            >
                              <h2 className="font-weight-bold">
                                <FontAwesomeIcon icon="exclamation-circle" />{" "}
                                Aucun utilisateur trouvé!
                              </h2>
                            </td>
                          </tr>
                        )}
                      {(error || unauthorized) && (
                        <tr>
                          <td
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
                                onClick={() => fetchUsers()}
                                className="btn btn-warning font-weight-bold ml-2"
                              >
                                <FontAwesomeIcon icon="sync" /> Ressayer
                              </button>
                            </h2>
                          </td>
                        </tr>
                      )}

                      {usersPage &&
                        usersPage?.content?.map((user, key) => (
                          <tr key={key}>
                            <td>
                              <Link to={`/users/view/${user.id}`}>
                                {user.firstName} {user.lastName}
                              </Link>
                            </td>
                            <td>{user.title}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.username}</td>
                            <td>{user.entity?.name}</td>
                            <td>
                              <Link to={`/locations/view/${user.location?.id}`}>
                                {user.location?.name}
                              </Link>
                            </td>
                            <td>
                              <Link to={`/users/view/${user.manager?.id}`}>
                                {user.manager
                                  ? user.manager?.firstName +
                                    " " +
                                    user.manager?.lastName
                                  : ""}
                              </Link>
                            </td>
                            <td
                              dangerouslySetInnerHTML={{
                                __html: `${user.notes.slice(0, 20)} ${user.notes.length > 20 ? '...' : ''}`,
                              }}
                            ></td>
                            <td>
                              {user.groups?.map((group, key) => (
                                <Link to={`/groups/view/${group.id}`} key={key}>
                                  {group.name}
                                  {key === user.groups.length - 1 ? "" : ","}
                                </Link>
                              ))}
                            </td>
                            <td>
                              {user.active ? (
                                <FontAwesomeIcon
                                  icon="check-circle"
                                  color="green"
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon="times-circle"
                                  color="red"
                                />
                              )}
                            </td>
                            <td>
                              <Link to={`/users/${user.id}/edit`}>
                                <button className="btn btn-primary btn-sm">
                                  <FontAwesomeIcon
                                    icon="user-edit"
                                    color="white"
                                  />
                                </button>
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={(event) => deleteUser(user?.id)}
                                className={`btn btn-danger btn-sm ${
                                  deleting ? "disabled" : ""
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon="user-minus"
                                  color="white"
                                />
                              </button>
                            </td>
                            <td>
                              <Link to={`/users/view/${user?.id}`}>
                                <button className="btn btn-secondary btn-sm">
                                  <FontAwesomeIcon
                                    icon="street-view"
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
