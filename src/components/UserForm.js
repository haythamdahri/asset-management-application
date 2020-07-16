import React, { useEffect, useState } from "react";
import { IMAGE_URL } from "../services/ConstantsService";
import UserService from "../services/UserService";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import CompanyService from "../services/CompanyService";
import LanguageService from "../services/LanguageService";
import DepartmentService from "../services/DepartmentService";
import LocationService from "../services/LocationService";
import { countries } from "countries-list";

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
  const [companiesData, setCompaniesData] = useState({
    loading: true,
    data: [],
  });
  const [languagesData, setLanguagesData] = useState({
    loading: true,
    data: [],
  });
  const [usersData, setUsersData] = useState({ loading: false, data: [] });
  const [departmentsData, setDepartmentsData] = useState({
    loading: false,
    data: [],
  });
  const [locationsData, setLocationsData] = useState({
    loading: false,
    data: [],
  });

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
    // Fetch users
    fetchUsers();
    // Fetch departments
    fetchDepartments();
    // Fetch locations
    fetchLocations();
    return () => {
      active = false;
    };
  }, []);

  const fetchCompanies = async () => {
    try {
      const companies = await CompanyService.getCompanies();
      setCompaniesData({ loading: false, data: companies });
    } catch (e) {
      setCompaniesData({ loading: false, data: [] });
    }
  };

  const fetchLanguages = async () => {
    try {
      const languages = await LanguageService.getLanguages();
      setLanguagesData({ loading: false, data: languages });
    } catch (e) {
      setLanguagesData({ loading: false, data: [] });
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await UserService.getCustomUsers();
      console.log(users);
      setUsersData({ loading: false, data: users });
    } catch (e) {
      setUsersData({ loading: false, data: [] });
    }
  };

  const fetchDepartments = async () => {
    try {
      const departments = await DepartmentService.getDepartments();
      setDepartmentsData({ loading: false, data: departments });
    } catch (e) {
      setDepartmentsData({ loading: false, data: [] });
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
    console.log(data);
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
    Object.keys(data).forEach((key, index) => {
      formData.set(key, data[key]);
  });
  formData.set("active", data?.active?.toString() || "false");
  formData.set("updateImage", data.updateImage?.toString() || "false");
  return;
    formData.set("firstName", data.firstName);
    formData.set("lastName", data.lastName.toString());
    formData.set("password", data.password.toString());
    formData.set("email", data.email.toString());
    formData.set("company", data.company.toString());
    formData.set("langauge", data.language.toString());
    formData.set("employeeNumber", data.employeeNumber.toString());
    formData.set("title", data.title?.toString());
    formData.set("manager", data.manager?.toString());
    formData.set("department", data.department?.toString());
    formData.set("location", data.location?.toString());
    formData.set("phone", data.title?.toString());
    formData.set("website", data.website?.toString());
    formData.set("address", data.address?.toString());
    formData.set("city", data.city?.toString());
    formData.set("state", data.state?.toString());
    formData.set("country", data.country?.toString());
    formData.set("zip", data.zip.toString());
    formData.set("notes", data.notes.toString());
    formData.set("groups", data.groups.toString());
    formData.set("roles", data.roles.toString());
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
                  <h2 className="col-md-12 font-weight-bold">
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
                        defaultValue={user.lastName || ""}
                        className={`form-control form-control-sm shadow-sm ${
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
                        defaultValue={user.firstName || ""}
                        className={`form-control form-control-sm shadow-sm ${
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
                        defaultValue={user.username || ""}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.username ? "is-invalid" : ""
                        }`}
                        ref={register({
                          required: true,
                        })}
                      />
                      {/** Required Sale Price error */}
                      {errors.username &&
                        errors.username.type === "required" && (
                          <div className="invalid-feedback">
                            Username est requis
                          </div>
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
                        defaultValue={user.password || ""}
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
                    </div></div>

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
                        defaultValue={user.passwordConfirm || ""}
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
                      {errors.passwordConfirm &&
                        errors.passwordConfirm.type === "notMatch" && (
                          <div className="invalid-feedback">
                            {errors.passwordConfirm.message}
                          </div>
                        )}
                    </div></div>

                    {/** EMAIL */}
                    <div className="form-group row">
                      <label className="col-md-3 font-weight-bold" htmlFor="email">
                        Email:{" "}
                      </label>
                      <div className="col-9">
                      <input
                        disabled={saving}
                        placeholder="Email ..."
                        type="text"
                        id="email"
                        name="email"
                        defaultValue={user.email || ""}
                        className={`form-control form-control-sm shadow-sm ${
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
                    </div></div>

                    {/** COMPANY */}
                    <div className="form-group row">
                      <label className="col-md-3 font-weight-bold" htmlFor="company">
                        Société:{" "}
                      </label>
                      <div className="col-md-9">
                      <select
                        defaultValue={user?.company?.id}
                        onClick={(event) => {
                          if (
                            companiesData?.data === null ||
                            companiesData?.data?.length === 0
                          ) {
                            fetchCompanies();
                          }
                        }}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.company ? "is-invalid" : ""
                        }`}
                        disabled={saving || companiesData?.loading}
                        ref={register({
                          required: true,
                        })}
                        id="company"
                        name="company"
                      >
                        {companiesData?.data?.map((company, key) => (
                          <option key={key} value={company.id}>
                            {company?.name}
                          </option>
                        ))}
                      </select>
                    </div></div>

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
                        disabled={saving || companiesData?.loading}
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

                    {/** EMPLOYEE NUMBER */}
                    <div className="form-group row">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="employeeNumber"
                      >
                        Numéro d'employé:{" "}
                      </label>
                      <div className="col-9">
                      <input
                        disabled={saving}
                        placeholder="Numéro d'employé ..."
                        type="text"
                        id="employeeNumber"
                        name="employeeNumber"
                        defaultValue={user.employeeNumber || ""}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        ref={register({
                          required: true,
                        })}
                      />
                      {/** Required Stock error */}
                      {errors.employeeNumber &&
                        errors.employeeNumber.type === "required" && (
                          <div className="invalid-feedback">
                            Numéro d'employé est requis
                          </div>
                        )}
                    </div></div>

                    {/** MANAGER */}
                    <div className="form-group row">
                      <label className="col-md-3 font-weight-bold" htmlFor="manager">
                        Manager:{" "}
                      </label>
                      <div className="col-md-9">
                      <select
                        defaultValue={user?.manager?.id}
                        onClick={(event) => {
                          if (
                            usersData?.data === null ||
                            usersData?.data?.length === 0
                          ) {
                            fetchUsers();
                          }
                        }}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.manager ? "is-invalid" : ""
                        }`}
                        disabled={saving || usersData?.loading}
                        ref={register({
                          required: true,
                        })}
                        id="manager"
                        name="manager"
                      >
                        {usersData?.data?.map(
                          (manager, key) =>
                            manager?.id !== user?.id && (
                              <option key={key} value={manager?.id}>
                                {manager?.firstName} {manager?.lastName}
                              </option>
                            )
                        )}
                      </select>
                    </div></div>

                    {/** DEPARTMENT */}
                    <div className="form-group row">
                      <label className="col-md-3 font-weight-bold" htmlFor="department">
                        Département:{" "}
                      </label>
                      <div className="col-md-9">
                      <select
                        defaultValue={user?.department?.id}
                        onClick={(event) => {
                          if (
                            departmentsData?.data === null ||
                            departmentsData?.data?.length === 0
                          ) {
                            fetchDepartments();
                          }
                        }}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.department ? "is-invalid" : ""
                        }`}
                        disabled={saving || departmentsData?.loading}
                        ref={register({
                          required: true,
                        })}
                        id="department"
                        name="department"
                      >
                        {departmentsData?.data?.map((department, key) => (
                          <option key={key} value={department?.id}>
                            {department?.name}
                          </option>
                        ))}
                      </select>
                    </div></div>

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
                    </div></div>

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
                        defaultValue={user.phone || ""}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.phone ? "is-invalid" : ""
                        }`}
                        ref={register({
                          required: true,
                        })}
                      />
                      {/** Required Stock error */}
                      {errors.phone && errors.phone.type === "required" && (
                        <div className="invalid-feedback">
                          Téléphone est requis
                        </div>
                      )}
                    </div></div>

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
                        defaultValue={user.website || ""}
                        className={`form-control form-control-sm shadow-sm`}
                      />
                    </div></div>

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
                        defaultValue={user.address || ""}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.phone ? "is-invalid" : ""
                        }`}
                        ref={register({
                          required: true,
                        })}
                      />
                      {/** Required Stock error */}
                      {errors.address && errors.address.type === "required" && (
                        <div className="invalid-feedback">
                          Adresse est requis
                        </div>
                      )}
                    </div></div>

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
                        defaultValue={user.city || ""}
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
                    </div></div>

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
                        defaultValue={user.state || ""}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.state ? "is-invalid" : ""
                        }`}
                        ref={register({
                          required: true,
                        })}
                      />
                      {/** Required Stock error */}
                      {errors.state && errors.state.type === "required" && (
                        <div className="invalid-feedback">
                          Région est requis
                        </div>
                      )}
                    </div></div>

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
                        defaultValue={user.zip || ""}
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
                    </div></div>

                    {/** ACTIVE USER */}
                    <div className="custom-control custom-switch mt-2 mb-2 text-center">
                      <input
                        disabled={saving}
                        defaultChecked={user?.active ? true : false}
                        type="checkbox"
                        className="custom-control-input"
                        id="active"
                        name="active"
                        ref={register({
                          required: false,
                        })}
                      />
                      <label className="custom-control-label" htmlFor="active">
                        Activer connexion utilisateur
                      </label>
                    </div>

                    {/** NOTES */}
                    <div className="form-group row">
                      <label className="col-md-3 font-weight-bold" htmlFor="notes">
                        Notes:{" "}
                      </label>
                      <div className="col-md-9">
                      <textarea
                        rows={10}
                        disabled={saving}
                        placeholder="Notes ..."
                        type="text"
                        id="notes"
                        name="notes"
                        defaultValue={user.notes || ""}
                        className={`form-control form-control-sm shadow-sm`}
                      />
                    </div></div>

                    {/** USER IMAGE */}
                    <div className="form-group">
                      <label
                        className="col-md-3 font-weight-bold"
                        htmlFor="validatedCustomFile"
                      >
                        Image:{" "}
                      </label>
                      <div className="custom-file col-md-9">
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
                        <div className="custom-control custom-switch mt-2 text-center">
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
                          Enregistrement ...
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
                      <FontAwesomeIcon icon="undo" /> Naviguer vers les
                      utilisateurs
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
