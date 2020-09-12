import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import TypologyService from "../../services/TypologyService";
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
  const [isTypologyError, setIsTypologyError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [typology, setTypology] = useState({});
  const [description, setDescription] = useState("");
  document.title = "Gestion Typologies";

  // Group Id Extraction from URL
  let { id } = useParams();

  useEffect(() => {
    // Set loading
    setIsLoading(true);
    setIsTypologyError(false);
    setIsUnauthorized(false);
    setTypology({});
    // Check user permissions
    UserService.canEditTypology()
      .then((response) => {
          if( response?.hasRole ) {
            // Get group if id is not new
            if (id !== undefined) {
              fetchTypology();
            } else {
              setIsLoading(false);
              setTypology({});
            }
          } else {
            setIsUnauthorized(true);
            setIsTypologyError(false);
          }
          setIsLoading(false);
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsTypologyError(false);
        } else {
          setIsUnauthorized(false);
          setIsTypologyError(true);
        }
        setIsLoading(false);
      });
  }, [reload]);

  const fetchTypology = async () => {
    try {
      // Get typology
      const typology = await TypologyService.getTypology(id);
      setTypology(typology)
      setDescription(typology.description);
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsTypologyError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setTypology({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsTypologyError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsTypologyError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsTypologyError(true);
      }
    }
  };

  const onEditorChange = (event, editor) => {
    setDescription(editor.getData());
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    TypologyService.saveTyplogy({
      id,
      ...data,
      description,
    })
      .then((typology) => {
        setTypology(typology);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `La typologie des actifs à été enregistrée avec succés!`,
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
                <div className="ribbon bg-success text-lg">Typologie</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {(id !== undefined || typology.hasOwnProperty("id")) &&
              !isTypologyError &&
              !isUnauthorized &&
              !isLoading && (
                <div className="col-12 text-center">
                  <Link
                    to={`/typlogies/view/${typology?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="backward" /> Retourner vers la typologie
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isTypologyError || isUnauthorized || typology === null) &&
              !isLoading && (
                <div className="col-12 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="col-md-12 font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isTypologyError && "Une erreur est survenue!"}
                      {isUnauthorized && "Vous n'êtes pas autorisé!"}
                      {typology === null && "Aucun groupe n'a été trouvé"}
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>{" "}
                      <Link to={`/groups`}>
                        <button className="btn btn-light font-weight-bold ml-2">
                          <FontAwesomeIcon icon="users" /> Gestion typlogies
                        </button>
                      </Link>
                    </h2>
                  </div>
                </div>
              )}
            {isLoading && !isTypologyError && typology !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** TYPOLOGY FORM */}
            {typology !== null &&
              !isTypologyError &&
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
                        Nom: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Nom ..."
                          type="text"
                          id="name"
                          name="name"
                          defaultValue={typology?.name || ""}
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
                            Nom de la typologie est requis
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
                          data={typology?.description || ""}
                          disabled={isSaving}
                          onChange={onEditorChange}
                        />
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
                      {(id !== undefined || typology.hasOwnProperty("id")) && (
                        <Link
                          to={`/typologies/view/${typology?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="backward" /> Retourner vers la
                          typologie
                        </Link>
                      )}
                      <Link
                        to="/typologies"
                        type="submit"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="undo" /> Naviguer vers les
                        typologies
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
