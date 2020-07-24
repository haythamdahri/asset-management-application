import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import LanguageService from "../../services/LanguageService";
import LocationService from "../../services/LocationService";
import { countries } from "countries-list";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default ({ user, setUser }) => {
  const {
    register,
    handleSubmit,
    errors,
    clearErrors,
    getValues,
    setError,
  } = useForm();
  const [saving, setSaving] = useState(false);
  const [languagesData, setLanguagesData] = useState({
    loading: true,
    data: [],
  });
  const [locationsData, setLocationsData] = useState({
    loading: false,
    data: [],
  });
  const [notes, setNotes] = useState(user?.notes || "");

  document.title = "Gestion Utilisateurs";

  useEffect(() => {
    console.log(user);
    fetchLanguages();
    fetchLocations();
  }, []);

  const fetchLanguages = async () => {
    try {
      const languages = await LanguageService.getLanguages();
      setLanguagesData({ loading: false, data: languages });
    } catch (e) {
      setLanguagesData({ loading: false, data: [] });
    }
  };

  const fetchLocations = async () => {
    try {
      const locations = await LocationService.getLocations();
      setLocationsData({ loading: false, data: locations });
    } catch (e) {
      setLocationsData({ loading: false, data: [] });
    }
  };

  const onEditorChange = (event, editor) => {
    setNotes(editor.getData());
  };

  const onSubmit = async (data) => {
    // CHECK PASSWORD
    if (data.updatePassword) {
      if (!data.password) {
        setError("password", {
          type: "required",
          message: "Mot de passe est requis",
        });
        window.scrollTo(0, 0);
        return;
      } else if (!data.passwordConfirm) {
        setError("passwordConfirm", {
          type: "required",
          message: "Confirmation du mot de passe est requise",
        });
        window.scrollTo(0, 0);
        return;
      } else if (
        data.password &&
        data.passwordConfirm &&
        data.password !== data.passwordConfirm
      ) {
        setError("password", {
          type: "required",
          message: "Les mots de passe ne correspondent pas!",
        });
        setError("passwordConfirm", {
          type: "required",
          message: "Les mots de passe ne correspondent pas!",
        });
        window.scrollTo(0, 0);
        return;
      }
    }
    // Set saving
    setSaving(true);
    // Set Data
    data["notes"] = notes;
    // SEND POST TO SERVER
    try {
      const organization = user?.organization;
      const updatedUser = await UserService.saveUserProfile(data);
      updatedUser.avatar.file =
        process.env.REACT_APP_API_URL +
        "/api/v1/users/" +
        user?.id +
        "/avatar/file";
      setUser({ ...updatedUser, organization });
      UserService.Emitter.emit("USER_UPDATED", user);
      setSaving(false);
      Swal.fire(
        "Operation effectuée!",
        `Votre profil à été enregistré avec succés!`,
        "success"
      );
    } catch (e) {
      const status = e.response?.status || null;
      if (status !== null && status === 400) {
        Swal.fire(
          "Erreur!",
          `${
            e.response?.data.message ||
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
      setSaving(false);
    }
  };

  return (
      <div className="col-12">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-3 mb-5">
          {/** LASTNAME */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="lastName">
              Nom:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Nom ..."
                type="text"
                id="lastName"
                name="lastName"
                defaultValue={user?.lastName || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.lastName ? "is-invalid" : ""
                }`}
                ref={register({
                  required: true,
                })}
              />
              {/** Required name error */}
              {errors.lastName && errors.lastName.type === "required" && (
                <div className="invalid-feedback">Nom est requis</div>
              )}
            </div>
          </div>

          {/** FIRSTNAME */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="firstName">
              Prénom:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Prénom ..."
                type="text"
                id="firstName"
                name="firstName"
                defaultValue={user?.firstName || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.firstName ? "is-invalid" : ""
                }`}
                ref={register({
                  required: true,
                })}
              />
              {/** Required price error */}
              {errors.firstName && errors.firstName.type === "required" && (
                <div className="invalid-feedback">Prénom est requis</div>
              )}
            </div>
          </div>

          {/** USERNAME */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="username">
              Username:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Username ..."
                type="text"
                id="username"
                name="username"
                defaultValue={user?.username || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.username ? "is-invalid" : ""
                }`}
                ref={register({
                  required: true,
                })}
              />
              {/** Required Sale Price error */}
              {errors.username && errors.username.type === "required" && (
                <div className="invalid-feedback">Username est requis</div>
              )}
            </div>
          </div>

          {/** PASSWORD */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="password">
              Mot de passe:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Mot de passe ..."
                type="password"
                id="password"
                name="password"
                autoComplete="false"
                defaultValue={user?.password || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.password ? "is-invalid" : ""
                }`}
                ref={register({
                  required: false,
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  // this will clear error by only pass the name of field
                  if (value === getValues("passwordConfirm")?.toString())
                    return clearErrors("passwordConfirm");
                  // set an error with type and message
                  setError("passwordConfirm", {
                    type: "notMatch",
                    message: "Les mots de passe ne correspondent pas!",
                  });
                }}
              />
              {/** Required password error */}
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>
          </div>

          {/** PASSWORD CONFIRMATION */}
          <div className="form-group row">
            <label
              className="col-md-3 font-weight-bold"
              htmlFor="passwordConfirm"
            >
              Confirmation mot de passe:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Confirmation mot de passe ..."
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                autoComplete="false"
                defaultValue={user?.passwordConfirm || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.passwordConfirm ? "is-invalid" : ""
                }`}
                ref={register({
                  required: false,
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  // this will clear error by only pass the name of field
                  if (getValues("password")?.toString() === value) {
                    clearErrors("password");
                    return clearErrors("passwordConfirm");
                  }
                  // set an error with type and message
                  setError("passwordConfirm", {
                    type: "notMatch",
                    message: "Les mots de passe ne correspondent pas!",
                  });
                }}
              />
              {/** Required price error */}
              {errors.passwordConfirm && (
                <div className="invalid-feedback">
                  {errors.passwordConfirm.message}
                </div>
              )}
            </div>
          </div>

          {/** ACTIVE USER */}
          {user?.hasOwnProperty("id") && (
            <div className="custom-control custom-switch mt-2 mb-2 text-center">
              <input
                disabled={saving}
                type="checkbox"
                className="custom-control-input"
                id="updatePassword"
                name="updatePassword"
                ref={register({
                  required: false,
                })}
              />
              <label className="custom-control-label" htmlFor="updatePassword">
                Mettre à jour le mot de passe
              </label>
            </div>
          )}

          {/** LANGUAGE */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="language">
              Langue:{" "}
            </label>
            <div className="col-md-9">
              <select
                defaultValue={user?.language?.id}
                onClick={(event) => {
                  if (
                    languagesData?.data === null ||
                    languagesData?.data?.length === 0
                  ) {
                    fetchLanguages();
                  }
                }}
                className={`form-control form-control-sm shadow-sm ${
                  errors.language ? "is-invalid" : ""
                }`}
                disabled={saving || languagesData?.loading}
                ref={register({
                  required: true,
                })}
                id="language"
                name="language"
              >
                {languagesData?.data?.map((language, key) => (
                  <option key={key} value={language.id}>
                    {language?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/** TITLE */}
          <div className="form-group row">
            <label
              className="col-md-3 font-weight-bold"
              htmlFor="employeeNumber"
            >
              Titre:{" "}
            </label>
            <div className="col-9">
              <input
                disabled={saving}
                placeholder="Titre ..."
                type="text"
                id="title"
                name="title"
                defaultValue={user?.title || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.title ? "is-invalid" : ""
                }`}
                ref={register({
                  required: true,
                })}
              />
              {/** Required Stock error */}
              {errors.title && errors.title.type === "required" && (
                <div className="invalid-feedback">Titre est requis</div>
              )}
            </div>
          </div>

          {/** LOCATION */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="location">
              Localisation:{" "}
            </label>
            <div className="col-md-9">
              <select
                defaultValue={user?.location?.id}
                onClick={(event) => {
                  if (
                    locationsData?.data === null ||
                    locationsData?.data?.length === 0
                  ) {
                    fetchLocations();
                  }
                }}
                className={`form-control form-control-sm shadow-sm ${
                  errors.location ? "is-invalid" : ""
                }`}
                disabled={saving || locationsData?.loading}
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
            </div>
          </div>

          {/** PHONE */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="phone">
              Téléphone:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Téléphone ..."
                type="text"
                id="phone"
                name="phone"
                defaultValue={user?.phone || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.phone ? "is-invalid" : ""
                }`}
                ref={register({
                  required: false,
                })}
              />
              {/** Required Stock error */}
              {errors.phone && errors.phone.type === "required" && (
                <div className="invalid-feedback">Téléphone est requis</div>
              )}
            </div>
          </div>

          {/** WEBISTE */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="website">
              Site web:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Site web ..."
                type="text"
                id="website"
                name="website"
                ref={register({
                  required: false,
                })}
                defaultValue={user?.website || ""}
                className={`form-control form-control-sm shadow-sm`}
              />
            </div>
          </div>

          {/** ADDRESS */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="address">
              Adresse:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Adresse ..."
                type="text"
                id="address"
                name="address"
                defaultValue={user?.address || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.phone ? "is-invalid" : ""
                }`}
                ref={register({
                  required: true,
                })}
              />
              {/** Required Stock error */}
              {errors.address && errors.address.type === "required" && (
                <div className="invalid-feedback">Adresse est requis</div>
              )}
            </div>
          </div>

          {/** CITY */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="city">
              Ville:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Ville ..."
                type="text"
                id="city"
                name="city"
                defaultValue={user?.city || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.city ? "is-invalid" : ""
                }`}
                ref={register({
                  required: true,
                })}
              />
              {/** Required Stock error */}
              {errors.city && errors.city.type === "required" && (
                <div className="invalid-feedback">Ville est requis</div>
              )}
            </div>
          </div>

          {/** STATE */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="state">
              Région:{" "}
            </label>
            <div className="col-md-9">
              <input
                disabled={saving}
                placeholder="Région ..."
                type="text"
                id="state"
                name="state"
                defaultValue={user?.state || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.state ? "is-invalid" : ""
                }`}
                ref={register({
                  required: true,
                })}
              />
              {/** Required Stock error */}
              {errors.state && errors.state.type === "required" && (
                <div className="invalid-feedback">Région est requis</div>
              )}
            </div>
          </div>

          {/** COUNTRY */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="country">
              Pays:{" "}
            </label>
            <div className="col-md-9">
              <select
                defaultValue={user?.country}
                className={`form-control form-control-sm shadow-sm ${
                  errors.location ? "is-invalid" : ""
                }`}
                disabled={saving}
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
                disabled={saving}
                placeholder="Code postal ..."
                type="text"
                id="zip"
                name="zip"
                defaultValue={user?.zip || ""}
                className={`form-control form-control-sm shadow-sm ${
                  errors.zip ? "is-invalid" : ""
                }`}
                ref={register({
                  required: true,
                })}
              />
              {/** Required Stock error */}
              {errors.zip && errors.zip.type === "required" && (
                <div className="invalid-feedback">Code postal est requis</div>
              )}
            </div>
          </div>

          {/** NOTES */}
          <div className="form-group row">
            <label className="col-md-3 font-weight-bold" htmlFor="notes">
              Notes:{" "}
            </label>
            <div className="col-md-9">
              <CKEditor
                editor={ClassicEditor}
                data={user?.notes || ""}
                disabled={saving}
                onChange={onEditorChange}
              />
            </div>
          </div>

          <div className="col-8 text-center mb-4 mt-4">
            <button
              disabled={saving}
              type="submit"
              className="btn btn-primary font-weight-bold text-center w-50"
            >
              {saving ? (
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
        </form>
      </div>
  );
};
