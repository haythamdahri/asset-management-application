import React from "react";
import CKEditor from "ckeditor4-react";

export default ({ user }) => {
  return (
    <div className="col-12">
      <ul className="list-group list-group-unbordered mb-3">
        <li
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Nom</b>
          <span className="float-right mr-5">
            {user?.firstName} {user?.lastName}
          </span>
        </li>
        <li
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Nom</b>
          <span className="float-right mr-5">
            {user?.firstName} {user?.lastName}
          </span>
        </li>
        <li
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Nom</b>
          <span className="float-right mr-5">
            {user?.firstName} {user?.lastName}
          </span>
        </li>
      </ul>
    </div>
  );
};
