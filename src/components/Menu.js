import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IMAGE_URL } from "../services/ConstantsService";
import UserService from "../services/UserService";

export default () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  let active = true;

  useEffect(() => {
    if (active) {
      fetchUser();
    }
    return () => {
      active = false;
    };
  }, []);

  const fetchUser = async () => {
    try {
      const user = await UserService.getAuthenticatedUserDetails();
      user.avatar.file = IMAGE_URL + "/" + user.avatar.id + "/file";
      if (active) {
        setUser(user);
        setLoading(false);
      }
    } catch (e) {
      if (active) {
        setUser(null);
        setLoading(false);
      }
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
          <span className="brand-text font-weight-light">AdminLTE 3</span>
        </Link>
        {/* Sidebar */}
        <div className="sidebar">
          {/* Sidebar user panel (optional) */}
          <div className="user-panel mt-3 pb-3 mb-3 d-flex">
            <div className="image">
              <img
                src={
                  loading
                    ? "../../public/dist/img/boxed-bg.jpg"
                    : user?.avatar?.file
                }
                className="img-circle elevation-2"
                alt="User"
              />
            </div>
            <div className="info">
              <Link to="#" className="d-block">
              { (!loading && user != null) ? user?.firstName + " " + user?.lastName : "USER" }
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
                  <p>
                    Utilisateurs
                  </p>
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
