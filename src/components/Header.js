import React, { useRef, useEffect } from "react";
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
              Home
            </Link>
          </li>
          <li className="nav-item d-none d-sm-inline-block">
            <Link to="/contact" className="nav-link">
              Contact
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
                <FontAwesomeIcon icon="id-badge" /> Paramettre Utilisateur
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
        {/* SEARCH FORM */}
        <form className="form-inline ml-3">
          <div className="input-group input-group-sm">
            <input
              className="form-control form-control-navbar"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <div className="input-group-append">
              <button className="btn btn-navbar" type="submit">
                <i className="fas fa-search" />
              </button>
            </div>
          </div>
        </form>
        {/* Right navbar links */}
        <ul className="navbar-nav ml-auto">
          {/* Messages Dropdown Menu */}
          <li className="nav-item dropdown">
            <Link className="nav-link" to="/">
              <i className="far fa-comments" />
              <span className="badge badge-danger navbar-badge">3</span>
            </Link>
          </li>
          {/* Notifications Dropdown Menu */}
          <li className="nav-item dropdown">
            <Link className="nav-link" to="#">
              <i className="far fa-bell" />
              <span className="badge badge-warning navbar-badge">15</span>
            </Link>
            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
              <span className="dropdown-item dropdown-header">
                15 Notifications
              </span>
              <div className="dropdown-divider" />
              <Link to="#" className="dropdown-item">
                <i className="fas fa-envelope mr-2" /> 4 new messages
                <span className="float-right text-muted text-sm">3 mins</span>
              </Link>
              <div className="dropdown-divider" />
              <Link to="#" className="dropdown-item">
                <i className="fas fa-users mr-2" /> 8 friend requests
                <span className="float-right text-muted text-sm">12 hours</span>
              </Link>
              <div className="dropdown-divider" />
              <Link to="#" className="dropdown-item">
                <i className="fas fa-file mr-2" /> 3 new reports
                <span className="float-right text-muted text-sm">2 days</span>
              </Link>
              <div className="dropdown-divider" />
              <Link to="#" className="dropdown-item dropdown-footer">
                See All Notifications
              </Link>
            </div>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              data-widget="control-sidebar"
              data-slide="true"
              to="#"
              role="button"
            >
              <i className="fas fa-th-large" />
            </Link>
          </li>
        </ul>
      </nav>
      {/* /.navbar */}
    </div>
  );
};
