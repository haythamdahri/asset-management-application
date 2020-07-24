import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import OrganizationService from "../../services/OrganizationService";
import UserService from "../../services/UserService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { SRLWrapper } from "simple-react-lightbox";

export default () => {
  const [organization, setOrganization] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [usersMore, setUsersMore] = useState({
    expanded: false,
    itemsCount: 5,
  });
  let history = useHistory();
  const aborderController = new AbortController();

  // User Id Extraction from URL
  let { id } = useParams();
  const ref = useRef(true);

  useEffect(() => {
    document.title = "Gestion Organismes";
    fetchOrganization();
    return () => {
      ref.current = false;
    };
  }, []);

  const fetchOrganization = async () => {
    setIsUnAuthorized(false);
    setIsLoading(true);
    setIsError(false);
    setOrganization({});
    try {
      const organization = await OrganizationService.getOrganization(id);
      organization.image.file = `${process.env.REACT_APP_API_URL}/api/v1/organizations/${organization?.id}/image/file`;
      if (!organization.hasOwnProperty("id")) {
        setOrganization(null);
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
      } else {
        setOrganization({ ...organization });
        setIsLoading(false);
        setIsError(false);
        setIsUnAuthorized(false);
      }
    } catch (e) {
      console.log(e);
      const status = e?.response?.status || null;
      setIsLoading(false);
      setOrganization({});
      console.log(status)
      switch (status) {
        case 403:
          setIsUnAuthorized(true);
          setIsError(false);
          break;
        case 404:
          setIsUnAuthorized(false);
          setIsError(false);
          setOrganization(null);
          break;
        default:
          setIsError(true);
          setIsUnAuthorized(false);
      }
    };
    return () => {
      aborderController.abort();
    }
  };

  const deleteOrganization = async () => {
    // Confirm User Deletion
    Swal.fire({
      title: "Êtes-vous sûr de supprimer l'organisme?",
      text: "Voulez-vous supprimer l'organisme?",
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
          history.push("/groups");
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
                <div className="ribbon bg-success text-lg">Organisme</div>
              </div>
            </div>

            {(isError || isUnAuthorized || organization === null) &&
              !isLoading && (
                <div className="col-10 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isError && "Une erreur est survenue!"}
                      {isUnAuthorized && "Vous n'êtes pas autorisé!"}
                      {organization === null &&
                        "Aucun organisme n'a été trouvé"}
                      <button
                        onClick={() => fetchOrganization()}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>
                    </h2>
                  </div>
                </div>
              )}

            {isLoading && !isError && organization !== null && (
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
              !isError &&
              !isUnAuthorized &&
              organization !== null && (
                <>
                  {/** USER DATA */}
                  <div className="col-md-2 text-center mt-3 mb-3">
                    <SRLWrapper>
                      {!isLoading && organization !== null ? (
                        <a
                          href={`${
                            organization?.image?.file
                          }?date=${Date.now()}&loading=${isLoading}`}
                          data-attribute="SRL"
                        >
                          <img
                            className="profile-user-img img-fluid img-thumbnail shadow shadow-sm"
                            src={
                              !isLoading && organization !== null
                                ? `${
                                    organization?.image?.file
                                  }?date=${Date.now()}&loading=${isLoading}`
                                : `/dist/img/boxed-bg.jpg?date=${Date.now()}&loading=${isLoading}`
                            }
                            alt={organization?.name}
                            style={{
                              border: "2px solid blue",
                              maxHeight: "150px",
                              height: "100%",
                              width: "150px",
                              cursor: "pointer",
                            }}
                          />
                        </a>
                      ) : (
                        <img
                          className="profile-user-img img-fluid img-circle"
                          src="/dist/img/boxed-bg.jpg"
                          alt={organization?.name}
                          style={{
                            border: "2px solid blue",
                            maxHeight: "150px",
                            height: "100%",
                            width: "150px",
                            cursor: "pointer",
                          }}
                        />
                      )}
                    </SRLWrapper>
                  </div>
                  <div
                    className="col-md-8 bg-white mx-auto mt-3 mb-3"
                    style={{ borderTop: "blue solid 2px" }}
                  >
                    <div className="card-header d-flex p-0">
                      <ul className="nav nav-tabs nav-pills with-arrow lined flex-column flex-sm-row text-center col-12">
                        <li className="nav-item flex-sm-fill">
                          <a
                            className="nav-link active"
                            href="#organizations"
                            data-toggle="tab"
                          >
                            Organisme
                          </a>
                        </li>
                        <li className="nav-item flex-sm-fill">
                          <a
                            className="nav-link"
                            href="#employees"
                            data-toggle="tab"
                          >
                            Employés
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="card-body">
                      <div className="tab-content">
                        <div className="tab-pane active" id="organizations">
                          <div className="table table-responsive float-left">
                            <table className="table table-striped">
                              <thead align="center">
                                <tr>
                                  <th scope="col">Nom</th>
                                  <td>{organization?.name}</td>
                                </tr>
                              </thead>
                              <tbody align="center">
                                <tr>
                                  <th scope="col">Description</th>
                                  <td>
                                    {organization?.description &&
                                      organization?.description?.length > 0 && (
                                        <CKEditor
                                          editor={ClassicEditor}
                                          data={organization?.description}
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
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {/* /.tab-pane */}
                        <div className="tab-pane" id="employees">
                          <div className="col-12">
                            <ul
                              className="list-group list-group-flush font-weight-bold text-secondary text-center"
                              style={{
                                borderTop: "solid 2px blue",
                                letterSpacing: "1px",
                              }}
                            >
                              {!isLoading &&
                                organization?.users?.map((user, key) => (
                                  <div key={key}>
                                    {key < usersMore.itemsCount && (
                                      <li className="list-group-item" key={key}>
                                        <Link to={`/users/view/${user?.id}`}>
                                          {user?.firstName} {user?.lastName}
                                        </Link>
                                      </li>
                                    )}
                                  </div>
                                ))}
                              {organization?.users?.length > 5 &&
                                !usersMore.expanded && (
                                  <Link
                                    to="#"
                                    onClick={() =>
                                      setUsersMore({
                                        itemsCount: organization?.users?.length,
                                        expanded: true,
                                      })
                                    }
                                  >
                                    Voir plus
                                  </Link>
                                )}
                              {organization?.users?.length > 5 &&
                                usersMore.expanded && (
                                  <Link
                                    to="#"
                                    onClick={() =>
                                      setUsersMore({
                                        itemsCount: 5,
                                        expanded: false,
                                      })
                                    }
                                  >
                                    Voir moins
                                  </Link>
                                )}

                              {(!isLoading &&
                                (organization?.users?.length === 0 || organization?.users === null)) && (
                                <li className="list-group-item">
                                  <FontAwesomeIcon icon="exclamation-circle" />{" "}
                                  Aucun utilisateur n'a rejoint l'organisme
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                      {/* /.tab-content */}
                    </div>
                  </div>

                  <div className="col-md-2 mx-auto mt-3 mb-3">
                    <Link to={`/organizations/${organization.id}/edit`}>
                      <button className="btn btn-secondary btn-sm">
                        <FontAwesomeIcon icon="edit" color="white" />
                      </button>
                    </Link>{" "}
                    <button
                      onClick={() => deleteOrganization()}
                      className="btn btn-danger btn-sm"
                      disabled={isDeleting ? "disabled" : ""}
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
