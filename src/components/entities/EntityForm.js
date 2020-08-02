import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import OrganizationService from "../../services/OrganizationService";
import EntityService from "../../services/EntityService";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default () => {
  const { register, handleSubmit, errors } = useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isEntityError, setIsEntityError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [entity, setEntity] = useState({});
  const [organizationsData, setOrganizationsData] = useState({
    isLoading: true,
    data: [],
  });
  document.title = "Gestion Des Menaces";

  // Id Extraction from URL
  let { id } = useParams();

  useEffect(() => {
    // Set loading
    setIsLoading(true);
    setIsEntityError(false);
    setIsUnauthorized(false);
    setEntity({});
    // Check user permissions
    UserService.canEditEntity()
      .then((response) => {
        if (response?.hasRole) {
          fetchOrganizations();
          // Get entity if id is not new
          if (id !== undefined) {
            fetchEntity();
          } else {
            setIsLoading(false);
            setEntity({});
          }
        } else {
          setIsUnauthorized(true);
          setIsEntityError(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsEntityError(false);
        } else {
          setIsUnauthorized(false);
          setIsEntityError(true);
        }
        setIsLoading(false);
      });
  }, [reload]);

  const fetchOrganizations = async () => {
    try {
      const organizations = await OrganizationService.getCustomOrganizations();
      setOrganizationsData({ loading: false, data: organizations });
    } catch (e) {
      setOrganizationsData({ loading: false, data: [] });
    }
  };

  const fetchEntity = async () => {
    try {
      // Get threat
      const entity = await EntityService.getEntity(id);
      if (entity.hasOwnProperty("id")) {
        setEntity(entity);
      } else {
        setEntity(null);
      }
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsEntityError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setEntity({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsEntityError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsEntityError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsEntityError(false);
          setEntity(null);
      }
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    EntityService.saveEntity({
      id,
      ...data,
    })
      .then((entity) => {
        setEntity(entity);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `L'entité à été enregistrée avec succés!`,
          "success"
        );
      })
      .catch((err) => {
        const status = err.response?.status || null;
        if (status !== null && status === 400) {
          Swal.fire(
            "Erreur!",
            `${
              err.response?.data.message ||
              "Les données d'entrées ne sont pas valides, veuillez ressayer!"
            }`,
            "error"
          );
        } else {
          Swal.fire(
            "Erreur!",
            `Une erreur interne est survenue, veuillez ressayer!`,
            "error"
          );
        }
        setIsSaving(false);
      });
  };

  return (
    <div
      className="content-wrapper bg-light pb-5"
      style={{ paddingBottom: "100rem" }}
    >
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Entités</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {id !== undefined &&
              entity !== null &&
              entity.hasOwnProperty("id") &&
              !isEntityError &&
              !isUnauthorized &&
              !isLoading && (
                <div className="col-12 text-center">
                  <Link
                    to={`/entities/view/${entity?.id}`}
                    type="button"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="backward" /> Retourner vers l'entité
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isEntityError || isUnauthorized || entity === null) &&
              !isLoading && (
                <div className="col-12 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="col-md-12 font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isEntityError && "Une erreur est survenue!"}
                      {isUnauthorized && "Vous n'êtes pas autorisé!"}
                      {entity === null && "Aucune entité n'a été trouvée"}
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>{" "}
                      <Link to={`/entities`}>
                        <button className="btn btn-light font-weight-bold ml-2">
                          <FontAwesomeIcon icon="building" /> Gestion des
                          entités
                        </button>
                      </Link>
                    </h2>
                  </div>
                </div>
              )}
            {isLoading && !isEntityError && entity !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** THREAT FORM */}
            {entity !== null &&
              !isEntityError &&
              !isUnauthorized &&
              !isLoading && (
                <div
                  className="col-md-9 mx-auto mt-4 bg-white shadow rounded"
                  style={{ borderTop: "2px solid blue" }}
                >
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="p-3 mb-5"
                  >
                    {/** NAME */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="name"
                      >
                        Nom:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Nom ..."
                          type="text"
                          id="name"
                          name="name"
                          defaultValue={entity?.name || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.name ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.name && errors.name.type === "required" && (
                          <div className="invalid-feedback">
                            Nom de l'entité est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** TYPOLOGY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="organization"
                      >
                        Organisme:
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={entity?.organization?.id || ""}
                          defaultChecked={entity?.organization?.id || ""}
                          onClick={(event) => {
                            if (
                              organizationsData?.data === null ||
                              organizationsData?.data?.length === 0
                            ) {
                              fetchOrganizations();
                            }
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.roles ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || organizationsData?.isLoading}
                          ref={register({
                            required: false,
                          })}
                          id="organization"
                          name="organization"
                        >
                          {organizationsData?.data?.map((organization, key) => (
                            <option key={key} value={organization?.id}>
                              {organization?.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-8 text-center mb-4 mt-4 mx-auto">
                      <button
                        disabled={isSaving}
                        type="submit"
                        className="btn btn-primary font-weight-bold text-center w-50"
                      >
                        {isSaving ? (
                          <>
                            <div
                              className="spinner-border spinner-border-sm text-light"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>{" "}
                            Enregistrement ...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon="save" /> Enregistrer
                          </>
                        )}
                      </button>
                    </div>

                    <hr />

                    <div className="col-12 text-center">
                      {(id !== undefined || entity.hasOwnProperty("id")) && (
                        <Link
                          to={`/entities/view/${entity?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="backward" /> Retourner vers
                          l'entité
                        </Link>
                      )}
                      <Link
                        to="/entities"
                        type="submit"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="building" /> Naviguer vers les
                        entités
                      </Link>
                    </div>
                  </form>
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
};
