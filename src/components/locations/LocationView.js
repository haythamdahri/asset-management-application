import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import LocationService from "../../services/LocationService";

export default (props) => {
  const [location, setLocation] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  let history = useHistory();

  // Id Extraction from URL
  let { id } = useParams();

  useEffect(() => {
    document.title = "Gestion Des Localisations";
    fetchLocation();
    return () => {
    };
  }, []);

  const fetchLocation = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setError(false);
    setLocation({});
    try {
      const location = await LocationService.getLocation(id);
      if (!location.hasOwnProperty("id")) {
        setLocation(null);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      } else {
        setLocation(location);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      const status = e?.response?.status || null;
      setIsLoading(false);
      setLocation({});
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setError(false);
          setLocation(null);
          break;
        default:
          setError(true);
          setIsUnAuthorized(false);
      }
    }
  };

  const deleteLocation = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer la localisation?",
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
          history.push("/locations");
        } catch (err) {
          Swal.fire(
            "Erreur!",
            err?.response?.data?.message ||
              `Une erreur est survenue, veuillez ressayer!`,
            "error"
          );
          setIsDeleting(false);
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
                <div className="ribbon bg-success text-lg">Localisation</div>
              </div>
            </div>

            {(error || isUnAuthorized || location === null) &&
              !isLoading && (
                <div className="col-10 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {error && "Une erreur est survenue!"}
                      {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                      {location === null &&
                        "Aucune localisation n'a été trouvée"}
                      <button
                        onClick={() => fetchLocation()}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>
                    </h2>
                  </div>
                </div>
              )}

            {isLoading && !error && location !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** DELTING PROGRESS */}
            {isDeleting && (
              <div className="col-12 mt-2 mb-3">
                <div className="overlay text-center">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {!isLoading &&
              !error &&
              !isUnAuthorized &&
              location !== null && (
                <>
                  {/** THREAT DATA */}

                  <div className="col-md-12 mx-auto mt-3 mb-3 text-center">
                    <Link
                      to={`/locations/${location?.id}/edit`}
                    >
                      <button className="btn btn-secondary btn-sm">
                        <FontAwesomeIcon icon="edit" color="white" />
                      </button>
                    </Link>{" "}
                    <button
                      onClick={() => deleteLocation()}
                      className="btn btn-danger btn-sm"
                      disabled={isDeleting ? "disabled" : ""}
                    >
                      <FontAwesomeIcon icon="trash-alt" color="white" />
                    </button>
                  </div>
                  <div
                    className="col-md-12 bg-white mx-auto mt-3 mb-3"
                    style={{ borderTop: "blue solid 2px" }}
                  >
                    <div className="table table-responsive float-left">
                      <table className="table table-striped">
                        <thead align="center">
                          <tr>
                            <th scope="col">Nom</th>
                            <td>{location?.name}</td>
                          </tr>
                          <tr>
                            <th scope="col">Image</th>
                            <td>
                            <img
                                    src={`${process.env.REACT_APP_API_URL}/api/v1/locations/${location?.id}/image/file`}
                                    alt={location?.name}
                                    className="img-fluid img-circle"
                                    style={{
                                      height: "50px",
                                      width: "50px",
                                      cursor: "pointer",
                                    }}
                                  />
                            </td>
                          </tr>
                        </thead>
                        <tbody align="center">
                          <tr>
                            <th scope="col">Adresse 1</th>
                            <td>{location?.address1}</td>
                          </tr>
                          <tr>
                            <th scope="col">Adresse 2</th>
                            <td>{location?.address2}</td>
                          </tr>
                          <tr>
                            <th scope="col">Pays 2</th>
                            <td>{location?.country}</td>
                          </tr>
                          <tr>
                            <th scope="col">Région</th>
                            <td>{location?.state}</td>
                          </tr>
                          <tr>
                            <th scope="col">Ville</th>
                            <td>{location?.city}</td>
                          </tr>
                          <tr>
                            <th scope="col">Code postal</th>
                            <td>{location?.zip}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
      </section>
    </div>
  );
};