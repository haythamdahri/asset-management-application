import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import UserService from "../../services/UserService";
import ProcessService from "../../services/ProcessService";
import OrganizationService from "../../services/OrganizationService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";
import SettingService from '../../services/SettingService';

export default () => {
  const { register, handleSubmit, errors } = useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isProcessError, setIsProcessError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [applicationProcess, setApplicationProcess] = useState({});
  const [organizationsData, setOrganizationsData] = useState({
    isLoading: true,
    data: [],
  });
  const [processesData, setProcessesData] = useState({
    isLoading: true,
    data: [],
  });
  const [classificationSetting, setClassificationSetting] = useState({});

  // Process Id Extraction from URL
  let { id } = useParams();
  document.title = "Gestion Des Processus";

  useEffect(() => {
    setIsLoading(true);
    setIsProcessError(false);
    setIsUnauthorized(false);
    // Check user roles
    UserService.canEditProcess()
      .then((response) => {
        fetchOrganizations();
        if (response.hasRole) {
          // Fetch classification settings
          fetchClassificationSettings();
          // Get process if id is not new
          if (id !== undefined) {
            fetchProcess();
          } else {
            setIsLoading(false);
            setApplicationProcess({});
          }
        } else {
          setIsLoading(false);
          setIsUnauthorized(true);
          setIsProcessError(false);
        }
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsProcessError(false);
        } else {
          setIsUnauthorized(false);
          setIsProcessError(true);
        }
        setIsLoading(false);
      });
  }, [reload]);

  const fetchClassificationSettings = async () => {
    try {
      const classificationOptions = await SettingService.getClassificationSetting();
      setClassificationSetting(classificationOptions);
    } catch (e) {
      setClassificationSetting(null);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const organizations = await OrganizationService.getOrganizations();
      setOrganizationsData({ loading: false, data: organizations });
    } catch (e) {
      setOrganizationsData({ loading: false, data: [] });
    }
  };

  const fetchOrganizationProcesses = async (organizationId, pr) => {
    setProcessesData({ ...processesData, loading: true });
    try {
      const processes = await OrganizationService.getOrganizationProcesses(
        organizationId
      );
      setProcessesData({
        loading: false,
        data:
          processes?.filter((p) => p?.id !== pr?.id && p?.id !== pr?.id) || [],
      });
    } catch (e) {
      setProcessesData({ loading: false, data: [] });
    }
  };

  const fetchProcess = async () => {
    try {
      // Get proces
      const applicationProcess = await ProcessService.getProcess(id);
      setApplicationProcess(applicationProcess);
      // Fetch processes by the retrieved one organization
      fetchOrganizationProcesses(applicationProcess?.organization?.id, applicationProcess);
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsProcessError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setApplicationProcess({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsProcessError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsProcessError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsProcessError(true);
      }
    }
  };

  const onEditorChange = (event, editor) => {
    setApplicationProcess({
      ...applicationProcess,
      description: editor.getData(),
    });
  };

  const onSubmit = (data) => {
    console.log(data);
    setIsSaving(true);
    const processRequest = {
      ...data,
      id: applicationProcess?.id,
      description: applicationProcess.description,
    };
    ProcessService.saveProcess(processRequest)
      .then((p) => {
        setApplicationProcess(p);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `Le processus à été enregistré avec succés!`,
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
                <div className="ribbon bg-success text-lg">Processus</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {(id !== undefined || applicationProcess.hasOwnProperty("id")) &&
              !isProcessError &&
              !isUnauthorized &&
              !isLoading &&
              process && (
                <div className="col-12 text-center">
                  <Link
                    to={`/processes/view/${applicationProcess?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="microchip" /> Retourner vers le
                    processus
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isProcessError || isUnauthorized || process === null) &&
              !isLoading && (
                <div className="col-12 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="col-md-12 font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isProcessError && "Une erreur est survenue!"}
                      {isUnauthorized && "Vous n'êtes pas autorisé!"}
                      {process === null && "Aucun processus n'a été trouvé"}
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>{" "}
                      <Link to={`/processes`}>
                        <button className="btn btn-light font-weight-bold ml-2">
                          <FontAwesomeIcon icon="users" /> Gestion processus
                        </button>
                      </Link>
                    </h2>
                  </div>
                </div>
              )}

            {isLoading && !isProcessError && process !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** PROCESS FORM */}
            {process !== null &&
              !isProcessError &&
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
                    {/** LASTNAME */}
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
                          placeholder="Nom du processus ..."
                          type="text"
                          id="name"
                          name="name"
                          defaultValue={applicationProcess?.name || ""}
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
                            Nom du processus est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** DESCRIPTIONS */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="description"
                      >
                        Descirption:{" "}
                      </label>
                      <div className="col-md-9">
                        <CKEditor
                          editor={ClassicEditor}
                          data={applicationProcess?.description || ""}
                          disabled={isSaving}
                          onChange={onEditorChange}
                        />
                      </div>
                    </div>

                    {/** APPROVE PROCESS */}
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
                          applicationProcess.status = !applicationProcess?.status;
                        }}
                        defaultChecked={applicationProcess?.status}
                      />
                      <label className="custom-control-label" htmlFor="status">
                        Approuver le processus
                      </label>
                    </div>

                    {/** Organization */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="organization"
                      >
                        Organisme: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          onChange={(e) =>
                            fetchOrganizationProcesses(
                              e.target.value,
                              applicationProcess
                            )
                          }
                          defaultValue={applicationProcess?.organization?.id}
                          onClick={(event) => {
                            if (
                              organizationsData?.data === null ||
                              organizationsData?.data?.length === 0
                            ) {
                              fetchOrganizations();
                            }
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.company ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || organizationsData?.loading}
                          ref={register({
                            required: true,
                          })}
                          id="organization"
                          name="organization"
                        >
                          {organizationsData?.data?.map((organization, key) => (
                            <option key={key} value={organization.id}>
                              {organization?.name}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.organization && errors.organization.type === "required" && (
                          <div className="invalid-feedback">
                            L'organisme du processus est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** Paraent Process */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="parentProcess"
                      >
                        Processus Parent:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            applicationProcess?.parentProcess?.id
                          }
                          onChange={(e) => {
                            setApplicationProcess({...applicationProcess, parentProcess: processesData?.data?.filter(p => p?.id === e.target.value)[0]})
                          }}
                          defaultChecked={
                            applicationProcess?.parentProcess?.id
                          }
                          className={`form-control form-control-sm shadow-sm ${
                            errors.parentProcess ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || processesData?.loading}
                          ref={register({
                            required: false,
                          })}
                          id="parentProcess"
                          name="parentProcess"
                        >
                          <option key={-1} value=""></option>
                          {processesData?.data?.map((localProcess, key) => (
                            <option key={key} value={localProcess?.id}>
                              {localProcess?.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/** Confidentiality */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="confidentiality"
                      >
                        Confidentialité: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            applicationProcess?.classification?.confidentiality
                          }
                          onChange={e => {
                            setApplicationProcess({...applicationProcess, classification: {...applicationProcess?.classification, confidentiality: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.confidentiality ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="confidentiality"
                          name="confidentiality"
                        >
                          {classificationSetting?.confidentialities?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.confidentiality && errors.confidentiality.type === "required" && (
                          <div className="invalid-feedback">
                            La confidentialité du processus est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** Availability */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="availability"
                      >
                        Disponibilité: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            applicationProcess?.classification?.availability
                          }
                          onChange={e => {
                            setApplicationProcess({...applicationProcess, classification: {...applicationProcess?.classification, availability: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.availability ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="availability"
                          name="availability"
                        >
                          {classificationSetting?.availabilities?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.availability && errors.availability.type === "required" && (
                          <div className="invalid-feedback">
                            La disponibilité du processus est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** Integrity */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="integrity"
                      >
                        Intégrité: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            applicationProcess?.classification?.integrity
                          }
                          onChange={e => {
                            setApplicationProcess({...applicationProcess, classification: {...applicationProcess?.classification, integrity: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.integrity ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="integrity"
                          name="integrity"
                        >
                          {classificationSetting?.integrities?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.integrity && errors.integrity.type === "required" && (
                          <div className="invalid-feedback">
                            L'intégrité du processus est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** Traceability */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="confidentiality"
                      >
                        Traçabilité: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={
                            applicationProcess?.classification?.traceability
                          }
                          onChange={e => {
                            setApplicationProcess({...applicationProcess, classification: {...applicationProcess?.classification, traceability: e.target.value}})
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.traceability ? "is-invalid" : ""
                          }`}
                          disabled={isSaving}
                          ref={register({
                            required: true,
                          })}
                          id="traceability"
                          name="traceability"
                        >
                          {classificationSetting?.traceabilities?.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.traceability && errors.traceability.type === "required" && (
                          <div className="invalid-feedback">
                            La traçabilité du processus est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** APPROVE CLASSIFICATION */}
                    <div className="custom-control custom-switch mt-2 mb-2 text-center">
                      <input
                        disabled={isSaving}
                        type="checkbox"
                        className="custom-control-input"
                        id="classificationStatus"
                        name="classificationStatus"
                        ref={register({
                          required: false,
                        })}
                        onChange={(e) => {
                          if (applicationProcess?.classification) {
                            applicationProcess.classification.status = !applicationProcess
                              ?.classification?.status;
                          } else {
                            applicationProcess.classification = {
                              status: true,
                            };
                          }
                        }}
                        defaultChecked={
                          applicationProcess?.classification?.status
                        }
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="classificationStatus"
                      >
                        Approuver la classification du processus
                      </label>
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
                      {(id !== undefined ||
                        applicationProcess.hasOwnProperty("id")) && (
                        <Link
                          to={`/processes/view/${applicationProcess?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="backward" /> Retourner vers le
                          processus
                        </Link>
                      )}
                      <Link
                        to="/processes"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="microchip" /> Naviguer vers les
                        processes
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
