import React, { useState, useEffect } from "react";
import UserService from "../services/UserService";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";

export default () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [users, setUsers] = useState([]);
  let active = true;

  useEffect(() => {
    fetchUsers();
    return () => {
      active = false;
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(false);
      setUnauthorized(false);
      const users = await UserService.getUsers();
      if (active) {
        setLoading(false);
        setUsers(users);
        setError(false);
      }
    } catch (e) {
      if (active) {
        const status = e.response.status;
        setLoading(false);
        setUsers(null);
        if (status === 403 && active) {
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
      }
    }
  };

  return (
    <div>
      {/* Content Wrapper. Contains page content */}
      <div className="content-wrapper">
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
                        <th>Connexion activé</th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {loading && (
                        <tr>
                          <td colSpan={11} className="text-center bg-light">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading && users !== null && users.length === 0 && (
                        <tr>
                          <td
                            colSpan={11}
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
                            colSpan={11}
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

                      {users &&
                        users.map((user, key) => (
                          <tr key={key}>
                            <td>
                              {user.firstName} {user.lastName}
                            </td>
                            <td>{user.title}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.username}</td>
                            <td>{user.department.name}</td>
                            <td>{user.location.name}</td>
                            <td>{user.manager ? user.manager.name : ""}</td>
                            <td>{user.notes}</td>
                            <td>{user.groupes}</td>
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
