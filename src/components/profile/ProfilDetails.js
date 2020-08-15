import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default ({ user, setUser }) => {
  
  useEffect(() => {
    if( user?.hasOwnProperty("id") ) {
      // Associate js files
      const script = document.createElement("script");
      script.src = "/js/content.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [user])

  return (
    <div className="col-12" key={user?.id}>
      <ul key="UL1" className="list-group list-group-unbordered mb-3">
        <li
          key="LI1"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Nom</b>
          <span className="float-right mr-5">{user?.lastName}</span>
        </li>
        <li
          key="LI2"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Prénom</b>
          <span className="float-right mr-5">{user?.firstName}</span>
        </li>
        <li
          key="LI3"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Email</b>
          <span className="float-right mr-5">{user?.email}</span>
        </li>
        <li
          key="LI4"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Téléphone</b>
          <span className="float-right mr-5">{user?.phone}</span>
        </li>
        <li
          key="LI5"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Localisation</b>
          <span className="float-right mr-5">{user?.location?.name}</span>
        </li>
        <li
          key="LI6"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Entité</b>
          <span className="float-right mr-5">{user?.entity?.name}</span>
        </li>
        <li
          key="LI7"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Organisme</b>
          <span className="float-right mr-5">
            <Link to={`/organizations/view/${user?.organization?.id}`}>
              {user?.organization?.name}
            </Link>
          </span>
        </li>
        <li
          key="LI8"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Groupes</b>
          <span className="float-right mr-5">
            {user?.groups?.map((group, key) => (
              <Link key={key} to={`/groups/view/${group.id}`}>
                {group.name}
                {key === user.groups.length - 1 ? "" : " , "}
              </Link>
            ))}
          </span>
        </li>
        <li
          key="LI9"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Poste</b>
          <span className="float-right mr-5">{user?.jobTitle}</span>
        </li>
        <li
          key="LI10"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Numéro d'employé</b>
          <span className="float-right mr-5">{user?.employeeNumber}</span>
        </li>
        <li
          key="LI11"
          className="list-group-item"
          style={{
            borderTop: "2px solid black",
          }}
        >
          <b className="ml-5">Notes</b>
          <span className="float-right mr-5">
            {user?.notes && user?.notes?.length > 0 && (
              <CKEditor
                editor={ClassicEditor}
                data={user?.notes}
                config={{
                  toolbar: [],
                  removePlugins: ["Heading", "Link"],
                  isReadOnly: true,
                }}
                disabled={true}
              />
            )}
          </span>
        </li>
        <li
          className="list-group-item"
          style={{
            borderTop: "2px solid black",
            borderBottom: "2px solid black",
          }}
        >
          <b className="ml-5">Roles</b>
          <span className="ml-5">
            <ul
            >
              <div
                id="permissions_wrapper"
                className="dataTables_wrapper dt-bootstrap4"
              >
                <div className="row">
                  <div className="col-sm-12">
                    <table
                      id="permissions"
                      className="table table-bordered table-striped dataTable dtr-inline"
                      role="grid"
                      aria-describedby="permissions_info"
                    >
                      <thead align="center">
                        <tr role="row">
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody align="center">
                        {user?.roles?.map((role, key) => (
                          <tr key={key}>
                            <th scope="col">{role?.roleName}</th>
                            <td>
                              <button data-toggle="popover" title="Role" data-placement="left" data-trigger="focus" data-content={role?.description || role?.roleName} className="btn btn-outline-success btn-sm">
                                <FontAwesomeIcon icon="eye" /> Voir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ul>
          </span>
        </li>
      </ul>
    </div>
  );
};
