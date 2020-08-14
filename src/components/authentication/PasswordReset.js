import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import UserService from "../../services/UserService";
import AuthService from "../../services/AuthService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../../images/logo.jpg";
import "../../styles/login.css";
import { useParams, Link } from "react-router-dom";

export default () => {
  const {
    register,
    handleSubmit,
    errors,
    setError,
    getValues,
    clearErrors,
  } = useForm();
  const [loading, setLoading] = useState(true);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [invalidToken, setInvalidToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [success, setSuccess] = useState(false);
  let abortController = new AbortController();
  // User Id Extraction from URL
  let { token } = useParams();

  useEffect(() => {
    document.title = "Réinitialisation mot de passe";
    document.body.style.backgroundColor = "#f7f9fb";
    // Check token validty
    checkTokenValidity();
    return () => {
      abortController.abort();
    };
  }, []);

  const checkTokenValidity = async () => {
    try {
      await UserService.checkTokenValidity(token);
      setPasswordError(false);
      setInvalidToken(false);
    } catch (e) {
      setInvalidToken(true);
      setPasswordError(true);
      setMessage(
        e.response?.data?.message ||
          "Une erreur est survenue, veuillez ressayer!"
      );
    } finally {
      setVerifyingToken(false);
      setSaving(false);
      setLoading(false);
      setSuccess(false);
    }
  };

  const onSubmit = async (data) => {
    // Check password with confirmation
    if( data.password !== data.passwordConfirm ) {
      setError("passwordConfirm", {type: "notMatch", message: "Les mots de passe ne correspondent pas!"});
      return;
    }
    // Set loading to true
    // Unset error with message
    setLoading(true);
    setSuccess(false);
    setMessage("");
    setError(false);
    setSaving(true);
    // Login user using AuthService
    try {
      await UserService.resetPassword(token, data.password);
      setSuccess(true);
      setMessage("Votre mot de passe est réinitialisé avec succés!");
      setPasswordError(false);
    } catch (err) {
      // Set error with message
      setMessage(
        err?.response?.data?.message ||
          "Une erreur st survenue, veuillez ressayer!"
      );
      setPasswordError(true);
      setSuccess(false);
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  return (
    <div className={`my-login-page ${AuthService.isAuthenticated() ? 'content-wrapper' : ''}`}>
      <div className="col-12 mt-5">
        <section className="h-100">
          <div className="container h-100">
            <div className="row justify-content-center h-100">
              <div className="card-wrapper">
                <div className="brand">
                  <img src={logo} alt="logo" />
                </div>
                <div className="card fat">
                  <div className="card-body">
                    <h4 className="card-title" style={{ marginBottom: "0" }}>
                      Réinitialisation mot de passe
                    </h4>

                    {/** Pasword reset error */}
                    {(passwordError || success) && (
                      <>
                        <div
                          className={`mt-4 alert fade show font-weight-bold text-center mt-5 ${
                            passwordError ? "alert-danger" : "alert-success"
                          }`}
                          role="alert"
                        >
                          <FontAwesomeIcon icon="exclamation-triangle" />{" "}
                          {message}
                        </div>
                        <label className="col-md-6" htmlFor="signin">
                          <Link to="/signin" className="float-left">
                            Se connecter
                          </Link>
                        </label>
                      </>
                    )}

                    {verifyingToken && (
                      <div className="col-12 text-center pt-5 pb-5">
                        <div className="overlay">
                          <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                        </div>
                        <h5 className="display-4 font-weight-bold text-blue">
                          Verification du token
                        </h5>
                      </div>
                    )}

                    {/** Password Reset Form */}
                    {!invalidToken && !verifyingToken && !success && (
                      <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/** PASSWORD */}
                        <div className="form-group">
                          <label htmlFor="password">Mot de passe <b className="text-danger">*</b>{" "}</label>
                          <input
                            placeholder="Mot de passe"
                            name="password"
                            ref={register({
                              required: true,
                              minLength: 6,
                              maxLength: 60,
                            })}
                            type="password"
                            className={`form-control ${
                              errors.password ? "is-invalid" : ""
                            }`}
                            id="password"
                            disabled={saving}
                            autoComplete="off"
                            onChange={(e) => {
                              const value = e.target.value;
                              // this will clear error by only pass the name of field
                              if (
                                value ===
                                getValues("passwordConfirm")?.toString()
                              )
                                return clearErrors("passwordConfirm");
                              // set an error with type and message
                              setError("passwordConfirm", {
                                type: "notMatch",
                                message:
                                  "Les mots de passe ne correspondent pas!",
                              });
                            }}
                          />
                          {/** Required password error */}
                          {errors.password && (
                            <div className="invalid-feedback">
                              {errors.password.type === "required" &&
                                "Mot de passe est requis"}
                              {errors.password.type === "minLength" ? (
                                "Mot de passe est trops court"
                              ) : (
                                <></>
                              )}
                              {errors.password.type === "maxLength" ? (
                                "Mot de passe est trop long"
                              ) : (
                                <></>
                              )}
                            </div>
                          )}
                        </div>

                        {/** PASSWORD CONFIRMATION */}
                        <div className="form-group">
                          <label htmlFor="passwordConfirm">
                            Confirmation mot de passe <b className="text-danger">*</b>{" "}
                          </label>
                          <input
                            placeholder="Confirmation mot de passe"
                            name="passwordConfirm"
                            ref={register({
                              required: true,
                              minLength: 6,
                              maxLength: 60,
                            })}
                            type="password"
                            disabled={saving}
                            className={`form-control ${
                              errors.passwordConfirm ? "is-invalid" : ""
                            }`}
                            onChange={(e) => {
                              const value = e.target.value;
                              // this will clear error by only pass the name of field
                              if (getValues("password")?.toString() === value) {
                                clearErrors("password");
                                return clearErrors("passwordConfirm");
                              }
                              // Set password confirmation error
                              setError("passwordConfirm", {
                                type: "notMatch",
                                message:
                                  "Confirmation mot de passe non valide!",
                              });
                            }}
                            id="passwordConfirm"
                            autoComplete="off"
                          />
                          {/** Required password confirm error */}
                          <div className="invalid-feedback">
                            {errors?.passwordConfirm?.type === "required" && (
                              "Confirmation mot de passe est requis"
                            )}
                            {errors.passwordConfirm &&
                              errors.passwordConfirm.type === "minLength" && (
                                "Confirmation mot de passe est trop court"
                              )}
                            {errors.passwordConfirm &&
                              errors.passwordConfirm.type === "maxLength" && (
                                "Confirmation mot de passe est trop long"
                              )}
                            {errors.passwordConfirm &&
                              errors.passwordConfirm.type === "notMatch" && (
                                "Confirmation mot de passe non valide"
                              )}
                          </div>
                          <label htmlFor="signin">
                            <Link to="/signin" className="float-right">
                              Se connecter
                            </Link>
                          </label>
                        </div>

                        <button
                          disabled={loading}
                          type="submit"
                          className="btn btn-primary btn-block mt-4"
                        >
                          {!loading ? (
                            <>
                              <FontAwesomeIcon icon="key" /> Réinitialiser mot
                              de passe
                            </>
                          ) : (
                            <>
                              <div
                                className="spinner-border spinner-border-sm text-light"
                                role="status"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>{" "}
                              Réinitialisation ...
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
