import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import UserService from "../../services/UserService";
import ProcessService from "../../services/ProcessService";
import OrganizationService from "../../services/OrganizationService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default () => {
  const { register, handleSubmit, errors } = useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isProcessError, setIsProcessError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [process, setProcess] = useState({});
  const [organizationsData, setOrganizationsData] = useState({
    isLoading: true,
    data: [],
  });
  const [processesData, setProcessesData] = useState({
    isLoading: true,
    data: [],
  });
  const classificationOptions = [1, 2, 3, 4];

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
          // Get process if id is not new
          if (id !== undefined) {
            fetchProcess();
          } else {
            setIsLoading(false);
            setProcess({});
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

  const fetchOrganizations = async () => {
    try {
      const organizations = await OrganizationService.getOrganizations();
      setOrganizationsData({ loading: false, data: organizations });
    } catch (e) {
      setOrganizationsData({ loading: false, data: [] });
    }
  };

  const fetchOrganizationProcesses = async (organizationId) => {
    setProcessesData({ ...processesData, loading: true});
    try {
      const processes = await OrganizationService.getOrganizationProcesses(
        organizationId
      );
      setProcessesData({ loading: false, data: processes || [] });
    } catch (e) {
      setProcessesData({ loading: false, data: [] });
    }
  };

  const fetchProcess = async () => {
    try {
      // Get proces
      const process = await ProcessService.getProcess(id);
      // Fetch processes by the retrieved one organization
      fetchOrganizationProcesses(process?.organization?.id);
      setProcess(process);
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsProcessError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setProcess({});
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
    setProcess({ ...process, description: editor.getData() });
  };

  const onSubmit = (data) => {
    console.log(data);
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
            {(id !== undefined || process.hasOwnProperty("id")) &&
              !isProcessError &&
              !isUnauthorized &&
              !isLoading &&
              process && (
                <div className="col-12 text-center">
                  <Link
                    to={`/processes/view/${process?.id}`}
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
                        Nom:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Nom du processus ..."
                          type="text"
                          id="name"
                          name="name"
                          defaultValue={process?.name || ""}
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
                          data={process?.description || ""}
                          disabled={isSaving}
                          onChange={onEditorChange}
                        />
                      </div>
                    </div>

                    {/** APPROVE PROCESS */}
                    {process.hasOwnProperty("id") && (
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
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="status"
                        >
                          Approuver le processus
                        </label>
                      </div>
                    )}

                    {/** Organization */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="organization"
                      >
                        Organisme:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          onChange={(e) => fetchOrganizationProcesses(e.target.value)}
                          defaultValue={process?.organization?.id}
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
                      </div>
                    </div>

                    {/** Paraent Process */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="language"
                      >
                        Processus Parent:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={process?.language?.id}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.language ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || processesData?.loading}
                          ref={register({
                            required: false,
                          })}
                          id="language"
                          name="language"
                        >
                        <option key={-1} value="">
                          
                        </option>
                          {processesData?.data?.map((process, key) => (
                            <option key={key} value={process?.id}>
                              {process?.name}
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
                        Confidentialité:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={
                            process?.classification?.confidentiality
                          }
                          defaultChecked={
                            process?.classification?.confidentiality
                          }
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
                          {classificationOptions.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/** Availability */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="availability"
                      >
                        Disponibilité:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={process?.classification?.availability}
                          defaultChecked={process?.classification?.availability}
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
                          {classificationOptions.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/** Integrity */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="integrity"
                      >
                        Intégrité:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={
                            process?.classification?.integrity
                          }
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
                          {classificationOptions.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/** Traceability */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="confidentiality"
                      >
                        Traçabilité:{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={process?.classification?.traceability}
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
                          {classificationOptions.map((option, key) => (
                            <option key={key} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/** APPROVE CLASSIFICATION */}
                    {process.hasOwnProperty("id") && (
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
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="classificationStatus"
                        >
                          Approuver la classification du processus
                        </label>
                      </div>
                    )}

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
                      {(id !== undefined || process.hasOwnProperty("id")) && (
                        <Link
                          to={`/processes/view/${process?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="user" /> Retourner vers l
                          processus
                        </Link>
                      )}
                      <Link
                        to="/processes"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="undo" /> Naviguer vers les
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
