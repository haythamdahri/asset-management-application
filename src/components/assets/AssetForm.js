import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import UserService from "../../services/UserService";
import OrganizationService from "../../services/OrganizationService";
import TypologyService from "../../services/TypologyService";
import AssetService from "../../services/AssetService";
import LocationService from "../../services/LocationService";
import ProcessService from "../../services/ProcessService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";

export default () => {
  const { register, handleSubmit, errors } = useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isAssetError, setIsAssetError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [asset, setAsset] = useState({});
  const [description, setDescription] = useState("");
  const [usersData, setUsersData] = useState({
    isLoading: true,
    data: [],
  });
  const [typologiesData, setTypologiesData] = useState({
    isLoading: true,
    data: [],
  });
  const [locationsData, setLocationsData] = useState({
    isLoading: true,
    data: [],
  });
  const [processesData, setProcessesData] = useState({
    isLoading: true,
    data: [],
  });
  const classificationOptions = [1, 2, 3, 4];
  const [file, setFile] = useState(new File([], ""));

  // Process Id Extraction from URL
  let { id } = useParams();
  document.title = "Gestion Des Actifs";

  useEffect(() => {
    setIsLoading(true);
    setIsAssetError(false);
    setIsUnauthorized(false);
    // Check user roles
    UserService.canEditAsset()
      .then((response) => {
        fetchTypologies();
        fetchLocations();
        fetchProcesses();
        if (response.hasRole) {
          // Get process if id is not new
          if (id !== undefined) {
            fetchAsset();
          } else {
            setIsLoading(false);
            setAsset({});
          }
        } else {
          setIsLoading(false);
          setIsUnauthorized(true);
          setIsAssetError(false);
        }
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsAssetError(false);
        } else {
          setIsUnauthorized(false);
          setIsAssetError(true);
        }
        setIsLoading(false);
      });
  }, [reload]);

  const fetchRelatedUsers = async (organizationId) => {
    try {
      setUsersData({ isLoading: true, data: [] });
      const users = await OrganizationService.getOrganizationUsers(
        organizationId
      );
      setUsersData({ isLoading: false, data: users });
    } catch (e) {
      setUsersData({ isLoading: false, data: [] });
    }
  };

  const fetchTypologies = async () => {
    try {
      const typologies = await TypologyService.getCustomTypologies();
      setTypologiesData({ isLoading: false, data: typologies });
    } catch (e) {
      setTypologiesData({ isLoading: false, data: [] });
    }
  };

  const fetchLocations = async () => {
    try {
      const locations = await LocationService.getLocations();
      setLocationsData({ isLoading: false, data: locations });
    } catch (e) {
      setLocationsData({ isLoading: false, data: [] });
    }
  };

  const fetchProcesses = async (processId) => {
    try {
      const processes = await ProcessService.getCustomProcesses();
      setProcessesData({ isLoading: false, data: processes });
      const organizationId = processes?.filter((p) => p?.id === processId)[0]
        ?.organization?.id;
      if (id !== undefined) {
        if (organizationId !== undefined) {
          fetchRelatedUsers(organizationId);
        }
      } else {
        fetchRelatedUsers(processes[0]?.organization?.id);
      }
    } catch (e) {
      setProcessesData({ isLoading: false, data: [] });
    }
  };

  const fetchAsset = async () => {
    try {
      // Get proces
      const asset = await AssetService.getAsset(id);
      if (asset.hasOwnProperty("id")) {
        setAsset(asset);
        setDescription(asset?.description);
      } else {
        setAsset(null);
      }
      fetchProcesses(asset?.process?.id);
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsAssetError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setAsset({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsAssetError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsAssetError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsAssetError(true);
      }
    }
  };

  const onEditorChange = (event, editor) => {
    setDescription(editor.getData());
  };

  const onSubmit = (data) => {
    console.log(data);
    // Verify if data has file in case of update
    if (
      (data.updateImage !== null &&
        data.updateImage === true &&
        (file?.size === 0 || file === undefined || file === null)) ||
      (!asset.hasOwnProperty("id") && file?.size === 0)
    ) {
      Swal.fire(
        "L'image d'actif est invalide!",
        "Veuillez selectionner un fichier valide!",
        "error"
      );
      return;
    }
    setIsSaving(true);
    // Set FormData
    let formData = new FormData();
    formData.set("file", file);
    formData.set("id", asset?.id || null);
    formData.set("name", data?.name);
    formData.set("updateImage", data?.updateImage || false);
    formData.set("description", description);
    formData.set("status", data.status);
    formData.set("location", data.location);
    formData.set("owner", data.owner);
    formData.set("typology", data.typology);
    formData.set("process", data.process);
    formData.set("confidentiality", data.confidentiality);
    formData.set("availability", data.availability);
    formData.set("integrity", data.integrity);
    formData.set("traceability", data.traceability);
    formData.set("classificationStatus", data.classificationStatus);
    AssetService.saveAsset(formData)
      .then((asset) => {
        setAsset(asset);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `L'actif à été enregistré avec succés!`,
          "success"
        );
      })
      .catch((err) => {
        const status = err.response?.status || null;
        if (status !== null && status === 400) {
          Swal.fire(
            "Erreur!",
            `${
              err.response?.message ||
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
                <div className="ribbon bg-success text-lg">Actif</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {(id !== undefined || asset.hasOwnProperty("id")) &&
              !isAssetError &&
              !isUnauthorized &&
              !isLoading &&
              process && (
                <div className="col-12 text-center">
                  <Link
                    to={`/assets/view/${asset?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="backward" /> Retourner vers l'actif
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isAssetError || isUnauthorized || asset === null) &&
              !isLoading && (
                <div className="col-12 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="col-md-12 font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isAssetError && "Une erreur est survenue!"}
                      {isUnauthorized && "Vous n'êtes pas autorisé!"}
                      {asset === null && "Aucun actif n'a été trouvé"}
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>{" "}
                      <Link to={`/assets`}>
                        <button className="btn btn-light font-weight-bold ml-2">
                          <FontAwesomeIcon icon="users" /> Gestion des actifs
                        </button>
                      </Link>
                    </h2>
                  </div>
                </div>
              )}

            {isLoading && !isAssetError && asset !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** PROCESS FORM */}
            {asset !== null &&
              !isAssetError &&
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
                          placeholder="Nom d'actif ..."
                          type="text"
                          id="name"
                          name="name"
                          defaultValue={asset?.name || ""}
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
                            Nom d'actif est requis
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
                        Descirption: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <CKEditor
                          editor={ClassicEditor}
                          data={asset?.description || ""}
                          disabled={isSaving}
                          onChange={onEditorChange}
                        />
                      </div>
                    </div>

                    {/** ASSET IMAGE */}
                    <div className="form-group">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="validatedCustomFile"
                      >
                        Image: {" "}
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

                      {asset?.id !== undefined && (
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
                            Mettre à jour l'image d'actif
                          </label>
                        </div>
                      )}
                    </div>

                    {/** APPROVE ASSET */}
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
                          asset.status = !asset?.status;
                        }}
                        defaultChecked={asset?.status}
                      />
                      <label className="custom-control-label" htmlFor="status">
                        Approuver l'actif
                      </label>
                    </div>

                    {/** Process */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="process"
                      >
                        Processus: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={asset?.process?.id || ""}
                          defaultChecked={asset?.process?.id || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.process ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || processesData?.isLoading}
                          ref={register({
                            required: true,
                          })}
                          onChange={(e) => {
                            fetchRelatedUsers(
                              processesData.data.filter(
                                (p) => p.id === e.target.value
                              )[0]?.organization?.id
                            );
                          }}
                          id="process"
                          name="process"
                        >
                          {processesData?.data &&
                            processesData?.data?.map((p, key) => (
                              <option key={key} value={p?.id}>
                                {p?.name}
                              </option>
                            ))}
                        </select>
                        {/** Required name error */}
                        {errors.process &&
                          errors.process.type === "required" && (
                            <div className="invalid-feedback">
                              Processus est requis
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Organization */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="organization"
                      >
                        Propriétaire: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          value={asset?.owner?.id}
                          onChange={(e) => {
                            setAsset({...asset, owner: {...asset.owner, id: e.target.value}});
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.owner ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || usersData?.isLoading}
                          ref={register({
                            required: true,
                          })}
                          id="owner"
                          name="owner"
                        >
                          {usersData?.data?.map((user, key) => (
                            <option key={key} value={user?.id}>
                              {user?.firstName} {user?.lastName}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.owner && errors.owner.type === "required" && (
                          <div className="invalid-feedback">
                            Propriétaire est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** Typology */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="typology"
                      >
                        Typologie: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={asset?.typology?.id}
                          defaultChecked={asset?.typology?.id}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.typology ? "is-invalid" : ""
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
                        {/** Required name error */}
                        {errors.typology &&
                          errors.typology.type === "required" && (
                            <div className="invalid-feedback">
                              La typologie est requise
                            </div>
                          )}
                      </div>
                    </div>

                    {/** Location */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="location"
                      >
                        Localisation: <b className="text-danger">*</b>{" "}
                      </label>
                      <div className="col-md-9">
                        <select
                          defaultValue={asset?.location?.id}
                          defaultChecked={asset?.location?.id}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.location ? "is-invalid" : ""
                          }`}
                          disabled={isSaving || typologiesData?.isLoading}
                          ref={register({
                            required: true,
                          })}
                          id="location"
                          name="location"
                        >
                          {locationsData?.data?.map((location, key) => (
                            <option key={key} value={location?.id}>
                              {location?.name}
                            </option>
                          ))}
                        </select>
                        {/** Required name error */}
                        {errors.location &&
                          errors.location.type === "required" && (
                            <div className="invalid-feedback">
                              La localisation est requise
                            </div>
                          )}
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
                          defaultValue={asset?.classification?.confidentiality}
                          defaultChecked={
                            asset?.classification?.confidentiality
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
                        {/** Required name error */}
                        {errors.confidentiality &&
                          errors.confidentiality.type === "required" && (
                            <div className="invalid-feedback">
                              La confidentialité de la classification est
                              requise
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
                          defaultValue={asset?.classification?.availability}
                          defaultChecked={asset?.classification?.availability}
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
                        {/** Required name error */}
                        {errors.availability &&
                          errors.availability.type === "required" && (
                            <div className="invalid-feedback">
                              La disponibilité de la classification est requise
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
                          defaultValue={asset?.classification?.integrity}
                          defaultChecked={asset?.classification?.integrity}
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
                        {/** Required name error */}
                        {errors.integrity &&
                          errors.integrity.type === "required" && (
                            <div className="invalid-feedback">
                              L'intégrité de la classification est requise
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
                          defaultValue={asset?.classification?.traceability}
                          defaultChecked={asset?.classification?.traceability}
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
                        {/** Required name error */}
                        {errors.traceability &&
                          errors.traceability.type === "required" && (
                            <div className="invalid-feedback">
                              La traçabilité de la classification est requise
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
                          if (asset?.classification) {
                            asset.classification.status = !asset?.classification
                              ?.status;
                          } else {
                            asset.classification = {
                              status: true,
                            };
                          }
                        }}
                        defaultChecked={asset?.classification?.status}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="classificationStatus"
                      >
                        Approuver la classification d'actif
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
                      {(id !== undefined || asset.hasOwnProperty("id")) && (
                        <Link
                          to={`/assets/view/${asset?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="backward" /> Retourner vers l'actif
                        </Link>
                      )}
                      <Link
                        to="/assets"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="undo" /> Naviguer vers les actifs
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
