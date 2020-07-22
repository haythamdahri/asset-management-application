import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserService from "../services/UserService";

export default () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const abortController = new AbortController();

  useEffect(() => {
    UserService.Emitter.on('USER_UPDATED', (user) => {
      setUser(user);
    });
    fetchUser();
    return () => {
      abortController.abort();
    };
  }, []);

  const fetchUser = async () => {
    try {
      const user = await UserService.getAuthenticatedUserDetails();
      user.avatar.file =
        process.env.REACT_APP_API_URL +
        "/api/v1/users/" +
        user?.id +
        "/avatar/file";
      setUser(user);
      setLoading(false);
    } catch (e) {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Main Sidebar Container */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        {/* Brand Logo */}
        <Link to="/" className="brand-link">
          <img
            src="/dist/img/AdminLTELogo.png"
            alt="AdminLTE Logo"
            className="brand-image img-circle elevation-3"
            style={{ opacity: ".8" }}
          />
          <span className="brand-text font-weight-light">Asset Management</span>
        </Link>
        {/* Sidebar */}
        <div className="sidebar">
          {/* Sidebar user panel (optional) */}
          <div className="user-panel mt-3 pb-3 mb-3 d-flex">
            <div className="image">
              <Link to="/profile">
                <img
                  src={
                    loading || user === null
                      ? "/dist/img/boxed-bg.jpg"
                      : user?.avatar?.file
                  }
                  className="img-circle elevation-2"
                  alt="User"
                />
              </Link>
            </div>
            <div className="info">
              <Link to="/profile" className="d-block">
                {!loading && user != null
                  ? user?.firstName + " " + user?.lastName
                  : "USER"}
              </Link>
            </div>
          </div>
          {/* Sidebar Menu */}
          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              {/* Add icons to the links using the .nav-icon class
         with font-awesome or any other icon font library */}
              <li className="nav-item">
                <Link to="/users" className="nav-link">
                  <i className="nav-icon fas fa-users" />
                  <p>Utilisateurs</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/groups" className="nav-link">
                  <i className="nav-icon fas fa-layer-group" />
                  <p>Groupes</p>
                </Link>
              </li>
            </ul>
          </nav>
          {/* /.sidebar-menu */}
        </div>
        {/* /.sidebar */}
      </aside>
    </div>
  );
};
