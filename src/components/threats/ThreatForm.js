import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import TypologyService from "../../services/TypologyService";
import ThreatService from "../../services/ThreatService";
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
  const [isThreatError, setIsThreatError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [threatResponse, setThreatResponse] = useState({});
  const [description, setDescription] = useState("");
  const [typologiesData, setTypologiesData] = useState({
      isLoading: true,
      data: []
  })
  document.title = "Gestion Des Menaces";

  // Ids Extraction from URL
  let { typologyId, threatId } = useParams();

  useEffect(() => {
    // Set loading
    setIsLoading(true);
    setIsThreatError(false);
    setIsUnauthorized(false);
    setThreatResponse({});
    // Check user permissions
    UserService.canEditThreat()
      .then((response) => {
          if( response?.hasRole ) {
              fetchTypologies();
            // Get group if id is not new
            if (typologyId !== undefined && threatId !== undefined) {
              fetchThreat();
            } else {
              setIsLoading(false);
              setThreatResponse({});
            }
          } else {
            setIsUnauthorized(true);
            setIsThreatError(false);
          }
          setIsLoading(false);
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsThreatError(false);
        } else {
          setIsUnauthorized(false);
          setIsThreatError(true);
        }
        setIsLoading(false);
      });
  }, [reload]);

  const fetchTypologies = async () => {
    try {
      const typologies = await TypologyService.getCustomTypologies();
      setTypologiesData({ loading: false, data: typologies });
    } catch (e) {
        setTypologiesData({ loading: false, data: [] });
    }
  };

  const fetchThreat = async () => {
    try {
      // Get threat
      const threatResponse = await TypologyService.getThreat(typologyId, threatId);
      if( threatResponse.hasOwnProperty("threat") ) {
        setThreatResponse(threatResponse)
        setDescription(threatResponse?.threat?.description);
      } else {
        setThreatResponse(null);
      }
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsThreatError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setThreatResponse({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsThreatError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsThreatError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsThreatError(false);
          setThreatResponse(null);
      }
    }
  };

  const onEditorChange = (event, editor) => {
    setDescription(editor.getData());
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    ThreatService.saveThreat({
      currentTypology: typologyId,
      threat: threatId,
      ...data,
      description,
    })
      .then((threat) => {
          console.log(threat);
        setThreatResponse(threat);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `La menace à été enregistrée avec succés!`,
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
                <div className="ribbon bg-success text-lg">Menaces</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {(typologyId !== undefined && threatId !== undefined && threatResponse !== null && threatResponse.hasOwnProperty("threat")) &&
              !isThreatError &&
              !isUnauthorized &&
              !isLoading && (
                <div className="col-12 text-center">
                  <Link
                    to={`/threats/view/${threatResponse?.typologyId}/${threatResponse?.threat?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="backward" /> Retourner vers la menace
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isThreatError || isUnauthorized || threatResponse === null) &&
              !isLoading && (
                <div className="col-12 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="col-md-12 font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isThreatError && "Une erreur est survenue!"}
                      {isUnauthorized && "Vous n'êtes pas autorisé!"}
                      {threatResponse === null && "Aucune menace n'a été trouvée"}
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>{" "}
                      <Link to={`/threats`}>
                        <button className="btn btn-light font-weight-bold ml-2">
                          <FontAwesomeIcon icon="users" /> Gestion des menaces
                        </button>
                      </Link>
                    </h2>
                  </div>
                </div>
              )}
            {isLoading && !isThreatError && threatResponse !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** THREAT FORM */}
            {threatResponse !== null &&
              !isThreatError &&
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
                          defaultValue={threatResponse?.threat?.name || ""}
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
                            Nom de la menace est requis
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
                          data={threatResponse?.threat?.description || ""}
                          disabled={isSaving}
                          onChange={onEditorChange}
                        />
                      </div>
                    </div>


                    {/** TYPOLOGY */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="roles"
                    >
                      Typologie:
                    </label>
                    <div className="col-md-9">
                      {!typologiesData.isLoading && (
                        <select
                          defaultValue={typologyId || ""}
                          defaultChecked={typologyId || ""}
                          onClick={(event) => {
                            if (
                            typologiesData?.data === null ||
                            typologiesData?.data?.length === 0
                            ) {
                              fetchTypologies();
                            }
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.roles ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || typologiesData?.isLoading}
                          ref={register({
                            required: true,
                          })}
                          id="typology"
                          name="typology"
                        >
                          {typologiesData?.data?.map((typology, key) => (
                            <option key={key} value={typology?.id}>
                              {typology?.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {/** Required name error */}
                      {errors.typology && errors.typology.type === "required" && (
                        <div className="invalid-feedback">
                          La typologie est requise
                        </div>
                      )}
                    </div>
                  </div>

                   {/** APPROVE THREAT */}
                   <div className="custom-control custom-switch mt-2 mb-2 text-center">
                      <input
                        disabled={isSaving}
                        type="checkbox"
                        className="custom-control-input"
                        id="status"
                        name="status"
                        ref={register({
                          required: false,
                        })}
                        onChange={(e) => {
                            if( threatResponse?.threat?.status ) {
                                threatResponse.threat.status = !threatResponse?.threat?.status
                            }
                        }}
                        defaultChecked={threatResponse?.threat?.status}
                      />
                      <label className="custom-control-label" htmlFor="status">
                        Approuver la menace
                      </label>
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
                      {((typologyId !== undefined && threatId !== undefined ) || threatResponse.hasOwnProperty("threat")) && (
                        <Link
                          to={`/threats/view/${threatResponse?.typologyId}/${threatResponse?.threat?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="backward" /> Retourner vers la
                          menace
                        </Link>
                      )}
                      <Link
                        to="/threats"
                        type="submit"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="undo" /> Naviguer vers les
                        menaces
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
