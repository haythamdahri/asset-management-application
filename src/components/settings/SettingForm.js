import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SettingService from "../../services/SettingService";
import { useForm } from "react-hook-form";

export default () => {
  const { register, handleSubmit, errors } = useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isUnAuthorized, setIsUnAuthorized] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [setting, setSetting] = useState({});

  document.title = "Paramétrage de l'application";

  useEffect(() => {
    setIsLoading(true);
    setIsUnAuthorized(false);
    setIsError(false);
    SettingService.getApplicationSetting()
      .then((setting) => {
        setSetting(setting);
        setIsLoading(false);
        setIsUnAuthorized(false);
        setIsError(false);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403) {
          setIsUnAuthorized(true);
          setIsLoading(false);
        } else {
          setIsUnAuthorized(false);
          setIsError(true);
        }
        setIsLoading(false);
      });
  }, [retry]);

  const onSubmit = (data) => {

  }

  return (
    <div className="content-wrapper" style={{ minHeight: "1416.81px" }}>
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Paramétrage</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item" key="LI1">
                  <Link to="/">
                    <FontAwesomeIcon icon="home" /> Acceuil
                  </Link>
                </li>
                <li className="breadcrumb-item active" key="LI2">
                  Paramétrage de l'application
                </li>
              </ol>
            </div>
          </div>
        </div>
        {/* /.container-fluid */}
      </section>
      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              {/** LOADING */}
              {isLoading && (
                <div className="small-box">
                  <div className="overlay">
                    <i className="fas fa-2x fa-sync-alt fa-spin" />
                  </div>
                </div>
              )}

              {/** UNAUTHORIZED */}
              {isUnAuthorized && (
                <div className="alert alert-warning text-center display-3">
                  <FontAwesomeIcon icon="exclamation-circle" /> Vous n'êtes pas
                  autorisé!
                </div>
              )}

              {/** ERROR */}
              {isError && (
                <div className="alert alert-warning text-center display-3">
                  <FontAwesomeIcon icon="exclamation-circle" /> Une erreur est
                  survenue, veuillez ressayer
                  <button
                    onClick={(e) => setRetry(!retry)}
                    className="btn btn-info btn-sm"
                  >
                    <FontAwesomeIcon icon="sync" /> Ressayer
                  </button>
                </div>
              )}

              {/** SETTING DATA */}
              {!isUnAuthorized && !isError && !isLoading && (
                <>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="p-3 mb-5"
                  >
                    {/** MIN PROBABILITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minProbability"
                      >
                        Probabilité minimale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Probabilité minimale"
                          type="number"
                          id="minProbability"
                          name="minProbability"
                          defaultValue={setting?.probabilities[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minProbability ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minProbability && errors.minProbability.type === "required" && (
                          <div className="invalid-feedback">
                            Probabilité minimale est requise
                          </div>
                        )}
                      </div>
                    </div>

                     {/** MAX PROBABILITY */}
                     <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxProbability"
                      >
                        Probabilité maximale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Probabilité maximale"
                          type="number"
                          id="maxProbability"
                          name="maxProbability"
                          defaultValue={setting?.probabilities[setting?.probabilities?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minProbability ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxProbability && errors.maxProbability.type === "required" && (
                          <div className="invalid-feedback">
                            Probabilité maximale est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MIN FINANCIAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minFinancialImpact"
                      >
                        Impact financier minimal:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact financier minimal"
                          type="number"
                          id="minFinancialImpact"
                          name="minFinancialImpact"
                          defaultValue={setting?.financialImpacts[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minFinancialImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minFinancialImpact && errors.minFinancialImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact financier minimal est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX FINANCIAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxFinancialImpact"
                      >
                        Impact financier maximal:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Probabilité maximale"
                          type="number"
                          id="maxFinancialImpact"
                          name="maxFinancialImpact"
                          defaultValue={setting?.financialImpacts[setting?.financialImpacts?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxFinancialImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxFinancialImpact && errors.maxFinancialImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact financier maximal est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MIN FINANCIAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minOperationnelImpact"
                      >
                        Impact operationnel minimal:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact operationnel minimal"
                          type="number"
                          id="minOperationnelImpact"
                          name="minOperationnelImpact"
                          defaultValue={setting?.operationnelImpacts[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minOperationnelImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minOperationnelImpact && errors.minOperationnelImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact operationnel minimal est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX OPERATIONAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxOperationalImpact"
                      >
                        Impact operationnel maximal:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact operationnel maximal"
                          type="number"
                          id="maxOperationalImpact"
                          name="maxOperationalImpact"
                          defaultValue={setting?.operationalImpacts[setting?.operationalImpacts?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxOperationalImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxOperationalImpact && errors.maxOperationalImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact operationnel maximal est requis
                          </div>
                        )}
                      </div>
                    </div>

                     {/** MIN REPUTATIONAL IMPACT */}
                     <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minReputationalImpact"
                      >
                        Impact reputationnel minimal:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact reputationnel minimal"
                          type="number"
                          id="minReputationalImpact"
                          name="minReputationalImpact"
                          defaultValue={setting?.reputationalImpacts[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minReputationalImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minReputationalImpact && errors.minReputationalImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact reputationnel minimal est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX REPUTATIONAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxReputationalImpact"
                      >
                        Impact reputationnel maximal:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact reputatinnel maximal"
                          type="number"
                          id="maxReputationalImpact"
                          name="maxReputationalImpact"
                          defaultValue={setting?.reputationalImpacts[setting?.reputationalImpacts?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxReputationalImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxReputationalImpact && errors.maxReputationalImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact reputationnel maximal est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MIN TARGET FINANCIAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minTargetFinancialImpact"
                      >
                        Impact financier minimal cible:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact financier minimal cible"
                          type="number"
                          id="minTargetFinancialImpact"
                          name="minTargetFinancialImpact"
                          defaultValue={setting?.targetFinancialImpacts[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minTargetFinancialImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minTargetFinancialImpact && errors.minTargetFinancialImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact financier minimal cible est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX TARGET FINANCIAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxTargetFinancialImpact"
                      >
                        Impact financier maximal cible:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact financier maximal cible"
                          type="number"
                          id="maxTargetFinancialImpact"
                          name="maxTargetFinancialImpact"
                          defaultValue={setting?.targetFinancialImpacts[setting?.targetFinancialImpacts?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxTargetFinancialImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minTargetFinancialImpact && errors.minTargetFinancialImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact financier maximal cible est requis
                          </div>
                        )}
                      </div>
                    </div>

                     {/** MIN TARGET OPERATIONAL IMPACT */}
                     <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minTargetOperationalImpact"
                      >
                        Impact operationnel minimal cible:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact operationnel minimal cible"
                          type="number"
                          id="minTargetOperationalImpact"
                          name="minTargetOperationalImpact"
                          defaultValue={setting?.targetOperationalImpacts[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minTargetOperationalImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minTargetOperationalImpact && errors.minTargetOperationalImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact operationnel minimal cible est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX TARGET OPERATIONAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxTargetOperationalImpact"
                      >
                        Impact operationnel maximal cible:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact operationnel maximal cible"
                          type="number"
                          id="maxTargetOperationalImpact"
                          name="maxTargetOperationalImpact"
                          defaultValue={setting?.targetOperationalImpacts[setting?.targetOperationalImpacts?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxTargetOperationalImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxTargetOperationalImpact && errors.maxTargetOperationalImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact operationnel maximal cible est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MIN TARGET REPUTATIONAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minTargetReputationalImpact"
                      >
                        Impact reputationnel minimal cible:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact reputationnel minimal cible"
                          type="number"
                          id="minTargetReputationalImpact"
                          name="minTargetReputationalImpact"
                          defaultValue={setting?.targetReputationalImpacts[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minTargetReputationalImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minTargetReputationalImpact && errors.minTargetReputationalImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact reputationnel minimal cible est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX TARGET REPUTATIONAL IMPACT */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxTargetReputationalImpact"
                      >
                        Impact reputationnel maximal cible:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Impact reputationnel maximal cible"
                          type="number"
                          id="maxTargetReputationalImpact"
                          name="maxTargetReputationalImpact"
                          defaultValue={setting?.targetReputationalImpacts[setting?.targetReputationalImpacts?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxTargetReputationalImpact ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxTargetReputationalImpact && errors.maxTargetReputationalImpact.type === "required" && (
                          <div className="invalid-feedback">
                            Impact reputationnel maximal cible est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MIN TARGET PROBABILITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minTargetProbability"
                      >
                        Prabilibté minimale cible:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Probabilité minimale cible"
                          type="number"
                          id="minTargetProbability"
                          name="minTargetProbability"
                          defaultValue={setting?.targetProbabilities[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minTargetProbability ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minTargetProbability && errors.minTargetProbability.type === "required" && (
                          <div className="invalid-feedback">
                            Prabilibté minimale cible est requis
                          </div>
                        )}
                      </div>
                    </div>


                    {/** MAX TARGET PROBABILITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxTargetProbability"
                      >
                        Prabilibté maximale cible:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Probabilité minimale cible"
                          type="number"
                          id="maxTargetProbability"
                          name="maxTargetProbability"
                          defaultValue={setting?.targetProbabilities[setting?.targetProbabilities?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxTargetProbability ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxTargetProbability && errors.maxTargetProbability.type === "required" && (
                          <div className="invalid-feedback">
                            Prabilibté maximal cible est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MIN ACCEPTABLE RISIDUAL RISK */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minAcceptableRisidualRisk"
                      >
                        Risque risiduel minimal acceptable:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Risque risiduel minimal acceptable"
                          type="number"
                          id="minAcceptableRisidualRisk"
                          name="minAcceptableRisidualRisk"
                          defaultValue={setting?.acceptableResidualRisks[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minAcceptableRisidualRisk ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minAcceptableRisidualRisk && errors.minAcceptableRisidualRisk.type === "required" && (
                          <div className="invalid-feedback">
                            Risque risiduel minimal acceptable est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX ACCEPTABLE RISIDUAL RISK */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxAcceptableRisidualRisk"
                      >
                        Risque risiduel maximal acceptable:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Risque risiduel maximal acceptable"
                          type="number"
                          id="maxAcceptableRisidualRisk"
                          name="maxAcceptableRisidualRisk"
                          defaultValue={setting?.acceptableResidualRisks[setting?.acceptableResidualRisks?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxAcceptableRisidualRisk ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxAcceptableRisidualRisk && errors.maxAcceptableRisidualRisk.type === "required" && (
                          <div className="invalid-feedback">
                            Risque risiduel maximal acceptable est requis
                          </div>
                        )}
                      </div>
                    </div>

                    <hr />

                    {/** MIN CONFIDENTIALITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minConfidentiality"
                      >
                        Confidentialité minimale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Confidentialité minimale"
                          type="number"
                          id="minConfidentiality"
                          name="minConfidentiality"
                          defaultValue={setting?.confidentialities[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minConfidentiality ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minConfidentiality && errors.minConfidentiality.type === "required" && (
                          <div className="invalid-feedback">
                            Confidentialité minimale est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX CONFIDENTIALITY ACCEPTABLE RISIDUAL RISK */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxConfidentiality"
                      >
                        Confidentialité maximale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Confidentialité maximale"
                          type="number"
                          id="maxConfidentiality"
                          name="maxConfidentiality"
                          defaultValue={setting?.confidentialities[setting?.confidentialities?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxConfidentiality ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxConfidentiality && errors.maxConfidentiality.type === "required" && (
                          <div className="invalid-feedback">
                            Confidentialité maximale est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MIN AVAILABILITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minAvailability"
                      >
                        Disponibilité minimale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Disponibilité minimale"
                          type="number"
                          id="minAvailability"
                          name="minAvailability"
                          defaultValue={setting?.availabilities[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minAvailability ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minAvailability && errors.minAvailability.type === "required" && (
                          <div className="invalid-feedback">
                            Disponibilité minimale est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX AVAILABILITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxAvailability"
                      >
                        Disponibilité maximale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Disponibilité maximale"
                          type="number"
                          id="maxAvailability"
                          name="maxAvailability"
                          defaultValue={setting?.availabilities[setting?.availabilities?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxAvailability ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxAvailability && errors.maxAvailability.type === "required" && (
                          <div className="invalid-feedback">
                            Disponibilité maximale est requise
                          </div>
                        )}
                      </div>
                    </div>

                     {/** MIN INTEGRITY */}
                     <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minIntegrity"
                      >
                        Intégrité minimale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Intégrité minimale"
                          type="number"
                          id="minIntegrity"
                          name="minIntegrity"
                          defaultValue={setting?.integrities[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minIntegrity ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minIntegrity && errors.minIntegrity.type === "required" && (
                          <div className="invalid-feedback">
                            Intégrité minimale est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX INTEGRITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxIntegrity"
                      >
                        Intégrité maximale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Intégrité maximale"
                          type="number"
                          id="maxIntegrity"
                          name="maxIntegrity"
                          defaultValue={setting?.integrities[setting?.integrities?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxIntegrity ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxIntegrity && errors.maxIntegrity.type === "required" && (
                          <div className="invalid-feedback">
                            Intégrité maximale est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MIN TRACEABILITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="minTraceability"
                      >
                        Traçabilité minimale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Traçabilité minimale"
                          type="number"
                          id="minTraceability"
                          name="minTraceability"
                          defaultValue={setting?.traceabilities[0] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.minTraceability ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.minTraceability && errors.minTraceability.type === "required" && (
                          <div className="invalid-feedback">
                            Intégrité minimale est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** MAX TRACEABILITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="maxTraceability"
                      >
                        Traçabilité maximale:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Traçabilité maximale"
                          type="number"
                          id="maxTraceability"
                          name="maxTraceability"
                          defaultValue={setting?.traceabilities[setting?.traceabilities?.length - 1] || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.maxTraceability ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required name error */}
                        {errors.maxTraceability && errors.maxTraceability.type === "required" && (
                          <div className="invalid-feedback">
                            Traçabilité maximale est requise
                          </div>
                        )}
                      </div>
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
                      {(setting.hasOwnProperty("id")) && (
                        <Link
                          to={`/settings`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="backward" /> Anuller
                        </Link>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
