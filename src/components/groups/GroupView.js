import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import GroupService from "../../services/GroupService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";

export default () => {
  const [group, setGroup] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [deleting, setDeleting] = useState(false);
  let history = useHistory();

  // User Id Extraction from URL
  let { id } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Groupes";
    fetchUser();
    return () => {
      ref.current = false;
    };
  }, []);

  const fetchUser = async () => {
    setUnauthorized(false);
    setLoading(true);
    setError(false);
    setGroup({});
    try {
      const group = await GroupService.getGroup(id);
      if (!group.hasOwnProperty("id")) {
        setGroup(null);
        setLoading(false);
        setError(false);
        setUnauthorized(false);
      } else {
        setGroup(group);
        setLoading(false);
        setError(false);
        setUnauthorized(false);
      }
    } catch (e) {
      const status = e.response?.status || null;
      setLoading(false);
      setGroup({});
      switch (status) {
        case 403:
          setUnauthorized(true);
          setError(false);
          break;
        case 404:
          setUnauthorized(false);
          setError(false);
          setGroup(null);
          break;
        default:
          setError(true);
          setUnauthorized(false);
      }
    }
  };

  const deleteGroup = async () => {
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
          history.push("/groups");
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
    <div className="content-wrapper bg-light pb-5 mb-5">
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Groups</div>
              </div>
            </div>

            {(error || unauthorized || group === null) && !loading && (
              <div className="col-10 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {error && "Une erreur est survenue!"}
                    {unauthorized && "Vous n'êtes pas autorisé!"}
                    {group === null && "Aucun group n'a été trouvé"}
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

            {loading && !error && group !== null && (
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

            {!loading && !error && !unauthorized && group !== null && (
              <>
                {/** USER DATA */}
                <div className="col-md-2 text-center mt-3 mb-3">
                  {ref.current && (
                    <img
                      src={`/dist/img/group.png?date=${Date.now()}`}
                      height="150"
                      width="150"
                      className="avatar img-circle hidden-print shadow shadow-sm"
                      style={{ border: "2px solid blue" }}
                      alt={`${group?.name}`}
                    />
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
                          <th scope="col">Name</th>
                          <td>{group?.name}</td>
                        </tr>
                      </thead>
                      <tbody align="center">
                        <tr>
                          <th scope="col">Roles</th>
                          <td>
                            <ul
                              className="list-group list-group-flush w-75 font-weight-bold text-secondary"
                              style={{
                                borderTop: "solid 2px blue",
                                letterSpacing: "1px",
                              }}
                            >
                              {group?.roles?.map((role, key) => (
                                <li className="list-group-item" key={key}>
                                  {role.roleName}
                                  {key === group.roles.length - 1 ? "" : " , "}
                                </li>
                              ))}
                              {(group?.roles === null || group?.roles?.length === 0) && (
                                <li className="list-group-item">
                                    <FontAwesomeIcon icon="exclamation-circle" /> Aucun role assigné a ce groupe
                              </li>
                              )}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="col-md-2 mx-auto mt-3 mb-3">
                  <Link to={`/groups/${group.id}/edit`}>
                    <button className="btn btn-secondary btn-sm">
                      <FontAwesomeIcon icon="user-edit" color="white" />
                    </button>
                  </Link>{" "}
                  <button
                    onClick={() => deleteGroup()}
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
