import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import GroupService from "../../services/GroupService";
import RoleService from "../../services/RoleService";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default () => {
  const { register, handleSubmit, errors } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isGroupError, setIsGroupError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(false);
  const [group, setGroup] = useState({});
  const [rolesData, setRolesData] = useState({
    loading: false,
    data: [],
  });
  document.title = "Gestion Groupes";

  // Group Id Extraction from URL
  let { id } = useParams();

  useEffect(() => {
    // Set loading
    setIsLoading(true);
    setIsGroupError(false);
    setIsUnauthorized(false);
    setGroup({});
    // Check user permissions
    UserService.checkUserAdmin()
      .then(() => {
        fetchRoles();
        // Get group if id is not new
        if (id !== undefined) {
          fetchGroup();
        } else {
          setIsLoading(false);
          setGroup({});
        }
      })
      .catch((err) => {
        const status = err?.response?.data?.status;
        if (status === 403) {
          setIsUnauthorized(true);
          setIsGroupError(false);
        } else {
          setIsUnauthorized(false);
          setIsGroupError(true);
        }
        setIsLoading(false);
      });
  }, [reload]);

  const fetchRoles = async () => {
    try {
      const roles = await RoleService.getRoles();
      setRolesData({ loading: false, data: roles });
    } catch (e) {
      setRolesData({ loading: false, data: [] });
    }
  };

  const fetchGroup = async () => {
    try {
      // Get group
      const group = await GroupService.getGroup(id);
      setGroup(group);
      setIsLoading(false);
      setIsUnauthorized(false);
      setIsGroupError(false);
    } catch (err) {
      const status = err.response?.status || null;
      setIsLoading(false);
      setGroup({});
      switch (status) {
        case 403:
          setIsUnauthorized(true);
          setIsGroupError(false);
          break;
        case 404:
          setIsUnauthorized(false);
          setIsGroupError(true);
          break;
        default:
          setIsUnauthorized(false);
          setIsGroupError(true);
      }
    }
  };

  const onEditorChange = (event, editor) => {
    setGroup({ ...group, description: editor.getData() });
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    console.log(data);
    GroupService.saveGroup({ id, ...data, description: group.description })
      .then((group) => {
        setGroup(group);
        setIsSaving(false);
        Swal.fire(
          "Operation effectuée!",
          `Le groupe à été enregistré avec succés!`,
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
                <div className="ribbon bg-success text-lg">Groupe</div>
              </div>
            </div>

            {/** BACK BUTTON */}
            {(id !== undefined || group.hasOwnProperty("id")) &&
              !isGroupError &&
              !isUnauthorized &&
              !isLoading && (
                <div className="col-12 text-center">
                  <Link
                    to={`/groups/view/${group?.id}`}
                    type="submit"
                    className="btn btn-dark btn-sm mt-2 font-weight-bold text-center mx-2"
                  >
                    <FontAwesomeIcon icon="user" /> Retourner vers le groupe
                  </Link>
                </div>
              )}

            {/** ERROR MESSAGE */}
            {(isGroupError || isUnauthorized || group === null) && !isLoading && (
              <div className="col-12 mx-auto pt-5">
                <div className="alert alert-warning text-center font-weight">
                  <h2 className="col-md-12 font-weight-bold">
                    <FontAwesomeIcon icon="exclamation-circle" />{" "}
                    {isGroupError && "Une erreur est survenue!"}
                    {isUnauthorized && "Vous n'êtes pas autorisé!"}
                    {group === null && "Aucun groupe n'a été trouvé"}
                    <button
                      onClick={() => setReload(!reload)}
                      className="btn btn-warning font-weight-bold ml-2"
                    >
                      <FontAwesomeIcon icon="sync" /> Ressayer
                    </button>{" "}
                    <Link to={`/groups`}>
                      <button className="btn btn-light font-weight-bold ml-2">
                        <FontAwesomeIcon icon="users" /> Gestion groupes
                      </button>
                    </Link>
                  </h2>
                </div>
              </div>
            )}
            {isLoading && !isGroupError && group !== null && (
              <div className="col-12 text-center pt-5 pb-5">
                <div className="overlay dark">
                  <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                </div>
              </div>
            )}

            {/** GROUP FORM */}
            {group !== null && !isGroupError && !isUnauthorized && !isLoading && (
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
                    <label className="col-md-3 font-weight-bold" htmlFor="name">
                      Nom:{" "}
                    </label>
                    <div className="col-md-9">
                      <input
                        disabled={isSaving}
                        placeholder="Nom ..."
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={group.name || ""}
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
                          Nom du groupe est requis
                        </div>
                      )}
                    </div>
                  </div>

                  {/** Description */}
                  <div className="form-group row">
                    <label
                      className="col-md-3 font-weight-bold"
                      htmlFor="notes"
                    >
                      Description:{" "}
                    </label>
                    <div className="col-md-9">
                      <CKEditor
                        editor={ClassicEditor}
                        data={group?.description}
                        disabled={isSaving}
                        onChange={onEditorChange}
                      />
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
                          defaultValue={group?.roles?.map(
                            (role, key) => role.id
                          )}
                          defaultChecked={group?.roles?.map(
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
                          disabled={isSaving || rolesData?.loading}
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

                  {group.id !== undefined && (
                    <div className="custom-control custom-switch mt-2 text-center mb-2">
                      <input
                        disabled={isSaving}
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
                        Mettre à jour les permissions du groupe
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
                    {(id !== undefined || group.hasOwnProperty("id")) && (
                      <Link
                        to={`/groups/view/${group?.id}`}
                        type="submit"
                        className="btn btn-warning font-weight-bold text-center mx-2"
                      >
                        <FontAwesomeIcon icon="user" /> Retourner vers le groupe
                      </Link>
                    )}
                    <Link
                      to="/groups"
                      type="submit"
                      className="btn btn-secondary font-weight-bold text-center mx-2"
                    >
                      <FontAwesomeIcon icon="undo" /> Naviguer vers les groupes
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
