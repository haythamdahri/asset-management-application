import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import OrganizationService from "../../services/OrganizationService";
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
  const [isOrganizationError, setIsOrganizationError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [organization, setOrganization] = useState({});
  const [file, setFile] = useState(new File([], ""));

  // Organization Id Extraction from URL
  let { id } = useParams();
  document.title = "Gestion Organismes";

  useEffect(() => {
    // Set loading
    setIsLoading(true);
    setIsOrganizationError(false);
    setIsUnauthorized(false);
    setOrganization({});
    // Check user permissions
    UserService.canEditOrganization()
      .then((response) => {
          if( response.hasRole ) {
            // Get group if id is not new
            if (id !== undefined) {
              fetchOrganization();
            } else {
              setIsLoading(false);
              setOrganization({});
            }
          } else {
              setIsLoading(false);
              setIsUnauthorized(true);
              setIsOrganizationError(false);
          }
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsOrganizationError(false);
        } else {
          setIsUnauthorized(false);
          setIsOrganizationError(true);
        }
        setIsLoading(false);
      });
  }, [reload]);

  const fetchOrganization = async () => {
    try {
      // Get process
      const organization = await OrganizationService.getOrganization(id);
      setOrganization(organization);
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsOrganizationError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setOrganization({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsOrganizationError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsOrganizationError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsOrganizationError(true);
      }
    }
  };

  const onEditorChange = (event, editor) => {
    setOrganization({ ...organization, description: editor.getData() });
  };

  const onSubmit = async (data) => {
    // Verify if data has file in case of update
    if (
        (data.updateImage !== null &&
          data.updateImage === true &&
          (file?.size === 0 || file === undefined || file === null)) ||
        (!organization.hasOwnProperty("id") && file?.size === 0)
      ) {
        Swal.fire(
          "L'image d'organisme est invalide!",
          "Veuillez selectionner un fichier valide!",
          "error"
        );
        return;
      }
       // Set FormData
    let formData = new FormData();
    formData.set("image", file);
    formData.set("id", organization?.id || null);
    formData.set("name", data?.name || "");
    formData.set("description", organization?.description || "");
    formData.set("updateImage", data?.updateImage || false);
    setIsSaving(true);
    OrganizationService.saveOrganization(formData)
      .then((orgnization) => {
        setOrganization(orgnization);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `L'organisme à été enregistré avec succés!`,
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
    <div className="content-wrapper bg-light pb-5">
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Groupe</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {(id !== undefined || organization.hasOwnProperty("id")) &&
              !isOrganizationError &&
              !isUnauthorized &&
              !isLoading && (
                <div className="col-12 text-center">
                  <Link
                    to={`/organizations/view/${organization?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="user" /> Retourner vers l'organisme
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isOrganizationError || isUnauthorized || organization === null) && !isLoading && (
              <div className="col-12 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="col-md-12 font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {isOrganizationError && "Une erreur est survenue!"}
                    {isUnauthorized && "Vous n'êtes pas autorisé!"}
                    {organization === null && "Aucun organisme n'a été trouvé"}
                    <button
                      onClick={() => setReload(!reload)}
                      className="btn btn-warning font-weight-bold ml-2"
                    >
                      <FontAwesomeIcon icon="sync" /> Ressayer
                    </button>{" "}
                    <Link to={`/organizations`}>
                      <button className="btn btn-light font-weight-bold ml-2">
                        <FontAwesomeIcon icon="users" /> Gestion organismes
                      </button>
                    </Link>
                  </h2>
                </div>
              </div>
            )}
            {isLoading && !isOrganizationError && organization !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** GROUP FORM */}
            {organization !== null && !isOrganizationError && !isUnauthorized && !isLoading && (
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
                    <label className="col-md-3 font-weight-bold" htmlFor="name">
                      Nom:{" "}
                    </label>
                    <div className="col-md-9">
                      <input
                        disabled={isSaving}
                        placeholder="Nom ..."
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={organization?.name || ""}
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
                          Nom d'organisme est requis
                        </div>
                      )}
                    </div>
                  </div>

                  {/** Description */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="notes"
                    >
                      Description:{" "}
                    </label>
                    <div className="col-md-9">
                      <CKEditor
                        editor={ClassicEditor}
                        data={organization?.description || ""}
                        disabled={isSaving}
                        onChange={onEditorChange}
                      />
                    </div>
                  </div>

                   {/** USER IMAGE */}
                   <div className="form-group">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="validatedCustomFile"
                    >
                      Image:{" "}
                    </label>
                    <div className="custom-file col-md-9">
                      <input
                        disabled={isSaving}
                        type="file"
                        id="validatedCustomFile"
                        name="file"
                        onChange={(event) => setFile(event.target.files[0])}
                        className={`custom-file-input shadow-sm`}
                        accept="image/*"
                      />
                      <label
                        className="custom-file-label shadow-sm"
                        htmlFor="validatedCustomFile"
                      >
                        Choisir un fichier...
                      </label>
                    </div>

                    {organization.id !== undefined && (
                      <div className="custom-control custom-switch mt-2 text-center">
                        <input
                          disabled={isSaving}
                          type="checkbox"
                          className="custom-control-input"
                          id="updateImage"
                          name="updateImage"
                          ref={register({
                            required: false,
                          })}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="updateImage"
                        >
                          Mettre à jour l'image d'organisme
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="col-12 text-center mb-4 mt-4">
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
                    {(id !== undefined || organization.hasOwnProperty("id")) && (
                      <Link
                        to={`/organizations/view/${organization?.id}`}
                        type="submit"
                        className="btn btn-warning font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="user" /> Retourner vers l'organisme
                      </Link>
                    )}
                    <Link
                      to="/organizations"
                      type="submit"
                      className="btn btn-secondary font-weight-bold text-center mx-2"
                    >
                      <FontAwesomeIcon icon="undo" /> Naviguer vers les organismes
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
