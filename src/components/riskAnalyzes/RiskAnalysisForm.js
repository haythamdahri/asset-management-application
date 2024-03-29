import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import AssetService from "../../services/AssetService";
import RiskAnalysisService from "../../services/RiskAnalysisService";
import SettingService from "../../services/SettingService";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { RISK_TREATMENT_STRATEGY_TYPES } from "../../services/ConstantsService";

export default () => {
  const { register, handleSubmit, errors } = useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isRiskScenarioError, setIsRiskScenarioError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [riskAnalysisResponse, setRiskAnalysisResponse] = useState({});
  const [riskTreatmentPlan, setRiskTreatmentPlan] = useState("");
  const [assets, setAssets] = useState([]);
  const [typologyData, setTypologyData] = useState({
    isLoading: true,
    data: {},
  });
  const [riskAnalyzesOptions, setRiskAnalyzesOtions] = useState({});
  document.title = "Gestion Des Scénarios De Risques";

  // Ids Extraction from URL
  let { assetId, riskAnalysisId } = useParams();

  useEffect(() => {
    // Set loading
    setIsLoading(true);
    setIsRiskScenarioError(false);
    setIsUnauthorized(false);
    setRiskAnalysisResponse({});
    // Check user permissions
    UserService.canEditRiskAnalysis()
      .then((response) => {
        if (response?.hasRole) {
          // Fetch Risk Analyzes options
          fetchRiskAnalyzesOptions();
          fetchAssets();
          if (assetId !== undefined && riskAnalysisId !== undefined) {
            fetchRiskAnalysis();
            fetchTypologyAssets(assetId);
          } else {
            setIsLoading(false);
            setRiskAnalysisResponse({});
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

  const fetchRiskAnalyzesOptions = async () => {
    try {
      const riskAnalyzesOptions = await SettingService.getActiveSettingRiskAnalysisOptions();
      setRiskAnalyzesOtions(riskAnalyzesOptions);
    } catch (e) {
      setRiskAnalyzesOtions(null);
    }
  }

  const fetchRiskAnalysis = async () => {
    try {
      // Get riskAnalysis
      const riskAnalysisResponse = await AssetService.getRiskAnalysis(
        assetId,
        riskAnalysisId
      );
      if (riskAnalysisResponse.hasOwnProperty("riskAnalysis")) {
        setRiskAnalysisResponse(riskAnalysisResponse);
        setRiskTreatmentPlan(
          riskAnalysisResponse?.riskAnalysis?.riskTreatmentPlan
        );
      } else {
        setRiskAnalysisResponse(null);
      }
      fetchTypologyAssets(riskAnalysisResponse?.assetId);
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsRiskScenarioError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setRiskAnalysisResponse({});
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
          setIsRiskScenarioError(true);
      }
    }
  };
  const fetchTypologyAssets = async (assetId) => {
    try {
      setTypologyData({ loading: true, data: {} });
      const asset = await AssetService.getAsset(assetId);
      const typology = asset?.typology;
      setTypologyData({ loading: false, data: typology });
    } catch (e) {
      setTypologyData({ loading: false, data: {} });
    }
  };

  const fetchAssets = async () => {
    try {
      const assets = await AssetService.getAssets();
      setAssets(assets);
      // Fetch first asset typology
      if( assetId === undefined ) {
        fetchTypologyAssets(assets[0]?.id);
      }
    } catch (e) {
      setAssets([]);
    }
  };

  const onEditorChange = (event, editor) => {
    setRiskTreatmentPlan(editor.getData());
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    RiskAnalysisService.saveRiskAnalysis({
      currentAsset: assetId,
      id: riskAnalysisId,
      typology: typologyData?.data?.id,
      ...data,
      riskTreatmentPlan,
    })
      .then((vulnerability) => {
        setRiskAnalysisResponse(vulnerability);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `L'analyse de risque à été enregistrée avec succés!`,
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
                <div className="ribbon bg-success text-lg">A.R</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {assetId !== undefined &&
              riskAnalysisId !== undefined &&
              riskAnalysisResponse !== null &&
              riskAnalysisResponse.hasOwnProperty("riskAnalysis") &&
              !isRiskScenarioError &&
              !isUnauthorized &&
              !isLoading && (
                <div className="col-12 text-center">
                  <Link
                    to={`/riskanalyzes/view/${riskAnalysisResponse?.assetId}/${riskAnalysisResponse?.riskAnalysis?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="backward" /> Retourner vers l'analyse de
                    risque
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isRiskScenarioError ||
              isUnauthorized ||
              riskAnalysisResponse === null) &&
              !isLoading && (
                <div className="col-12 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="col-md-12 font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isRiskScenarioError && "Une erreur est survenue!"}
                      {isUnauthorized && "Vous n'êtes pas autorisé!"}
                      {riskAnalysisResponse === null &&
                        "Aucune analyse de risque n'a été trouvée"}
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>{" "}
                      <Link to={`/groups`}>
                        <button className="btn btn-light font-weight-bold ml-2">
                          <FontAwesomeIcon icon="users" /> Gestion Des Analyse
                          De Risque
                        </button>
                      </Link>
                    </h2>
                  </div>
                </div>
              )}
            {isLoading &&
              !isRiskScenarioError &&
              riskAnalysisResponse !== null && (
                <div className="col-12 text-center pt-5 pb-5">
                  <div className="overlay dark">
                    <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                  </div>
                </div>
              )}

            {/** RISK ANALYSIS FORM */}
            {riskAnalysisResponse !== null &&
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
                    {/** Asset */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="asset"
                      >
                        Actif: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={riskAnalysisResponse?.assetId}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.process ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, assetId: e?.target?.value, asset: e?.target?.value, })
                            fetchTypologyAssets(e.target.value);
                          }}
                          id="asset"
                          name="asset"
                        >
                          {assets &&
                            assets?.map((a, key) => (
                              <option key={key} value={a?.id}>
                                {a?.name}
                              </option>
                            ))}
                        </select>
                        {/** Required name error */}
                        {errors.asset && errors.asset.type === "required" && (
                          <div className="invalid-feedback">
                            L'actif est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** THREAT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="threat"
                      >
                        Menace:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.threat?.id || ""
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({
                              ...riskAnalysisResponse,
                              riskAnalysis: {
                                ...riskAnalysisResponse.riskAnalysis,
                                threat: typologyData?.data?.threats?.filter(
                                  (t) => t.id === e.target.value
                                )[0],
                              },
                            });
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.threat ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || typologyData?.isLoading}
                          ref={register({
                            required: false,
                          })}
                          id="threat"
                          name="threat"
                        >
                          <option></option>
                          {typologyData?.data &&
                            typologyData?.data?.threats?.map((threat, key) => (
                              <option key={key} value={threat?.id}>
                                {threat?.name}
                              </option>
                            ))}{" "}
                        </select>
                      </div>
                    </div>

                    {/** VULNERABILITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="vulnerability"
                      >
                        Vulnérabilité:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.vulnerability
                              ?.id || ""
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({
                              ...riskAnalysisResponse,
                              riskAnalysis: {
                                ...riskAnalysisResponse.riskAnalysis,
                                vulnerability: typologyData?.data?.vulnerabilities?.filter(
                                  (v) => v.id === e.target.value
                                )[0],
                              },
                            });
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.vulnerability ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || typologyData?.isLoading}
                          ref={register({
                            required: false,
                          })}
                          id="vulnerability"
                          name="vulnerability"
                        >
                          <option></option>
                          {typologyData?.data &&
                            typologyData?.data?.vulnerabilities?.map(
                              (vulnerability, key) => (
                                <option key={key} value={vulnerability?.id}>
                                  {vulnerability?.name}
                                </option>
                              )
                            )}
                        </select>
                      </div>
                    </div>

                    {/** RISK SCENARIO */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="riskScenario"
                      >
                        Scénario de risque:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.riskScenario
                              ?.id || ""
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({
                              ...riskAnalysisResponse,
                              riskAnalysis: {
                                ...riskAnalysisResponse.riskAnalysis,
                                riskScenario: typologyData?.data?.riskScenarios?.filter(
                                  (r) => r.id === e.target.value
                                )[0],
                              },
                            });
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.riskScenario ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || typologyData?.isLoading}
                          ref={register({
                            required: false,
                          })}
                          id="riskScenario"
                          name="riskScenario"
                        >
                          <option></option>
                          {typologyData?.data &&
                            typologyData?.data?.riskScenarios?.map(
                              (riskScenario, key) => (
                                <option key={key} value={riskScenario?.id}>
                                  {riskScenario?.name}
                                </option>
                              )
                            )}
                        </select>
                      </div>
                    </div>

                    {/** Probability */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="probability"
                      >
                        Probabilité: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.probability
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, probability: e.target.value}})
                          }}
                          defaultChecked={
                            riskAnalysisResponse?.riskAnalysis?.probability
                          }
                          className={`form-control form-control-sm shadow-sm ${
                            errors.probability ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="probability"
                          name="probability"
                        >
                          {riskAnalyzesOptions?.probabilities?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.probability &&
                          errors.probability.type === "required" && (
                            <div className="invalid-feedback">
                              La probabilité de l'analyse de risque est requise
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Financial Impact */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="financialImpact"
                      >
                        Impact financier: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.financialImpact
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, financialImpact: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.financialImpact ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="financialImpact"
                          name="financialImpact"
                        >
                          {riskAnalyzesOptions?.financialImpacts?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.probability &&
                          errors.probability.type === "required" && (
                            <div className="invalid-feedback">
                              L'impact financier de l'analyse de risque est
                              requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Operational Impact */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="operationalImpact"
                      >
                        Impact operationnel: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.operationalImpact
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, operationalImpact: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.operationalImpact ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="operationalImpact"
                          name="operationalImpact"
                        >
                          {riskAnalyzesOptions?.operationalImpacts?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.probability &&
                          errors.probability.type === "required" && (
                            <div className="invalid-feedback">
                              L'impact operationnel de l'analyse de risque est
                              requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Reputational Impact */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="reputationalImpact"
                      >
                        Impact réputationnel: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.reputationalImpact
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, reputationalImpact: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.reputationalImpact ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="reputationalImpact"
                          name="reputationalImpact"
                        >
                          {riskAnalyzesOptions?.reputationalImpacts?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.probability &&
                          errors.probability.type === "required" && (
                            <div className="invalid-feedback">
                              L'impact réputationnel de l'analyse de risque est
                              requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Risk Treatement Strategy */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="riskTreatmentStrategyType"
                      >
                        Stratégie de traitement des risques: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis
                              ?.riskTreatmentStrategy
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({
                              ...riskAnalysisResponse,
                              riskAnalysis: {
                                ...riskAnalysisResponse.riskAnalysis,
                                riskTreatmentStrategy: e.target.value,
                              },
                            });
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.riskTreatmentStrategyType ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="riskTreatmentStrategyType"
                          name="riskTreatmentStrategyType"
                        >
                          <option></option>
                          {Object.keys(RISK_TREATMENT_STRATEGY_TYPES)?.map(
                            (key) => (
                              <option key={key} value={key}>
                                {RISK_TREATMENT_STRATEGY_TYPES[key]}
                              </option>
                            )
                          )}
                        </select>
                        {/** Required name error */}
                        {errors.riskTreatmentStrategyType &&
                          errors.riskTreatmentStrategyType.type ===
                            "required" && (
                            <div className="invalid-feedback">
                              La stratégie de traitement des risque est requise
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Risk Treatement Plan */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="riskTreatmentPlan"
                      >
                        Plan de traitement de risque:{" "}
                      </label>
                      {/** Description */}
                      <div className="col-md-9">
                        <CKEditor
                          editor={ClassicEditor}
                          data={
                            riskAnalysisResponse?.riskAnalysis
                              ?.riskTreatmentPlan || ""
                          }
                          disabled={isSaving}
                          onChange={onEditorChange}
                        />
                      </div>
                    </div>

                    {/** Target Financial Impact */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="targetFinancialImpact"
                      >
                        Impact financier cible: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.targetFinancialImpact
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, targetFinancialImpact: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.targetFinancialImpact ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="targetFinancialImpact"
                          name="targetFinancialImpact"
                        >
                          {riskAnalyzesOptions?.targetFinancialImpacts?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.targetFinancialImpact &&
                          errors.targetFinancialImpact.type === "required" && (
                            <div className="invalid-feedback">
                              L'impact financier cible de l'analyse de risque
                              est requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Target Operational Impact */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="targetOperationalImpact"
                      >
                        Impact operationnel cible: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.targetOperationalImpact
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, targetOperationalImpact: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.targetOperationalImpact ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="targetOperationalImpact"
                          name="targetOperationalImpact"
                        >
                          {riskAnalyzesOptions?.targetOperationalImpacts?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.targetOperationalImpact &&
                          errors.targetOperationalImpact.type ===
                            "required" && (
                            <div className="invalid-feedback">
                              L'impact operationnel cible de l'analyse de risque
                              est requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Target Reputational Impact */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="targetReputationalImpact"
                      >
                        Impact réputationnel cible: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.targetReputationalImpact
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, targetReputationalImpact: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.targetReputationalImpact ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="targetReputationalImpact"
                          name="targetReputationalImpact"
                        >
                          {riskAnalyzesOptions?.targetReputationalImpacts?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.targetReputationalImpact &&
                          errors.targetReputationalImpact.type ===
                            "required" && (
                            <div className="invalid-feedback">
                              L'impact réputationnel cible de l'analyse de
                              risque est requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Target Probability Impact */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="targetProbability"
                      >
                        Probabilité Cible: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.targetProbability
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, targetProbability: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.targetProbability ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="targetProbability"
                          name="targetProbability"
                        >
                          {riskAnalyzesOptions?.targetProbabilities?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.targetProbability &&
                          errors.targetProbability.type === "required" && (
                            <div className="invalid-feedback">
                              La probabilité cible de l'analyse de risque est
                              requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Acceptable Risidual Risk */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="targetProbability"
                      >
                        Risque Résiduel Acceptable: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            riskAnalysisResponse?.riskAnalysis?.acceptableResidualRisk
                          }
                          onChange={(e) => {
                            setRiskAnalysisResponse({...riskAnalysisResponse, riskAnalysis: {...riskAnalysisResponse?.riskAnalysis, acceptableResidualRisk: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.acceptableResidualRisk ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="acceptableResidualRisk"
                          name="acceptableResidualRisk"
                        >
                          {riskAnalyzesOptions?.acceptableResidualRisks?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.acceptableResidualRisk &&
                          errors.acceptableResidualRisk.type === "required" && (
                            <div className="invalid-feedback">
                              Le risque résiduel acceptable de l'analyse de
                              risque est requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** APPROVE RISK ANALYSIS */}
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
                          if (riskAnalysisResponse?.riskAnalysis?.status) {
                            riskAnalysisResponse.riskAnalysis.status = !riskAnalysisResponse
                              ?.riskAnalysis?.status;
                          }
                        }}
                        defaultChecked={
                          riskAnalysisResponse?.riskAnalysis?.status
                        }
                      />
                      <label className="custom-control-label" htmlFor="status">
                        Approuver l'analyse de risque
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
                      {((assetId !== undefined &&
                        riskAnalysisId !== undefined) ||
                        riskAnalysisResponse.hasOwnProperty(
                          "riskAnalysis"
                        )) && (
                        <Link
                          to={`/riskanalyzes/view/${riskAnalysisResponse?.assetId}/${riskAnalysisResponse?.riskAnalysis?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="backward" /> Retourner vers
                          l'analyse de risque
                        </Link>
                      )}
                      <Link
                        to="/vulnerabilities"
                        type="submit"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="undo" /> Naviguer vers les
                        analyses des risques
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
