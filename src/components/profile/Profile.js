import React, { useState, useEffect, useRef } from "react";
import UserService from "../../services/UserService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { SRLWrapper } from "simple-react-lightbox";

export default () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [isUserError, setIsUserError] = useState(false);
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const [userPictureFile, setUserPictureFile] = useState(false);
  const uploadRef = useRef(null);

  useEffect(() => {
    document.title = "Profil";
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await UserService.getAuthenticatedUserDetails();
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
                <li className="breadcrumb-item">
                  <Link to="/">
                    <FontAwesomeIcon icon="home" /> Acceuil
                  </Link>
                </li>
                <li className="breadcrumb-item active">Profil</li>
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

            {!isLoading && !isUserError && user !== null && (
              <>
                <div className="col-md-3">
                  {/* Profile Image */}
                  <div className="card card-primary card-outline">
                    <div className="card-body box-profile">
                      <div className="text-center">
                        <SRLWrapper>
                          <a
                            href={`${user?.avatar?.file}?date=${Date.now()}`}
                            data-attribute="SRL"
                          >
                            <img
                              className="profile-user-img img-fluid img-circle"
                              src={user?.avatar?.file}
                              alt={user.username}
                              style={{
                                maxHeight: "150px",
                                height: "100%",
                                width: "150px",
                                cursor: "pointer",
                              }}
                            />
                          </a>
                        </SRLWrapper>
                      </div>
                      <h3 className="profile-username text-center">
                        {user.firstName} {user.lastName}
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
                  {/* About Me Box */}
                  <div className="card card-primary">
                    <div className="card-header">
                      <h3 className="card-title">About Me</h3>
                    </div>
                    {/* /.card-header */}
                    <div className="card-body">
                      <strong>
                        <i className="fas fa-book mr-1" /> Education
                      </strong>
                      <p className="text-muted">
                        B.S. in Computer Science from the University of
                        Tennessee at Knoxville
                      </p>
                      <hr />
                      <strong>
                        <i className="fas fa-map-marker-alt mr-1" /> Location
                      </strong>
                      <p className="text-muted">Malibu, California</p>
                      <hr />
                      <strong>
                        <i className="fas fa-pencil-alt mr-1" /> Skills
                      </strong>
                      <p className="text-muted">
                        <span className="tag tag-danger">UI Design</span>
                        <span className="tag tag-success">Coding</span>
                        <span className="tag tag-info">Javascript</span>
                        <span className="tag tag-warning">PHP</span>
                        <span className="tag tag-primary">Node.js</span>
                      </p>
                      <hr />
                      <strong>
                        <i className="far fa-file-alt mr-1" /> Notes
                      </strong>
                      <p className="text-muted">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Etiam fermentum enim neque.
                      </p>
                    </div>
                    {/* /.card-body */}
                  </div>
                  {/* /.card */}
                </div>
                {/* /.col */}
                <div className="col-md-9">
                  <div className="card">
                    <div className="card-header p-2">
                      <ul className="nav nav-pills">
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            href="#activity"
                            data-toggle="tab"
                          >
                            Détails profil
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className="nav-link active"
                            href="#timeline"
                            data-toggle="tab"
                          >
                            Paramétrage
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            href="#settings"
                            data-toggle="tab"
                          >
                            Permissions
                          </a>
                        </li>
                      </ul>
                    </div>
                    {/* /.card-header */}
                    <div className="card-body">
                      <div className="tab-content">
                        <div className="tab-pane" id="activity">
                          {/* Post */}
                          <div className="post">
                            <div className="user-block">
                              <img
                                className="img-circle img-bordered-sm"
                                src="../../dist/img/user1-128x128.jpg"
                                alt="user image"
                              />
                              <span className="username">
                                <a href="#">Jonathan Burke Jr.</a>
                                <a href="#" className="float-right btn-tool">
                                  <i className="fas fa-times" />
                                </a>
                              </span>
                              <span className="description">
                                Shared publicly - 7:30 PM today
                              </span>
                            </div>
                            {/* /.user-block */}
                            <p>
                              Lorem ipsum represents a long-held tradition for
                              designers, typographers and the like. Some people
                              hate it and argue for its demise, but others
                              ignore the hate as they create awesome tools to
                              help create filler text for everyone from bacon
                              lovers to Charlie Sheen fans.
                            </p>
                            <p>
                              <a href="#" className="link-black text-sm mr-2">
                                <i className="fas fa-share mr-1" /> Share
                              </a>
                              <a href="#" className="link-black text-sm">
                                <i className="far fa-thumbs-up mr-1" /> Like
                              </a>
                              <span className="float-right">
                                <a href="#" className="link-black text-sm">
                                  <i className="far fa-comments mr-1" />{" "}
                                  Comments (5)
                                </a>
                              </span>
                            </p>
                            <input
                              className="form-control form-control-sm"
                              type="text"
                              placeholder="Type a comment"
                            />
                          </div>
                          {/* /.post */}
                          {/* Post */}
                          <div className="post clearfix">
                            <div className="user-block">
                              <img
                                className="img-circle img-bordered-sm"
                                src="../../dist/img/user7-128x128.jpg"
                                alt="User Image"
                              />
                              <span className="username">
                                <a href="#">Sarah Ross</a>
                                <a href="#" className="float-right btn-tool">
                                  <i className="fas fa-times" />
                                </a>
                              </span>
                              <span className="description">
                                Sent you a message - 3 days ago
                              </span>
                            </div>
                            {/* /.user-block */}
                            <p>
                              Lorem ipsum represents a long-held tradition for
                              designers, typographers and the like. Some people
                              hate it and argue for its demise, but others
                              ignore the hate as they create awesome tools to
                              help create filler text for everyone from bacon
                              lovers to Charlie Sheen fans.
                            </p>
                            <form className="form-horizontal">
                              <div className="input-group input-group-sm mb-0">
                                <input
                                  className="form-control form-control-sm"
                                  placeholder="Response"
                                />
                                <div className="input-group-append">
                                  <button
                                    type="submit"
                                    className="btn btn-danger"
                                  >
                                    Send
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                          {/* /.post */}
                          {/* Post */}
                          <div className="post">
                            <div className="user-block">
                              <img
                                className="img-circle img-bordered-sm"
                                src="../../dist/img/user6-128x128.jpg"
                                alt="User Image"
                              />
                              <span className="username">
                                <a href="#">Adam Jones</a>
                                <a href="#" className="float-right btn-tool">
                                  <i className="fas fa-times" />
                                </a>
                              </span>
                              <span className="description">
                                Posted 5 photos - 5 days ago
                              </span>
                            </div>
                            {/* /.user-block */}
                            <div className="row mb-3">
                              <div className="col-sm-6">
                                <img
                                  className="img-fluid"
                                  src="../../dist/img/photo1.png"
                                  alt="Photo"
                                />
                              </div>
                              {/* /.col */}
                              <div className="col-sm-6">
                                <div className="row">
                                  <div className="col-sm-6">
                                    <img
                                      className="img-fluid mb-3"
                                      src="../../dist/img/photo2.png"
                                      alt="Photo"
                                    />
                                    <img
                                      className="img-fluid"
                                      src="../../dist/img/photo3.jpg"
                                      alt="Photo"
                                    />
                                  </div>
                                  {/* /.col */}
                                  <div className="col-sm-6">
                                    <img
                                      className="img-fluid mb-3"
                                      src="../../dist/img/photo4.jpg"
                                      alt="Photo"
                                    />
                                    <img
                                      className="img-fluid"
                                      src="../../dist/img/photo1.png"
                                      alt="Photo"
                                    />
                                  </div>
                                  {/* /.col */}
                                </div>
                                {/* /.row */}
                              </div>
                              {/* /.col */}
                            </div>
                            {/* /.row */}
                            <p>
                              <a href="#" className="link-black text-sm mr-2">
                                <i className="fas fa-share mr-1" /> Share
                              </a>
                              <a href="#" className="link-black text-sm">
                                <i className="far fa-thumbs-up mr-1" /> Like
                              </a>
                              <span className="float-right">
                                <a href="#" className="link-black text-sm">
                                  <i className="far fa-comments mr-1" />{" "}
                                  Comments (5)
                                </a>
                              </span>
                            </p>
                            <input
                              className="form-control form-control-sm"
                              type="text"
                              placeholder="Type a comment"
                            />
                          </div>
                          {/* /.post */}
                        </div>
                        {/* /.tab-pane */}
                        <div className="tab-pane active" id="timeline">
                          {/* The timeline */}
                          <div className="timeline timeline-inverse">
                            {/* timeline time label */}
                            <div className="time-label">
                              <span className="bg-danger">10 Feb. 2014</span>
                            </div>
                            {/* /.timeline-label */}
                            {/* timeline item */}
                            <div>
                              <i className="fas fa-envelope bg-primary" />
                              <div className="timeline-item">
                                <span className="time">
                                  <i className="far fa-clock" /> 12:05
                                </span>
                                <h3 className="timeline-header">
                                  <a href="#">Support Team</a> sent you an email
                                </h3>
                                <div className="timeline-body">
                                  Etsy doostang zoodles disqus groupon greplin
                                  oooj voxy zoodles, weebly ning heekya handango
                                  imeem plugg dopplr jibjab, movity jajah
                                  plickers sifteo edmodo ifttt zimbra. Babblely
                                  odeo kaboodle quora plaxo ideeli hulu weebly
                                  balihoo...
                                </div>
                                <div className="timeline-footer">
                                  <a
                                    href="#"
                                    className="btn btn-primary btn-sm"
                                  >
                                    Read more
                                  </a>
                                  <a href="#" className="btn btn-danger btn-sm">
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            {/* END timeline item */}
                            {/* timeline item */}
                            <div>
                              <i className="fas fa-user bg-info" />
                              <div className="timeline-item">
                                <span className="time">
                                  <i className="far fa-clock" /> 5 mins ago
                                </span>
                                <h3 className="timeline-header border-0">
                                  <a href="#">Sarah Young</a> accepted your
                                  friend request
                                </h3>
                              </div>
                            </div>
                            {/* END timeline item */}
                            {/* timeline item */}
                            <div>
                              <i className="fas fa-comments bg-warning" />
                              <div className="timeline-item">
                                <span className="time">
                                  <i className="far fa-clock" /> 27 mins ago
                                </span>
                                <h3 className="timeline-header">
                                  <a href="#">Jay White</a> commented on your
                                  post
                                </h3>
                                <div className="timeline-body">
                                  Take me to your leader! Switzerland is small
                                  and neutral! We are more like Germany,
                                  ambitious and misunderstood!
                                </div>
                                <div className="timeline-footer">
                                  <a
                                    href="#"
                                    className="btn btn-warning btn-flat btn-sm"
                                  >
                                    View comment
                                  </a>
                                </div>
                              </div>
                            </div>
                            {/* END timeline item */}
                            {/* timeline time label */}
                            <div className="time-label">
                              <span className="bg-success">3 Jan. 2014</span>
                            </div>
                            {/* /.timeline-label */}
                            {/* timeline item */}
                            <div>
                              <i className="fas fa-camera bg-purple" />
                              <div className="timeline-item">
                                <span className="time">
                                  <i className="far fa-clock" /> 2 days ago
                                </span>
                                <h3 className="timeline-header">
                                  <a href="#">Mina Lee</a> uploaded new photos
                                </h3>
                                <div className="timeline-body">
                                  <img
                                    src="http://placehold.it/150x100"
                                    alt="..."
                                  />
                                  <img
                                    src="http://placehold.it/150x100"
                                    alt="..."
                                  />
                                  <img
                                    src="http://placehold.it/150x100"
                                    alt="..."
                                  />
                                  <img
                                    src="http://placehold.it/150x100"
                                    alt="..."
                                  />
                                </div>
                              </div>
                            </div>
                            {/* END timeline item */}
                            <div>
                              <i className="far fa-clock bg-gray" />
                            </div>
                          </div>
                        </div>
                        {/* /.tab-pane */}
                        <div className="tab-pane" id="settings">
                          <form className="form-horizontal">
                            <div className="form-group row">
                              <label
                                htmlFor="inputName"
                                className="col-sm-2 col-form-label"
                              >
                                Name
                              </label>
                              <div className="col-sm-10">
                                <input
                                  type="email"
                                  className="form-control"
                                  id="inputName"
                                  placeholder="Name"
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <label
                                htmlFor="inputEmail"
                                className="col-sm-2 col-form-label"
                              >
                                Email
                              </label>
                              <div className="col-sm-10">
                                <input
                                  type="email"
                                  className="form-control"
                                  id="inputEmail"
                                  placeholder="Email"
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <label
                                htmlFor="inputName2"
                                className="col-sm-2 col-form-label"
                              >
                                Name
                              </label>
                              <div className="col-sm-10">
                                <input
                                  type="text"
                                  className="form-control"
                                  id="inputName2"
                                  placeholder="Name"
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <label
                                htmlFor="inputExperience"
                                className="col-sm-2 col-form-label"
                              >
                                Experience
                              </label>
                              <div className="col-sm-10">
                                <textarea
                                  className="form-control"
                                  id="inputExperience"
                                  placeholder="Experience"
                                  defaultValue={""}
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <label
                                htmlFor="inputSkills"
                                className="col-sm-2 col-form-label"
                              >
                                Skills
                              </label>
                              <div className="col-sm-10">
                                <input
                                  type="text"
                                  className="form-control"
                                  id="inputSkills"
                                  placeholder="Skills"
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <div className="offset-sm-2 col-sm-10">
                                <div className="checkbox">
                                  <label>
                                    <input type="checkbox" /> I agree to the{" "}
                                    <a href="#">terms and conditions</a>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="form-group row">
                              <div className="offset-sm-2 col-sm-10">
                                <button
                                  type="submit"
                                  className="btn btn-danger"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                        {/* /.tab-pane */}
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
