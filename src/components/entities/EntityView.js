import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import EntityService from "../../services/EntityService";
import Moment from "react-moment";

export default () => {
  const [entity, setEntity] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  let history = useHistory();

  // User Id Extraction from URL
  let { id } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Des Entités";
    fetchEntity();
    return () => {
      ref.current = false;
    };
  }, []);

  const fetchEntity = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setError(false);
    setEntity({});
    try {
      const threat = await EntityService.getEntity(id);
      if (!threat.hasOwnProperty("id")) {
        setEntity(null);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      } else {
        setEntity(threat);
        setIsLoading(false);
        setError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      const status = e?.response?.status || null;
      setIsLoading(false);
      setEntity({});
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setError(false);
          setEntity(null);
          break;
        default:
          setError(true);
          setIsUnAuthorized(false);
      }
    }
  };

  const deleteEntity = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer l'entité'?",
      text: "Voulez-vous supprimer l'entité?",
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
          await EntityService.deleteEntity(id);
          Swal.fire(
            "Operation éffectuée!",
            "L'entité à été supprimée avec succés!",
            "success"
          );
          history.push("/entities");
        } catch (err) {
          Swal.fire(
            "Erreur!",
            err?.response?.message ||
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
                <div className="ribbon bg-success text-lg">Entités</div>
              </div>
            </div>

            {(error || isUnAuthorized || entity === null) && !isLoading && (
              <div className="col-10 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {error && "Une erreur est survenue!"}
                    {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                    {entity === null && "Aucune entité n'a été trouvée"}
                    <button
                      onClick={() => fetchEntity()}
                      className="btn btn-warning font-weight-bold ml-2"
                    >
                      <FontAwesomeIcon icon="sync" /> Ressayer
                    </button>
                  </h2>
                </div>
              </div>
            )}

            {isLoading && !error && entity !== null && (
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

            {!isLoading && !error && !isUnAuthorized && entity !== null && (
              <>
                {/** THREAT DATA */}

                <div className="col-md-12 mx-auto mt-3 mb-3 text-center">
                  <Link to={`/entities/${entity?.id}/edit`}>
                    <button className="btn btn-secondary btn-sm">
                      <FontAwesomeIcon icon="edit" color="white" />
                    </button>
                  </Link>{" "}
                  <button
                    onClick={() => deleteEntity()}
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
                          <th scope="col">Nom de l'entité</th>
                          <td>{entity?.name}</td>
                        </tr>
                      </thead>
                      <tbody align="center">
                        <tr>
                          <th scope="col">Organisme</th>
                          <td>
                            <Link
                              to={`/organizations/view/${entity?.organization?.id}`}
                            >
                              {entity?.organization?.name}
                            </Link>
                          </td>
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
