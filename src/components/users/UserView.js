import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import UserService from "../../services/UserService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Moment from "react-moment";
import Swal from "sweetalert2";
import { SRLWrapper } from "simple-react-lightbox";

export default () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [deleting, setDeleting] = useState(false);
  let history = useHistory();

  // User Id Extraction from URL
  let { id } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Utilisateurs";
    fetchUser();
    return () => {
      ref.current = false;
    };
  }, []);

  const fetchUser = async () => {
    setUnauthorized(false);
    setLoading(true);
    setError(false);
    setUser({});
    try {
      const user = await UserService.getUser(id);
      if (!user.hasOwnProperty("id")) {
        setUser(null);
        setLoading(false);
        setError(false);
        setUnauthorized(false);
      } else {
        if (user.avatar !== null) {
          user.avatar.file = process.env.REACT_APP_API_URL + "/api/v1/users/" + user?.id + "/avatar/file";
        }
        setUser(user);
        setLoading(false);
        setError(false);
        setUnauthorized(false);
      }
    } catch (e) {
      const status = e.response?.status || null;
      setLoading(false);
      setUser({});
      switch (status) {
        case 403:
          setUnauthorized(true);
          setError(false);
          break;
        case 404:
          setUnauthorized(false);
          setError(false);
          setUser(null);
          break;
        default:
          setError(true);
          setUnauthorized(false);
      }
    }
  };

  const deleteUser = async () => {
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
          history.push("/users");
        } catch (err) {
          Swal.fire(
            "Erreur!",
            err?.response?.data?.message ||
              `Une erreur est survenue, veuillez ressayer!`,
            "error"
          );
          setDeleting(false);
        }
      }
    });
  };

  return (
    <div className="content-wrapper bg-light pb-5">
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Utilisateur</div>
              </div>
            </div>

            {(error || unauthorized || user === null) && !loading && (
              <div className="col-10 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {error && "Une erreur est survenue!"}
                    {unauthorized && "Vous n'êtes pas autorisé!"}
                    {user === null && "Aucun utilisateur n'a été trouvé"}
                    <button
                      onClick={() => fetchUser()}
                      className="btn btn-warning font-weight-bold ml-2"
                    >
                      <FontAwesomeIcon icon="sync" /> Ressayer
                    </button>
                  </h2>
                </div>
              </div>
            )}

            {loading && !error && user !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** DELTING PROGRESS */}
            {deleting && (
              <div className="col-12 mt-2 mb-3">
                <div className="overlay text-center">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {!loading && !error && !unauthorized && user !== null && (
              <>
                {/** USER DATA */}
                <div className="col-md-2 text-center mt-3 mb-3">
                  {ref.current && (
                    <SRLWrapper>
                    <a href={`${user?.avatar?.file}?date=${Date.now()}`} data-attribute="SRL">
                      <img
                        src={`${user?.avatar?.file}?date=${Date.now()}`}
                        height="150"
                        width="150"
                        className="avatar img-circle hidden-print shadow shadow-sm"
                        style={{ border: "2px solid blue" }}
                        alt={`${user?.firstName} ${user?.lastName}`}
                      />
                      </a>
                      </SRLWrapper>
                  )}
                </div>
                <div
                  className="col-md-8 bg-white mx-auto mt-3 mb-3"
                  style={{ borderTop: "blue solid 2px" }}
                >
                  <div className="table table-responsive float-left">
                    <table className="table table-striped">
                      <thead align="center">
                        <tr>
                          <th scope="col">Organisme</th>
                          <td>{user?.organization?.name}</td>
                        </tr>
                      </thead>
                      <tbody align="center">
                        <tr>
                          <th scope="col">Nom</th>
                          <td>{`${user?.firstName} ${user?.lastName}`}</td>
                        </tr>
                        <tr>
                          <th scope="col">Username</th>
                          <td>{user?.username}</td>
                        </tr>
                        <tr>
                          <th scope="col">Groups</th>
                          <td>
                            {user?.groups?.map((group, key) => (
                              <Link to={`/groups/${group.id}`} key={key}>
                                {group.name}
                                {key === user.groups.length - 1 ? "" : " , "}
                              </Link>
                            ))}
                          </td>
                        </tr>
                        <tr>
                          <th scope="col">Poste</th>
                          <td>{user?.jobTitle}</td>
                        </tr>
                        <tr>
                          <th scope="col">Numéro d'employé</th>
                          <td>{user?.employeeNumber}</td>
                        </tr>
                        <tr>
                          <th scope="col">Email</th>
                          <td>{user?.email}</td>
                        </tr>
                        <tr>
                          <th scope="col">Téléphone</th>
                          <td>{user?.phone}</td>
                        </tr>
                        <tr>
                          <th scope="col">Localisation</th>
                          <td>
                            <Link to={`/locations/${user?.location?.id}`}>
                              {user?.location?.name}
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <th scope="col">Entité</th>
                          <td>
                            <Link to={`/entities/${user?.entity?.id}`}>
                              {user?.entity?.name}
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <th scope="col">Crée le</th>
                          <td>
                            <Moment format="YYYY/MM/DD HH:MM:SS">
                              {user?.creationDate}
                            </Moment>
                          </td>
                        </tr>
                        <tr>
                          <th scope="col">Connexion activée</th>
                          <td>{user?.active ? "Oui" : "Non"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="col-md-2 mx-auto mt-3 mb-3">
                  <Link to={`/users/${user.id}/edit`}>
                    <button className="btn btn-secondary btn-sm">
                      <FontAwesomeIcon icon="user-edit" color="white" />
                    </button>
                  </Link>{" "}
                  <button
                    onClick={() => deleteUser()}
                    className="btn btn-danger btn-sm"
                    disabled={deleting ? "disabled" : ""}
                  >
                    <FontAwesomeIcon icon="user-minus" color="white" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
