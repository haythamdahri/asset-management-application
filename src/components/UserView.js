import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import UserService from "../services/UserService";
import { IMAGE_URL } from "../services/ConstantsService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  // User Id Extraction from URL
  let { id } = useParams();
  let active = true;

  useEffect(() => {
    document.title = "Gestion Utilisateurs";
    fetchUser();
    return () => {
      active = false;
    };
  }, []);

  const fetchUser = async () => {
    setUnauthorized(false);
    setLoading(true);
    setError(false);
    setUser({});
    try {
      const user = await UserService.getUser(id);
      console.log(user);
      if (!user.hasOwnProperty("id")) {
        setUser(null);
        setLoading(false);
        setError(false);
        setUnauthorized(false);
      } else {
        if( user.avatar !== null ) {
          user.avatar.file = IMAGE_URL + "/" + user?.avatar?.id + "/file";
        }
        if (active) {
          setUser(user);
          setLoading(false);
          setError(false);
          setUnauthorized(false);
        }
      }
    } catch (e) {
      console.log(e);
      if (active) {
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
    }
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
            {!loading && !error && !unauthorized && user !== null && (
              <>
                {/** USER DATA */}
                <div className="col-md-2 text-center mt-3 mb-3">
                  <img
                    src={user?.avatar?.file}
                    height="150"
                    width="150"
                    className="avatar img-circle hidden-print shadow shadow-sm"
                    style={{ border: "2px solid blue" }}
                    alt={"User" + user?.id}
                  />
                </div>
                <div
                  className="col-md-8 bg-white mx-auto mt-3 mb-3"
                  style={{ borderTop: "blue solid 2px" }}
                >
                  <div className="table table-responsive float-left">
                    <table className="table table-striped">
                      <thead align="center">
                        <tr>
                          <th scope="col">Société</th>
                          <td>{user?.company?.name}</td>
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
                          <th scope="col">Département</th>
                          <td>
                            <Link to={`/departments/${user?.department?.id}`}>
                              {user?.department?.name}
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <th scope="col">Crée le</th>
                          <td>{user?.creationDate}</td>
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
                  <button className="btn btn-danger btn-sm">
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
