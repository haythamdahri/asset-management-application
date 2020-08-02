import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthService from "../services/AuthService";

export default () => {
  const onSignOut = () => {
    AuthService.signout();
    window.location.href = "/signin";
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        {/* Left navbar links */}
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link
              className="nav-link"
              data-widget="pushmenu"
              to="/"
              role="button"
            >
              <i className="fas fa-bars" />
            </Link>
          </li>
          <li className="nav-item d-none d-sm-inline-block">
            <Link to="/" className="nav-link">
            <FontAwesomeIcon icon="home" /> Acceuil
            </Link>
          </li>
          {/** USER */}
          {AuthService.isAuthenticated() && (
            <li className="nav-item dropdown">
              <Link
                id="dropdownSubMenu1"
                to="#"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                className="nav-link dropdown-toggle"
              >
                <FontAwesomeIcon icon="id-badge" /> Parametres Utilisateur
              </Link>
              <ul
                aria-labelledby="dropdownSubMenu1"
                className="dropdown-menu border-0 shadow"
                style={{ left: 0, right: "inherit" }}
              >
                <li>
                  <Link
                    className="dropdown-item active"
                    to="#"
                    onClick={onSignOut}
                  >
                    <FontAwesomeIcon icon="sign-out-alt" /> Se déconnecter
                  </Link>
                </li>
                <li>
                  <Link to="/reset-password" className="dropdown-item">
                    <FontAwesomeIcon icon="sync" /> Réinitialiser mot de passe
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
        </nav>
      {/* /.navbar */}
    </div>
  );
};
