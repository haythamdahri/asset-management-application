import React, { useState, useEffect, useRef } from "react";
import UserService from "../../services/UserService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { SRLWrapper } from "simple-react-lightbox";
import ProfilDetails from "./ProfilDetails";
import ProfileForm from "./ProfileForm";

export default () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [isUserError, setIsUserError] = useState(false);
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const [reload, setReload] = useState(false);
  const uploadRef = useRef(null);

  useEffect(() => {
    document.title = "Profil";
    fetchCurrentUser();
  }, [reload]);

  const fetchCurrentUser = async () => {
    setUser({});
    setIsLoading(true);
    setIsUserError(false);
    try {
      const user = await UserService.getAuthenticatedUserDetails();
      // Fetch user organization
      UserService.getAuthenticatedUserOrganization().then((organization) => {
        setUser({...user, organization: organization});
      });
      user.avatar.file =
        process.env.REACT_APP_API_URL +
        "/api/v1/users/" +
        user?.id +
        "/avatar/file";
      document.title = `${user?.firstName} ${user?.lastName}`;
      setUser(user);
      setIsLoading(false);
      setIsUserError(false);
    } catch (e) {
      setIsLoading(false);
      setIsUserError(false);
      setUser(null);
    }
  };

  const handleFileChange = async (event) => {
    setIsUpdatingPicture(true);
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
    });
    const formData = new FormData();
    formData.append("image", event.target.files[0]);
    try {
      const user = await UserService.updateUserImage(formData);
      user.avatar.file = `${process.env.REACT_APP_API_URL}/api/v1/users/${
        user?.id
      }/avatar/file?date=${Date.now()}`;
      setUser(user);
      UserService.emitter.emit('USER_UPDATED', user);
      Toast.fire({
        icon: "success",
        title: `Image has been updated successfully!`,
      });
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: `Une erreur est survenue, veuillez ressayer!`,
      });
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  return (
    <div className="content-wrapper" style={{ minHeight: "1416.81px" }}>
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Profil</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item" key="LI1">
                  <Link to="/">
                    <FontAwesomeIcon icon="home" /> Acceuil
                  </Link>
                </li>
                <li className="breadcrumb-item active" key="LI2">Profil</li>
              </ol>
            </div>
          </div>
        </div>
        {/* /.container-fluid */}
      </section>
      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/** LOADING */}
            <div className="col-12 text-center">
              {isLoading && !isUserError && user !== null && (
                <div className="col-12 text-center pt-5 pb-5">
                  <div className="overlay dark">
                    <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                  </div>
                </div>
              )}
            </div>

            {(!isLoading && user === null) && (
                <div className="col-12">
                  <div
                    colSpan={14}
                    className="text-center alert alert-warning"
                  >
                    <h2 className="font-weight-bold">
                      <FontAwesomeIcon icon="exclamation-circle" />{" "}
                        Une erreur est survenue!
                      <button
                        onClick={() => setReload(!reload)}
                        className="btn btn-warning font-weight-bold ml-2"
                      >
                        <FontAwesomeIcon icon="sync" /> Ressayer
                      </button>
                    </h2>
                  </div>
                </div>
              )}

            {!isUserError && (
              <>
                <div className="col-md-3">
                  {/* Profile Image */}
                  <div className="card card-primary card-outline">
                    <div className="card-body box-profile">
                      <div className="text-center">
                        <SRLWrapper>
                          {(!isLoading && user !== null) ? (
                          <a
                            href={`${user?.avatar?.file}?date=${Date.now()}&loading=${isLoading}`}
                            data-attribute="SRL"
                          >
                          <img
                            className="profile-user-img img-fluid img-circle"
                            src={(!isLoading && user !== null) ? `${user?.avatar?.file}?date=${Date.now()}&loading=${isLoading}` : `/dist/img/boxed-bg.jpg?date=${Date.now()}&loading=${isLoading}`}
                            alt={user?.username}
                            style={{
                              maxHeight: "150px",
                              height: "100%",
                              width: "150px",
                              cursor: "pointer",
                            }}
                          />
                        </a>
                          ) : (
                            <img
                            className="profile-user-img img-fluid img-circle"
                            src='/dist/img/boxed-bg.jpg'
                            alt={user?.username}
                            style={{
                              maxHeight: "150px",
                              height: "100%",
                              width: "150px",
                              cursor: "pointer",
                            }} />
                          )}
                        </SRLWrapper>
                      </div>
                      <h3 className="profile-username text-center">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-muted text-center">{user?.jobTitle}</p>
                      <div className="col-12 center-block text-center">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="custom-file-input hidden"
                          id="validatedCustomFile"
                          accept="image/*"
                          ref={uploadRef}
                        />
                        <button
                          disabled={isLoading || isUserError}
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => uploadRef.current.click()}
                        >
                          {!isUpdatingPicture ? (
                            <>
                              <FontAwesomeIcon icon="upload" /> Modifier L'image
                            </>
                          ) : (
                            <>
                              <div
                                className="spinner-border spinner-border-sm spinner-border"
                                role="status"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>{" "}
                              Mise à jour d'image
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {/* /.card-body */}
                  </div>
                  {/* /.card */}
                  {/* /.card */}
                </div>
                {/* /.col */}
                <div className="col-md-9">
                  <div className="card" style={{borderTop: '2px solid blue'}}>
                    <div className="card-header p-2">
                      <ul className="nav nav-tabs nav-pills with-arrow lined flex-column flex-sm-row text-center col-12">
                        <li className="nav-item flex-sm-fill" key="LI3">
                          <a
                            className="nav-link active"
                            href="#profileDetails"
                            data-toggle="tab"
                          >
                            Détails profil
                          </a>
                        </li>
                        <li className="nav-item flex-sm-fill" key="LI4">
                          <a
                            className="nav-link"
                            href="#settings"
                            data-toggle="tab"
                          >
                            Paramétrage
                          </a>
                        </li>
                      </ul>
                    </div>
                    {/* /.card-header */}
                    <div className="card-body">
                      <div className="tab-content">
                        <div className="tab-pane active" id="profileDetails">
                          <ProfilDetails user={user} />
                        </div>
                        <div className="tab-pane" id="settings">
                          {!isLoading && !isUserError && (
                          <ProfileForm user={user} setUser={setUser} />
                          )}
                        </div>
                      </div>
                      {/* /.tab-content */}
                    </div>
                    {/* /.card-body */}
                  </div>
                  {/* /.nav-tabs-custom */}
                </div>
                {/* /.col */}
              </>
            )}
          </div>
          {/* /.row */}
        </div>
        {/* /.container-fluid */}
      </section>
      {/* /.content */}
    </div>
  );
};
