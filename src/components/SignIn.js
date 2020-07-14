import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import AuthService from "../services/AuthService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../images/logo.jpg";
import "../styles/login.css";

export default () => {
  const { register, handleSubmit, errors } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  let abortController = new AbortController();

  useEffect(() => {
    document.title = "Authentification";
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
    setMessage("");
    setError(false);
    // Login user using AuthService
    try {
      await AuthService.signin(data);
      // Rdirect user to home page
      window.location.href = "/";
    } catch (error) {
      // Set error with message
      setMessage("Email ou mot de passe est incorrect!");
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="row my-login-page">
      <div className="col-12">
        <section className="h-100">
          <div className="container h-100">
            <div className="row justify-content-center h-100">
              <div className="card-wrapper">
                <div className="brand">
                  <img src={logo} alt="logo" />
                </div>
                <div className="card fat">
                  <div className="card-body">
                    <h4 className="card-title">Connexion</h4>

                    {/** Sign in error */}
                    {error && (
                      <>
                        <div
                          className="alert alert-danger fade show font-weight-bold text-center mt-3"
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
                      </div>
                      <div className="form-group">
                        <label htmlFor="password">
                          Mot de passe
                          <a href="forgot.html" className="float-right">
                            Mot de passe oublié?
                          </a>
                        </label>
                        <input
                          name="password"
                          ref={register({ required: true })}
                          type="password"
                          className={`form-control ${
                            errors.password ? "is-invalid" : ""
                          }`}
                          id="password"
                        />
                        {/** Required password error */}
                        <div className="invalid-feedback">
                          Mot de passe est requis
                        </div>
                      </div>
                      <button
                        disabled={loading}
                        type="submit"
                        className="btn btn-primary btn-block mt-4"
                      >
                        {!loading ? (
                          <>
                            <FontAwesomeIcon icon="sign-in-alt" /> Se connecter
                          </>
                        ) : (
                          <>
                            <div
                              className="spinner-border spinner-border-sm text-light"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>{" "}
                            Se connecter
                          </>
                        )}
                      </button>
                      <div className="mt-4 text-center">
                        <a href="register.html">
                          Contacter votre administrateur si vous facez des
                          problèmes
                        </a>
                      </div>
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
