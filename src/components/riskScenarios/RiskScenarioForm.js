import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import TypologyService from "../../services/TypologyService";
import RiskScenarioService from "../../services/RiskScenarioService";
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
  const [isRiskScenarioError, setIsRiskScenarioError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [riskScenarioResponse, setRiskScenarioResponse] = useState({});
  const [description, setDescription] = useState("");
  const [typologiesData, setTypologiesData] = useState({
      isLoading: true,
      data: []
  })
  document.title = "Gestion Des Scénarios De Risques";

  // Ids Extraction from URL
  let { typologyId, riskScenarioId } = useParams();

  useEffect(() => {
    // Set loading
    setIsLoading(true);
    setIsRiskScenarioError(false);
    setIsUnauthorized(false);
    setRiskScenarioResponse({});
    // Check user permissions
    UserService.canEditRiskScenario()
      .then((response) => {
          if( response?.hasRole ) {
              fetchTypologies();
            if (typologyId !== undefined && riskScenarioId !== undefined) {
              fetchRiskScenario();
            } else {
              setIsLoading(false);
              setRiskScenarioResponse({});
            }
          } else {
            setIsUnauthorized(true);
            setIsRiskScenarioError(false);
          }
          setIsLoading(false);
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsRiskScenarioError(false);
        } else {
          setIsUnauthorized(false);
          setIsRiskScenarioError(true);
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

  const fetchRiskScenario = async () => {
    try {
      // Get RISK SCENRIO
      const riskScenarioResponse = await TypologyService.getRiskScenario(typologyId, riskScenarioId);
      if( riskScenarioResponse.hasOwnProperty("riskScenario") ) {
        setRiskScenarioResponse(riskScenarioResponse)
        setDescription(riskScenarioResponse?.riskScenario?.description || "");
      } else {
        setIsRiskScenarioError(false);
        setRiskScenarioResponse(null)
      }
      setIsUnauthorized(false);
      setIsLoading(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setRiskScenarioResponse({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsRiskScenarioError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsRiskScenarioError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsRiskScenarioError(false);
          setRiskScenarioResponse(null);
      }
    }
  };

  const onEditorChange = (event, editor) => {
    setDescription(editor.getData());
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    RiskScenarioService.saveRiskScenario({
      currentTypology: typologyId,
      riskScenario: riskScenarioId,
      ...data,
      description,
    })
      .then((riskScenario) => {
          setRiskScenarioResponse(riskScenario);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `Le scénrio de risque à été enregistré avec succés!`,
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
            {(typologyId !== undefined && riskScenarioId !== undefined && riskScenarioResponse != null && riskScenarioResponse.hasOwnProperty("riskScenario")) &&
              !isRiskScenarioError &&
              !isUnauthorized &&
              !isLoading && (
                <div className="col-12 text-center">
                  <Link
                    to={`/riskscenarios/view/${riskScenarioResponse?.typologyId}/${riskScenarioResponse?.riskScenario?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="backward" /> Retourner vers le scénario de risque
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isRiskScenarioError || isUnauthorized || riskScenarioResponse === null) &&
              !isLoading && (
                <div className="col-12 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="col-md-12 font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isRiskScenarioError && "Une erreur est survenue!"}
                      {isUnauthorized && "Vous n'êtes pas autorisé!"}
                      {riskScenarioResponse === null && "Aucune menace n'a été trouvée"}
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>{" "}
                      <Link to={`/riskscenarios`}>
                        <button className="btn btn-light font-weight-bold ml-2">
                          <FontAwesomeIcon icon="users" /> Gestion des scénarios de risque
                        </button>
                      </Link>
                    </h2>
                  </div>
                </div>
              )}
            {isLoading && !isRiskScenarioError && riskScenarioResponse !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** RISKSCENARIO FORM */}
            {riskScenarioResponse !== null &&
              !isRiskScenarioError &&
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
                          defaultValue={riskScenarioResponse?.riskScenario?.name || ""}
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
                            Nom du scénario de risque est requis
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
                          data={riskScenarioResponse?.riskScenario?.description || ""}
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
                      Typologie: <b className="text-danger">*</b>
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

                   {/** APPROVE RISKSCENARIO */}
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
                            if( riskScenarioResponse?.riskScenario?.status ) {
                              riskScenarioResponse.riskScenario.status = !riskScenarioResponse?.riskScenario?.status
                            }
                        }}
                        defaultChecked={riskScenarioResponse?.riskScenario?.status}
                      />
                      <label className="custom-control-label" htmlFor="status">
                        Approuver le scénario de risque
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
                      {((typologyId !== undefined && riskScenarioId !== undefined ) || riskScenarioResponse.hasOwnProperty("riskScenario")) && (
                        <Link
                          to={`/riskscenarios/view/${riskScenarioResponse?.typologyId}/${riskScenarioResponse?.riskScenario?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="backward" /> Retourner vers le scénario de risque
                        </Link>
                      )}
                      <Link
                        to="/riskscenarios"
                        type="submit"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="undo" /> Naviguer vers les scénarios de risque
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
