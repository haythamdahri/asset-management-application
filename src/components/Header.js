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
          <li className="nav-item d-none d-sm-inline-block">
            <Link to="/profile?settings" className="nav-link">
              <FontAwesomeIcon icon="sync" /> Réinitialiser mot de passe
            </Link>
          </li>
          <li className="nav-item d-none d-sm-inline-block">
            <Link to="#" className="nav-link" onClick={onSignOut}>
              <FontAwesomeIcon icon="sign-out-alt" /> Se déconnecter
            </Link>
          </li>
        </ul>
        <ul className="navbar-nav ml-auto">
          {/* Notifications Dropdown Menu */}
          <li className="nav-item dropdown">
            <Link
              className="nav-link"
              data-toggle="dropdown"
              to="#"
              aria-expanded="false"
            >
              <i className="far fa-bell" style={{fontSize: '25px'}} />
              <span className="badge badge-warning navbar-badge" style={{fontSize: '10px'}}>15</span>
            </Link>
            <div
              className="dropdown-menu dropdown-menu-lg dropdown-menu-right"
              style={{ left: "inherit", right: 0 }}
            >
              <span className="dropdown-item dropdown-header">
                15 Notifications
              </span>
              <div className="dropdown-divider" />
              <Link to="#" className="dropdown-item">
                <i className="fas fa-envelope mr-2" /> 4 nouveaux messages
                <span className="float-right text-muted text-sm">3 mins</span>
              </Link>
              <div className="dropdown-divider" />
              <Link to="#" className="dropdown-item">
                <i className="fas fa-users mr-2" /> 8 emails
                <span className="float-right text-muted text-sm">12 heures</span>
              </Link>
              <div className="dropdown-divider" />
              <Link to="#" className="dropdown-item">
                <i className="fas fa-file mr-2" /> 3 rapports
                <span className="float-right text-muted text-sm">2 jours</span>
              </Link>
              <div className="dropdown-divider" />
              <Link to="#" className="dropdown-item dropdown-footer">
                Voir toutes les notifications
              </Link>
            </div>
          </li>
        </ul>
      </nav>
      {/* /.navbar */}
    </div>
  );
};
