import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import LocationService from "../../services/LocationService";
import { countries } from "countries-list";

export default () => {
  const { register, handleSubmit, errors } = useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isLocationError, setIsLocationError] = useState(false);
  const [location, setLocation] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [file, setFile] = useState(new File([], ""));
  document.title = "Gestion Des Localisations";

  // Ids Extraction from URL
  let { id } = useParams();

  useEffect(() => {
    // Set loading
    setIsLoading(true);
    setIsLocationError(false);
    setIsUnauthorized(false);
    setLocation({});
    // Check user permissions
    UserService.canEditLocation()
      .then((response) => {
          if( response?.hasRole ) {
            // Get group if id is not new
            if (id !== undefined) {
              fetchLocation();
            } else {
              setIsLoading(false);
              setLocation({});
            }
          } else {
            setIsUnauthorized(true);
            setIsLocationError(false);
          }
          setIsLoading(false);
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsLocationError(false);
        } else {
          setIsUnauthorized(false);
          setIsLocationError(true);
        }
        setIsLoading(false);
      });
  }, [reload]);

  const fetchLocation = async () => {
    try {
      // Get location
      const location = await LocationService.getLocation(id);
      console.log(location);
      if( location.hasOwnProperty("id") ) {
        setLocation(location)
      } else {
        setLocation(null);
      }
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsLocationError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setIsLocationError({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsLocationError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsLocationError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsLocationError(false);
          setLocation(null);
      }
    }
  };

  const onSubmit = async (data) => {
    // Verify if data has file in case of update
    if (
      (data.updateImage !== null &&
        data.updateImage === true &&
        (file?.size === 0 || file === undefined || file === null)) ||
      (!location.hasOwnProperty("id") && file?.size === 0)
    ) {
      Swal.fire(
        "L'image de la localisation est invalide!",
        "Veuillez selectionner un fichier valide!",
        "error"
      );
      return;
    }
    setIsSaving(true);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("name", data?.name);
    formData.set("address1", data?.address1);
    formData.set("address2", data?.address2);
    formData.set("address2", data?.address2);
    formData.set("city", data?.city);
    formData.set("state", data?.state);
    formData.set("country", data?.country);
    formData.set("zip", data?.zip);
    formData.set("image", file);
    formData.set("updateImage", data?.updateImage || false);
    LocationService.saveLocation(formData)
      .then((location) => {
        setLocation(location);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `La localisation à été enregistrée avec succés!`,
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
                <div className="ribbon bg-success text-lg">Localisations</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {(id !== undefined && location !== null && location.hasOwnProperty("id")) &&
              !isLocationError &&
              !isUnauthorized &&
              !isLoading && (
                <div className="col-12 text-center">
                  <Link
                    to={`/locations/view/${location?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="user" /> Retourner vers la localisation
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isLocationError || isUnauthorized || location === null) &&
              !isLoading && (
                <div className="col-12 mx-auto pt-5">
                  <div className="alert alert-warning text-center font-weight">
                    <h2 className="col-md-12 font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                      {isLocationError && "Une erreur est survenue!"}
                      {isUnauthorized && "Vous n'êtes pas autorisé!"}
                      {location === null && "Aucune localisation n'a été trouvée"}
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>{" "}
                      <Link to={`/groups`}>
                        <button className="btn btn-light font-weight-bold ml-2">
                          <FontAwesomeIcon icon="users" /> Gestion des menaces
                        </button>
                      </Link>
                    </h2>
                  </div>
                </div>
              )}
            {isLoading && !isLocationError && location !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** LOCATION FORM */}
            {location !== null &&
              !isLocationError &&
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
                          defaultValue={location?.name || ""}
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
                            Nom de la localisation est requis
                          </div>
                        )}
                      </div>
                    </div>

                    {/** address1 */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="address1"
                      >
                        Adresse 1:{" "}
                      </label>
                      <div className="col-md-9">
                        <textarea
                          defaultValue={location?.address1}
                          disabled={isSaving}
                          placeholder="Adresse 1 ..."
                          id="address1"
                          rows={4}
                          name="address1"
                          className={`form-control form-control-sm shadow-sm ${
                            errors.address1 ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required error */}
                        {errors.address1 && errors.address1.type === "required" && (
                          <div className="invalid-feedback">
                            Adresse 1 de la localisation est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** address2 */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="address2"
                      >
                        Adresse 2:{" "}
                      </label>
                      <div className="col-md-9">
                        <textarea
                          defaultValue={location?.address2}
                          disabled={isSaving}
                          placeholder="Adresse 2 ..."
                          id="address2"
                          rows={4}
                          name="address2"
                          className={`form-control form-control-sm shadow-sm ${
                            errors.address2 ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required error */}
                        {errors.address2 && errors.address2.type === "required" && (
                          <div className="invalid-feedback">
                            Adresse 2 de la localisation est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** CITY */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="city"
                      >
                        Ville:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Ville ..."
                          type="text"
                          id="city"
                          name="city"
                          defaultValue={location?.city || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.city ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required error */}
                        {errors.city && errors.city.type === "required" && (
                          <div className="invalid-feedback">
                            La ville de la localisation est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** STATE */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="state"
                      >
                        Région:{" "}
                      </label>
                      <div className="col-md-9">
                        <input
                          disabled={isSaving}
                          placeholder="Région ..."
                          type="text"
                          id="state"
                          name="state"
                          defaultValue={location?.state || ""}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.state ? "is-invalid" : ""
                          }`}
                          ref={register({
                            required: true,
                          })}
                        />
                        {/** Required error */}
                        {errors.state && errors.state.type === "required" && (
                          <div className="invalid-feedback">
                            La région de la localisation est requise
                          </div>
                        )}
                      </div>
                    </div>

                    {/** COUNTRY */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="country"
                    >
                      Pays:{" "}
                    </label>
                    <div className="col-md-9">
                      <select
                        value={location?.country}
                        onChange={e => {
                          setLocation({...location, country: e.target.value})
                        }}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.location ? "is-invalid" : ""
                        }`}
                        disabled={isSaving}
                        ref={register({
                          required: true,
                        })}
                        id="country"
                        name="country"
                      >
                        {Object.keys(countries).map((key, index) => (
                          <option key={index} value={countries[key].name}>
                            {countries[key].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/** ZIP */}
                  <div className="form-group row">
                    <label className="col-md-3 font-weight-bold" htmlFor="zip">
                      Code postal:{" "}
                    </label>
                    <div className="col-md-9">
                      <input
                        disabled={isSaving}
                        placeholder="Code postal ..."
                        type="text"
                        id="zip"
                        name="zip"
                        defaultValue={location?.zip || ""}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.zip ? "is-invalid" : ""
                        }`}
                        ref={register({
                          required: true,
                        })}
                      />
                      {/** Required Stock error */}
                      {errors.zip && errors.zip.type === "required" && (
                        <div className="invalid-feedback">
                          Code postal est requis
                        </div>
                      )}
                    </div>
                  </div>
                      
                   {/** LOCATION IMAGE */}
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

                    {location?.id !== undefined && (
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
                          Mettre à jour l'image de la localisation
                        </label>
                      </div>
                    )}
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
                      {((id !== undefined ) || location.hasOwnProperty("id")) && (
                        <Link
                          to={`/locations/view/${location?.id}`}
                          type="submit"
                          className="btn btn-warning font-weight-bold text-center mx-2"
                        >
                          <FontAwesomeIcon icon="user" /> Retourner vers la localisation
                        </Link>
                      )}
                      <Link
                        to="/locations"
                        type="button"
                        className="btn btn-secondary font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="undo" /> Naviguer vers les localisations
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
