import React, { useEffect, useState } from "react";
import { IMAGE_URL } from "../services/ConstantsService";
import UserService from "../services/UserService";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import CompanyService from "../services/CompanyService";
import LanguageService from "../services/LanguageService";

export default () => {
  const {
    register,
    handleSubmit,
    errors,
    clearErrors,
    getValues,
    setError,
  } = useForm();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [userError, setUserError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companiesData, setCompaniesData] = useState({loading: true, data: []});
  const [languagesData, setLanguagesData] = useState({loading: true, data: []});
  const [file, setFile] = useState(new File([], ""));
  // User Id Extraction from URL
  let { id } = useParams();
  let active = true;

  useEffect(() => {
    document.title = "Gestion Utilisateurs";
    // Fetch Users
    fetchUser();
    // Fetch companies
    fetchCompanies();
    // Fetch lagnauges
    fetchLanguages();
    return () => {
      active = false;
    };
  }, []);

  const fetchCompanies = async () => {
    try {
     const companies = await CompanyService.getCompanies();
     setCompaniesData({loading: false, data: companies})
    } catch(e) {
      setCompaniesData({loading: false, data: []})
    }
  }

  const fetchLanguages = async () => {
    try {
     const languages = await LanguageService.getLanguages();
     setLanguagesData({loading: false, data: languages})
    } catch(e) {
      console.log(e);
      setLanguagesData({loading: false, data: []})
    }
  }

  const fetchUser = async () => {
    setUnauthorized(false);
    setLoading(true);
    setUserError(false);
    setUser({});
    try {
      const user = await UserService.getUser(id);
      if (!user.hasOwnProperty("id")) {
        setUser(null);
        setLoading(false);
        setUserError(false);
        setUnauthorized(false);
      } else {
        user.avatar.file = IMAGE_URL + "/" + user?.avatar?.id + "/file";
        if (active) {
          setUser(user);
          setLoading(false);
          setUserError(false);
          setUnauthorized(false);
        }
      }
    } catch (e) {
      if (active) {
        const status = e.response?.status || null;
        setLoading(false);
        setUser({});
        switch (status) {
          case 403:
            setUnauthorized(true);
            setUserError(false);
            break;
          case 404:
            setUnauthorized(false);
            setUserError(false);
            setUser(null);
            break;
          default:
            setUserError(true);
            setUnauthorized(false);
        }
      }
    }
  };

  const onSubmit = async (data) => {
    // Verify if data has file in case of update
    if (
      (data.updateImage !== null &&
        data.updateImage === true &&
        (file?.size === 0 || file === undefined || file === null)) ||
      (user?.id === undefined && file?.size === 0)
    ) {
      Swal.fire(
        "L'image d'utilisateur est invalide!",
        "Veuillez selectionner un fichier valide!",
        "error"
      );
      return;
    }
    // Set saving
    setSaving(true);
    // Set FormData
    let formData = new FormData();
    formData.set("image", file);
    formData.set("id", user.id?.toString() || "");
    formData.set("firstName", data.firstName);
    formData.set("lastName", data.lastName.toString());
    formData.set("password", data.password.toString());
    formData.set("email", data.email.toString());
    formData.set("company", data.company.toString());
    formData.set("langauge", data.language.toString());
    formData.set("employeeNumber", data.employeeNumber.toString());
    formData.set("title", data.title.toString());
    formData.set("manager", data.manager.toString());
    formData.set("department", data.department.toString());
    formData.set("location", data.location.toString());
    formData.set("phone", data.title.toString());
    formData.set("website", data.website.toString());
    formData.set("address", data.address.toString());
    formData.set("city", data.city.toString());
    formData.set("state", data.state.toString());
    formData.set("country", data.country.toString());
    formData.set("zip", data.zip.toString());
    formData.set("active", data?.active?.toString() || "false");
    formData.set("notes", data.notes.toString());
    formData.set("groups", data.groups.toString());
    formData.set("roles", data.roles.toString());
    formData.set("updateImage", data.updateImage?.toString() || "false");
    // SEND POST TO SERVER
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
    });
    try {
      setUser(await UserService.saveUser(user.id, formData));
      setSaving(false);
      Toast.fire({
        icon: "success",
        title: `L'utilisateur à été enregistré avec succés!`,
      });
    } catch (e) {
      const status = e.response?.status || null;
      if (status !== null) {
        if (status === 404)
          Toast.fire({
            icon: "error",
            title: `Les données d'entrées ne sont pas valides, veuillez ressayer!`,
          });
      } else {
        Toast.fire({
          icon: "error",
          title: `Une erreur interne est survenue, veuillez ressayer!`,
        });
      }
      setSaving(false);
    }
  };

  return (
    <div className="content-wrapper bg-light pb-5">
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Utilisateur</div>
              </div>
            </div>

            {(userError || unauthorized || user === null) && !loading && (
              <div className="col-12 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {userError && "Une erreur est survenue!"}
                    {unauthorized && "Vous n'êtes pas autorisé!"}
                    {user === null && "Aucun utilisateur n'a été trouvé"}
                    <button
                      onClick={() => fetchUser()}
                      className="btn btn-warning font-weight-bold ml-2"
                    >
                      <FontAwesomeIcon icon="sync" /> Ressayer
                    </button>{" "}
                    <Link to={`/users`}>
                      <button className="btn btn-light font-weight-bold ml-2">
                        <FontAwesomeIcon icon="users" /> Gestion utilisateurs
                      </button>
                    </Link>
                  </h2>
                </div>
              </div>
            )}
            {loading && !userError && user !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {user !== null && !userError && !unauthorized && !loading && (
              <div className="col-9 mx-auto mt-2">
              <div className="shadow p-3 mb-5 bg-white rounded">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="form-group">
                    <label className="font-weight-bold" htmlFor="lastName">
                      Nom:{" "}
                    </label>
                    <input
                      disabled={saving}
                      placeholder="Nom ..."
                      type="text"
                      id="lastName"
                      name="lastName"
                      defaultValue={user.lastName || ""}
                      className={`form-control shadow-sm ${
                        errors.lastName ? "is-invalid" : ""
                      }`}
                      ref={register({
                        required: true,
                      })}
                    />
                    {/** Required name error */}
                    {errors.lastName &&
                      errors.lastName.type === "required" && (
                        <div className="invalid-feedback">Nom est requis</div>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="font-weight-bold" htmlFor="firstName">
                      Prénom:{" "}
                    </label>
                    <input
                      disabled={saving}
                      placeholder="Prénom ..."
                      type="text"
                      id="firstName"
                      name="firstName"
                      defaultValue={user.firstName || ""}
                      className={`form-control shadow-sm ${
                        errors.firstName ? "is-invalid" : ""
                      }`}
                      ref={register({
                        required: true,
                      })}
                    />
                    {/** Required price error */}
                    {errors.firstName &&
                      errors.firstName.type === "required" && (
                        <div className="invalid-feedback">
                          Prénom est requis
                        </div>
                      )}
                  </div>
                  <div className="form-group">
                    <label className="font-weight-bold" htmlFor="username">
                      Username:{" "}
                    </label>
                    <input
                      disabled={saving}
                      placeholder="Username ..."
                      type="text"
                      id="username"
                      name="username"
                      defaultValue={user.username || ""}
                      className={`form-control shadow-sm ${
                        errors.username ? "is-invalid" : ""
                      }`}
                      ref={register({
                        required: true,
                      })}
                    />
                    {/** Required Sale Price error */}
                    {errors.username && errors.username.type === "required" && (
                      <div className="invalid-feedback">
                        Username est requis
                      </div>
                    )}
                  </div>
                  {/** Password with confirmation */}
                  <div className="form-group">
                    <label className="font-weight-bold" htmlFor="password">
                      Mot de passe:{" "}
                    </label>
                    <input
                      disabled={saving}
                      placeholder="Mot de passe ..."
                      type="password"
                      id="password"
                      name="password"
                      autoComplete="false"
                      defaultValue={user.password || ""}
                      className={`form-control shadow-sm ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      ref={register({
                        required: true,
                      })}
                      onChange={(e) => {
                        const value = e.target.value;
                        // this will clear error by only pass the name of field
                        if (value === getValues("passwordConfirm"))
                          return clearErrors("passwordConfirm");
                        // set an error with type and message
                        setError(
                          "passwordConfirm",
                          {type: "notMatch",
                          message: "Les mots de passe ne correspondent pas!"}
                        );
                      }}
                    />
                    {/** Required price error */}
                    {errors.password && errors.password.type === "required" && (
                      <div className="invalid-feedback">
                        Mot de passe est requis
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      className="font-weight-bold"
                      htmlFor="passwordConfirm"
                    >
                      Confirmation mot de passe:{" "}
                    </label>
                    <input
                      disabled={saving}
                      placeholder="Confirmation mot de passe ..."
                      type="password"
                      id="passwordConfirm"
                      name="passwordConfirm"
                      autoComplete="false"
                      defaultValue={user.passwordConfirm || ""}
                      className={`form-control shadow-sm ${
                        errors.passwordConfirm ? "is-invalid" : ""
                      }`}
                      ref={register({
                        required: true,
                      })}
                      onChange={(e) => {
                        const value = e.target.value;
                        // this will clear error by only pass the name of field
                        if (getValues("password").toString() === value)
                          return clearErrors("password");
                        // set an error with type and message
                        setError(
                          "passwordConfirm",
                          "notMatch",
                          "Les mots de passe ne correspondent pas!"
                        );
                      }}
                    />
                    {/** Required price error */}
                    {errors.passwordConfirm && errors.passwordConfirm.type === "notMatch" && (
                      <div className="invalid-feedback">
                         {errors.passwordConfirm.message}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="font-weight-bold" htmlFor="email">
                      Email:{" "}
                    </label>
                    <input
                      disabled={saving}
                      placeholder="Email ..."
                      type="text"
                      id="email"
                      name="email"
                      defaultValue={user.email || ""}
                      className={`form-control shadow-sm ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      ref={register({
                        required: true,
                      })}
                    />
                    {/** Required Stock error */}
                    {errors.email && errors.email.type === "required" && (
                      <div className="invalid-feedback">Email est requis</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="font-weight-bold" htmlFor="views">
                      Société:{" "} 
                    </label>
                    <select
                    defaultValue={user?.company?.id}
                    onClick={(event) => {
                      if( companiesData?.data === null || companiesData?.data?.length === 0 ) {
                        fetchCompanies();
                      }
                    }}
                      className={`form-control shadow-sm ${
                        errors.views ? "is-invalid" : ""
                      }`}
                      disabled={saving || companiesData?.loading}
                      ref={register({
                        required: true
                      })}
                      id="company"
                      name="company"
                    >
                      {companiesData?.data?.map((company, key) => (
                        <option key={key}
                          value={company.id}
                        >
                          {company?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="font-weight-bold" htmlFor="views">
                      Langue:{" "} 
                    </label>
                    <select
                    defaultValue={user?.language?.id}
                    onClick={(event) => {
                      if( languagesData?.data === null || languagesData?.data?.length === 0 ) {
                        fetchLanguages();
                      }
                    }}
                      className={`form-control shadow-sm ${
                        errors.views ? "is-invalid" : ""
                      }`}
                      disabled={saving || companiesData?.loading}
                      ref={register({
                        required: true
                      })}
                      id="language"
                      name="language"
                    >
                      {languagesData?.data?.map((language, key) => (
                        <option key={key}
                          value={language.id}
                        >
                          {language?.name}
                        </option>
                      ))}
                    </select>
                  </div>



                  <div className="form-group">
                    <label
                      className="font-weight-bold"
                      htmlFor="validatedCustomFile"
                    >
                      Image:{" "}
                    </label>
                    <div className="custom-file">
                      <input
                        disabled={saving}
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
                    {user.id !== undefined && (
                      <div className="custom-control custom-switch mt-2">
                        <input
                          disabled={saving}
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
                          Mettre à jour l'image d'utilisateur
                        </label>
                      </div>
                    )}
                  </div>
                  <button
                    disabled={saving}
                    type="submit"
                    className="btn btn-primary font-weight-bold text-center btn-block"
                  >
                    {saving ? (
                      <>
                        <div
                          className="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>{" "}
                        Saving
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon="save" /> Enregistrer
                      </>
                    )}
                  </button>
                  <Link
                    to="/products"
                    type="submit"
                    className="btn btn-warning font-weight-bold text-center btn-block"
                  >
                    <FontAwesomeIcon icon="undo" /> Naviguer vers les utilisateurs
                  </Link>
                </form>
              </div>
                
                </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
