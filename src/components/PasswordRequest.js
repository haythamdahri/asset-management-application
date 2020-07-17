import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import UserService from "../services/UserService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../images/logo.jpg";
import "../styles/login.css";
import { Link } from "react-router-dom";

export default () => {
  const { register, handleSubmit, errors } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  let abortController = new AbortController();

  useEffect(() => {
    document.title = "Réinitialisation mot de passe";
    document.body.style.backgroundColor = "#f7f9fb";
    document.body.style.fontSize = "14px";
    return () => {
      abortController.abort();
    };
  });

  const onSubmit = async (data) => {
    // Set loading to true
    // Unset error with message
    setLoading(true);
    setSuccess(false);
    setMessage("");
    setError(false);
    // Login user using AuthService
    try {
      await UserService.requestPasswordReset(data.email);
      setLoading(false);
      setSuccess(true);
      setMessage(
        "Un email de réinitialisation du mot de passe est envoyé avec succés!"
      );
      setError(false);
    } catch (error) {
        console.log(error);
      // Set error with message
      setMessage("Une erreur st survenue, veuillez ressayer!");
      setError(true);
      setLoading(false);
      setSuccess(false);
    }
  };

  return (
    <div className="my-login-page">
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

                    {/** Sign in error */}
                    {(error || success) && !loading && (
                      <>
                        <div
                          className={`mt-4 alert fade show font-weight-bold text-center mt-3 ${
                            error ? "alert-danger" : "alert-success"
                          }`}
                          role="alert"
                        >
                          <FontAwesomeIcon icon="exclamation" /> {message}
                        </div>
                      </>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          placeholder="Email"
                          name="email"
                          ref={register({
                            required: true,
                            pattern: /^\S+@\S+$/i,
                          })}
                          type="email"
                          className={`form-control ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          id="email"
                          aria-describedby="emailHelp"
                        />
                        <div className="form-text text-muted">
                          Saisir l'adresse Email de votre compte.
                        </div>
                        {/** Required email error */}
                        {errors.email && errors.email.type === "required" && (
                          <div className="invalid-feedback">
                            Email est requis
                          </div>
                        )}
                        {/** Invalid email error */}
                        {errors.email && errors.email.type === "pattern" && (
                          <div className="invalid-feedback">Invalid email</div>
                        )}
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
                            <FontAwesomeIcon icon="key" /> Envoyer les
                            instructions
                          </>
                        ) : (
                          <>
                            <div
                              className="spinner-border spinner-border-sm text-light"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>{" "}
                            Envoi en cours ...
                          </>
                        )}
                      </button>
                    </form>
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
