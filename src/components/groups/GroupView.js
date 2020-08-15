import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import GroupService from "../../services/GroupService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
        // Associate js files
        const script = document.createElement("script");
        script.src = "/js/content.js";
        script.async = true;
        document.body.appendChild(script);
      }
    } catch (e) {
      const status = e?.response?.status || null;
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
                <div className="ribbon bg-success text-lg">Groupe</div>
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
                      <FontAwesomeIcon icon="sync" /> Ressayer {unauthorized}
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
                    <table className="table">
                      <thead align="center">
                        <tr>
                          <th scope="col">Nom</th>
                          <td>{group?.name}</td>
                        </tr>
                      </thead>
                      <tbody align="center">
                        <tr className="bg-light">
                          <th scope="col">Description</th>
                          <td>
                            {group?.description &&
                              group?.description?.length > 0 && (
                                <CKEditor
                                  editor={ClassicEditor}
                                  data={group?.description}
                                  config={{
                                    toolbar: [],
                                    removePlugins: ["Heading", "Link"],
                                    isReadOnly: true,
                                  }}
                                  disabled={true}
                                />
                              )}
                          </td>
                        </tr>
                        <tr>
                          <th scope="col">Roles</th>
                          <td>
                            <div className="col-sm-12">
                              <table
                                id="permissions"
                                className="table table-bordered table-striped dataTable dtr-inline"
                                role="grid"
                                aria-describedby="permissions_info"
                              >
                                <thead align="center">
                                  <tr role="row">
                                    <th>Role</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody align="center">
                                  {group?.roles?.map((role, key) => (
                                    <tr key={key}>
                                      <th scope="col">{role?.roleName}</th>
                                      <td>
                                        <button
                                          data-toggle="popover"
                                          title="Role"
                                          data-placement="left"
                                          data-trigger="focus"
                                          data-content={
                                            role?.description || role?.roleName
                                          }
                                          className="btn btn-outline-primary btn-sm"
                                        >
                                          <FontAwesomeIcon icon="eye" /> Voir
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="col-md-2 mx-auto mt-3 mb-3">
                  <Link to={`/groups/${group.id}/edit`}>
                    <button className="btn btn-secondary btn-sm">
                      <FontAwesomeIcon icon="edit" color="white" />
                    </button>
                  </Link>{" "}
                  <button
                    onClick={() => deleteGroup()}
                    className="btn btn-danger btn-sm"
                    disabled={deleting ? "disabled" : ""}
                  >
                    <FontAwesomeIcon icon="trash-alt" color="white" />
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
