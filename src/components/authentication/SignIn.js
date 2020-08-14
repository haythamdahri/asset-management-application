import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import AuthService from "../../services/AuthService";
import SettingService from "../../services/SettingService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../../images/logo.jpg";
import "../../styles/login.css";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import CaptchaService from "../../services/CaptchaService";

export default () => {
  const { register, handleSubmit, errors } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [captchaMaxAttempts, setCaptchaMaxAttempts] = useState(5);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isValidHumanCheck, setIsValidHumanCheck] = useState(false);
  const [isExpiredCaptcha, setIsExpiredCaptcha] = useState(false);
  let captchaRef = useRef(null);
  let abortController = new AbortController();

  useEffect(() => {
    document.title = "Authentification";
    document.body.style.backgroundColor = "#f7f9fb";
    document.body.style.fontSize = "14px";
    // Fetch captcha max attempts
    fetchCaptchaSetting();
    return () => {
      abortController.abort();
    };
  }, []);

  const fetchCaptchaSetting = async () => {
    try {
      const captchaMaxAttempts = await SettingService.getCaptchaAttemptsSetting();
      setCaptchaMaxAttempts(captchaMaxAttempts);
    } catch (err) {}
  };

  const onCaptchaChange = async (humanKey) => {
    if( humanKey === null ) {
      setIsExpiredCaptcha(true);
      return;
    } else {
      setIsExpiredCaptcha(false);
    }
    // Check human key
    try {
      const captchaResponse = await CaptchaService.verifyCaptcha(humanKey);
      setIsValidHumanCheck(captchaResponse?.success);
      if( captchaResponse?.success ) {
        setMessage("");
        setError(false);
      }
    } catch (e) {
      setIsValidHumanCheck(false);
    }
  };

  const onSubmit = async (data) => {
    // Set loading to true
    // Unset error with message
    setLoading(true);
    setMessage("");
    setError(false);
    // Check if loginAttempts greater than max allowed attemps
    if( loginAttempts >= captchaMaxAttempts && !isValidHumanCheck ) {
      // Set error with message
      setMessage("Veuillez verifier le captcha!");
      setError(true);
      setLoading(false);
      return;
    } else if( loginAttempts >= captchaMaxAttempts && isExpiredCaptcha ) {
      // Set error with message
      setMessage("Le captcha est expiré!");
      setError(true);
      setLoading(false);
      return;
    }
    // Login user using AuthService
    try {
      await AuthService.signin(data);
      // Rdirect user to home page
      window.location.href = "/";
    } catch (error) {
      // Set error with message
      setMessage("Email ou mot de passe est incorrecte!");
      setError(true);
      setLoading(false);
      // Increment login attempts
      setLoginAttempts(loginAttempts + 1);
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
                      Connexion
                    </h4>

                    {/** Sign in error */}
                    {error && (
                      <>
                        <div
                          className="mt-4 alert alert-danger fade show font-weight-bold text-center mt-3"
                          role="alert"
                        >
                          <FontAwesomeIcon icon="exclamation" /> {message}
                        </div>
                      </>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                      <div className="form-group">
                        <label htmlFor="email">
                          Email <b className="text-danger">*</b>{" "}
                        </label>
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
                        {/** Required email error */}
                        {errors.email && errors.email.type === "required" && (
                          <div className="invalid-feedback">
                            Email est requis
                          </div>
                        )}
                        {/** Invalid email error */}
                        {errors.email && errors.email.type === "pattern" && (
                          <div className="invalid-feedback">
                            Email est invalide
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="password">
                          Mot de passe <b className="text-danger">*</b>{" "}
                          <Link to="/reset-password" className="float-right">
                            Mot de passe oublié?
                          </Link>
                        </label>
                        <input
                          placeholder="Mot de passe"
                          name="password"
                          ref={register({ required: true })}
                          type="password"
                          className={`form-control ${
                            errors.password ? "is-invalid" : ""
                          }`}
                          id="password"
                          autoComplete="on"
                        />
                        {/** Required password error */}
                        <div className="invalid-feedback">
                          Mot de passe est requis
                        </div>
                      </div>

                      {loginAttempts >= captchaMaxAttempts && (
                        <div className="form-group">
                          <ReCAPTCHA
                            style={{ display: "inline-block" }}
                            sitekey="6Lfit74ZAAAAALJMmqIj1gI5h-CS0-dKhKwildCr"
                            onChange={onCaptchaChange}
                          />
                          {/** Required password error */}
                          <div className="invalid-feedback">
                            Captcha est requis
                          </div>
                        </div>
                      )}

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
