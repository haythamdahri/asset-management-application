import React, { useEffect, useState } from "react";
import UserService from "../../services/UserService";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import OrganizationService from "../../services/OrganizationService";
import LanguageService from "../../services/LanguageService";
import EntityService from "../../services/EntityService";
import RoleService from "../../services/RoleService";
import LocationService from "../../services/LocationService";
import { countries } from "countries-list";
import GroupService from "../../services/GroupService";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
  const [reload, setReload] = useState(false);
  const [userError, setUserError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [organizationsData, setOrganizationsData] = useState({
    loading: true,
    data: [],
  });
  const [languagesData, setLanguagesData] = useState({
    loading: true,
    data: [],
  });
  const [usersData, setUsersData] = useState({ loading: false, data: [] });
  const [entitiesData, setEntitiesData] = useState({
    loading: false,
    data: [],
  });
  const [locationsData, setLocationsData] = useState({
    loading: false,
    data: [],
  });
  const [groupsData, setGroupsData] = useState({
    loading: false,
    data: [],
  });
  const [rolesData, setRolesData] = useState({
    loading: false,
    data: [],
  });

  const [file, setFile] = useState(new File([], ""));
  // User Id Extraction from URL
  let { id } = useParams();
  let abortController = new AbortController();
  document.title = "Gestion Utilisateurs";

  useEffect(() => {
    setLoading(true);
    setUserError(false);
    setUnauthorized(false);
    setUser({});
    UserService.canEditUser()
      .then((response) => {
        if (response.hasRole) {
          // Fetch companies
          fetchOrganizations();
          // Fetch lagnauges
          fetchLanguages();
          // Fetch users
          fetchUsers();
          // Fetch departments
          fetchEntities();
          // Fetch locations
          fetchLocations();
          // Fetch groups
          fetchGroups();
          // Fetch roles
          fetchRoles();
          // Fetch Users if not a new user
          fetchUser();
        } else {
          setLoading(false);
          setUserError(false);
          setUnauthorized(true);
        }
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setUnauthorized(true);
          setUserError(false);
        } else {
          setUnauthorized(false);
          setUserError(true);
        }
        setLoading(false);
      });
    return () => {
      abortController.abort();
    };
  }, [reload]);

  const fetchOrganizations = async () => {
    try {
      const organizations = await OrganizationService.getOrganizations();
      setOrganizationsData({ loading: false, data: organizations });
    } catch (e) {
      setOrganizationsData({ loading: false, data: [] });
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
      setUsersData({ loading: false, data: users });
    } catch (e) {
      setUsersData({ loading: false, data: [] });
    }
  };

  const fetchEntities = async () => {
    try {
      const entities = await EntityService.getEntities();
      setEntitiesData({ loading: false, data: entities });
    } catch (e) {
      setEntitiesData({ loading: false, data: [] });
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

  const fetchGroups = async () => {
    try {
      const groups = await GroupService.getGroups();
      setGroupsData({ loading: false, data: groups });
    } catch (e) {
      setGroupsData({ loading: false, data: [] });
    }
  };

  const fetchRoles = async () => {
    try {
      const roles = await RoleService.getRoles();
      setRolesData({ loading: false, data: roles });
    } catch (e) {
      setRolesData({ loading: false, data: [] });
    }
  };

  const fetchUser = async () => {
    setUnauthorized(false);
    setLoading(true);
    setUserError(false);
    setUser({});

    if (id !== undefined) {
      try {
        const user = await UserService.getUser(id);
        if (!user.hasOwnProperty("id")) {
          setUser(null);
          setLoading(false);
          setUserError(false);
          setUnauthorized(false);
        } else {
          setUser(user);
          setLoading(false);
          setUserError(false);
          setUnauthorized(false);
        }
      } catch (e) {
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
    } else {
      setUser({});
      setLoading(false);
      setUserError(false);
      setUnauthorized(false);
    }
  };

  const onEditorChange = (event, editor) => {
    setUser({ ...user, notes: editor.getData() });
  };

  const onSubmit = async (data) => {
    // Verify if data has file in case of update
    if (
      (data.updateImage !== null &&
        data.updateImage === true &&
        (file?.size === 0 || file === undefined || file === null)) ||
      (!user.hasOwnProperty("id") && file?.size === 0)
    ) {
      Swal.fire(
        "L'image d'utilisateur est invalide!",
        "Veuillez selectionner un fichier valide!",
        "error"
      );
      return;
    }
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
    // Set FormData
    let formData = new FormData();
    formData.set("image", file);
    formData.set("id", user?.id || null);
    formData.set("notes", user?.notes || "");
    for (const [key, value] of Object.entries(data)) {
      if ((key === "roles" || key === "groups") && value.length > 0) {
        formData.set(key, value.join(";"));
      } else {
        formData.set(key, value);
      }
    }
    // SEND POST TO SERVER
    try {
      setUser(await UserService.saveUser(formData));
      setSaving(false);
      Swal.fire(
        "Operation effectuée!",
        `L'utilisateur à été enregistré avec succés!`,
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
    <div className="content-wrapper bg-light pb-5">
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ribbon-wrapper ribbon-lg">
                <div className="ribbon bg-success text-lg">Utilisateur</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {(id !== undefined || user.hasOwnProperty("id")) &&
              !userError &&
              !unauthorized &&
              !loading &&
              user && (
                <div className="col-12 text-center">
                  <Link
                    to={`/users/view/${user?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="user" /> Retourner vers l'utilisateur
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(userError || unauthorized || user === null) && !loading && (
              <div className="col-12 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="col-md-12 font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {userError && "Une erreur est survenue!"}
                    {unauthorized && "Vous n'êtes pas autorisé!"}
                    {user === null && "Aucun utilisateur n'a été trouvé"}
                    <button
                      onClick={() => setReload(!reload)}
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

            {/** USER FORM */}
            {user !== null && !userError && !unauthorized && !loading && (
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
                      htmlFor="lastName"
                    >
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
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="firstName"
                    >
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
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="username"
                    >
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
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="password"
                    >
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
                          if (
                            value === getValues("passwordConfirm")?.toString()
                          )
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
                      {errors.passwordConfirm && (
                          <div className="invalid-feedback">
                            {errors.passwordConfirm.message}
                          </div>
                        )}
                    </div>
                  </div>

                  {/** ACTIVE USER */}
                  {user.hasOwnProperty("id") && (
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
                      <label
                        className="custom-control-label"
                        htmlFor="updatePassword"
                      >
                        Mettre à jour le mot de passe
                      </label>
                    </div>
                  )}

                  {/** EMAIL */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="email"
                    >
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
                    </div>
                  </div>

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
                        defaultValue={user?.organization?.id}
                        defaultChecked={user?.organization?.id}
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
                        disabled={saving || organizationsData?.loading}
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

                  {/** LANGUAGE */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="language"
                    >
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
                          errors.employeeNumber ? "is-invalid" : ""
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
                        defaultValue={user.title || ""}
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

                  {/** JOBTITLE */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="jobTitle"
                    >
                      Poste:{" "}
                    </label>
                    <div className="col-9">
                      <input
                        disabled={saving}
                        placeholder="Poste ..."
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        defaultValue={user.jobTitle || ""}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.jobTitle ? "is-invalid" : ""
                        }`}
                        ref={register({
                          required: true,
                        })}
                      />
                      {/** Required JobTitle error */}
                      {errors.jobTitle &&
                        errors.jobTitle.type === "required" && (
                          <div className="invalid-feedback">
                            Poste est requis
                          </div>
                        )}
                    </div>
                  </div>

                  {/** MANAGER */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="manager"
                    >
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
                        <option key={-1} value={0}>
                          {" "}
                        </option>
                        {usersData?.data?.map(
                          (manager, key) =>
                            manager?.id !== user?.id && (
                              <option key={key} value={manager?.id}>
                                {manager?.firstName} {manager?.lastName}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                  </div>

                  {/** ENTITY */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="entity"
                    >
                      Entité:{" "}
                    </label>
                    <div className="col-md-9">
                      <select
                        defaultValue={user?.department?.id}
                        onClick={(event) => {
                          if (
                            entitiesData?.data === null ||
                            entitiesData?.data?.length === 0
                          ) {
                            fetchEntities();
                          }
                        }}
                        className={`form-control form-control-sm shadow-sm ${
                          errors.department ? "is-invalid" : ""
                        }`}
                        disabled={saving || entitiesData?.loading}
                        ref={register({
                          required: true,
                        })}
                        id="entity"
                        name="entity"
                      >
                        {entitiesData?.data?.map((entity, key) => (
                          <option key={key} value={entity?.id}>
                            {entity?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/** LOCATION */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="location"
                    >
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
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="phone"
                    >
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
                          required: false,
                        })}
                      />
                      {/** Required Stock error */}
                      {errors.phone && errors.phone.type === "required" && (
                        <div className="invalid-feedback">
                          Téléphone est requis
                        </div>
                      )}
                    </div>
                  </div>

                  {/** WEBISTE */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="website"
                    >
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
                        defaultValue={user.website || ""}
                        className={`form-control form-control-sm shadow-sm`}
                      />
                    </div>
                  </div>

                  {/** ADDRESS */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="address"
                    >
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
                    </div>
                  </div>

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
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="notes"
                    >
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

                  <div
                    className="col-12"
                    style={{ borderTope: "blue solid 2px" }}
                  >
                    <p className="h3 text-center font-weight-bold text-blue">
                      Permissions
                    </p>
                  </div>

                  {/** Groups */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="groups"
                    >
                      Groups:
                    </label>
                    <div className="col-md-9">
                      {!groupsData.loading && (
                        <select
                          style={{ height: "100px" }}
                          multiple
                          defaultValue={user?.groups?.map(
                            (group, key) => group.id
                          )}
                          defaultChecked={user?.groups?.map(
                            (group, key) => group.id
                          )}
                          onClick={(event) => {
                            if (
                              groupsData?.data === null ||
                              groupsData?.data?.length === 0
                            ) {
                              fetchGroups();
                            }
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.groups ? "is-invalid" : ""
                          }`}
                          disabled={saving || groupsData?.loading}
                          ref={register({
                            required: false,
                          })}
                          id="groups"
                          name="groups"
                        >
                          {groupsData?.data?.map((group, key) => (
                            <option key={key} value={group?.id}>
                              {group?.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/** ROLES */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="roles"
                    >
                      Roles:
                    </label>
                    <div className="col-md-9">
                      {!rolesData.loading && (
                        <select
                          style={{ height: "200px" }}
                          multiple
                          defaultValue={user?.roles?.map(
                            (role, key) => role.id
                          )}
                          defaultChecked={user?.roles?.map(
                            (role, key) => role.id
                          )}
                          onClick={(event) => {
                            if (
                              rolesData?.data === null ||
                              rolesData?.data?.length === 0
                            ) {
                              fetchRoles();
                            }
                          }}
                          className={`form-control form-control-sm shadow-sm ${
                            errors.roles ? "is-invalid" : ""
                          }`}
                          disabled={saving || rolesData?.loading}
                          ref={register({
                            required: false,
                          })}
                          id="roles"
                          name="roles"
                        >
                          {rolesData?.data?.map((role, key) => (
                            <option key={key} value={role?.id}>
                              {role?.roleName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {user.id !== undefined && (
                    <div className="custom-control custom-switch mt-2 text-center mb-2">
                      <input
                        disabled={saving}
                        type="checkbox"
                        className="custom-control-input"
                        id="updatePermissions"
                        name="updatePermissions"
                        ref={register({
                          required: false,
                        })}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="updatePermissions"
                      >
                        Mettre à jour les permissions d'utilisateur
                      </label>
                    </div>
                  )}

                  <div className="col-12 text-center mb-4 mt-4">
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

                  <hr />

                  <div className="col-12 text-center">
                    {(id !== undefined || user.hasOwnProperty("id")) && (
                      <Link
                        to={`/users/view/${user?.id}`}
                        type="submit"
                        className="btn btn-warning font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="user" /> Retourner vers
                        l'utilisateur
                      </Link>
                    )}
                    <Link
                      to="/users"
                      type="submit"
                      className="btn btn-secondary font-weight-bold text-center mx-2"
                    >
                      <FontAwesomeIcon icon="undo" /> Naviguer vers les
                      utilisateurs
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
