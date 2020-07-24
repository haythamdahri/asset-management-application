import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default ({ user, setUser }) => {
  const [rolesMore, setRolesMore] = useState({
    expanded: false,
    itemsCount: 5,
  });

  return (
    <div className="col-12" key={user?.id}>
      <ul key="UL1" className="list-group list-group-unbordered mb-3">
        <li key="LI1"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Nom</b>
          <span className="float-right mr-5">{user?.lastName}</span>
        </li>
        <li key="LI2"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Prénom</b>
          <span className="float-right mr-5">{user?.firstName}</span>
        </li>
        <li key="LI3"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Email</b>
          <span className="float-right mr-5">{user?.email}</span>
        </li>
        <li key="LI4"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Téléphone</b>
          <span className="float-right mr-5">{user?.phone}</span>
        </li>
        <li key="LI5"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Localisation</b>
          <span className="float-right mr-5">{user?.location?.name}</span>
        </li>
        <li key="LI6"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Entité</b>
          <span className="float-right mr-5">{user?.entity?.name}</span>
        </li>
        <li key="LI7"
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
        <li key="LI8"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Groupes</b>
          <span className="float-right mr-5">
            {user?.groups?.map((group, key) => (
              <Link key={key} to={`/groups/view/${group.id}`} key={key}>
                {group.name}
                {key === user.groups.length - 1 ? "" : " , "}
              </Link>
            ))}
          </span>
        </li>
        <li key="LI9"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Poste</b>
          <span className="float-right mr-5">{user?.jobTitle}</span>
        </li>
        <li key="LI10"
          className="list-group-item"
          style={{ borderTop: "2px solid black" }}
        >
          <b className="ml-5">Numéro d'employé</b>
          <span className="float-right mr-5">{user?.employeeNumber}</span>
        </li>
        <li key="LI11"
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
              className="list-group list-group-flush w-50 float-right text-center font-weight-bold text-secondary"
              style={{
                borderTop: "solid 2px blue",
              }}
            >
              {user?.roles?.map((role, key) => (
                <div key={key}>
                  {key < rolesMore.itemsCount && (
                    <li className="list-group-item" key={key}>
                      {role.roleName}
                    </li>
                  )}
                </div>
              ))}

              {user?.roles?.length > 5 && !rolesMore.expanded && (
                <Link
                  to="#"
                  onClick={() =>
                    setRolesMore({ itemsCount: user?.roles?.length, expanded: true })
                  }
                >
                  Voir plus
                </Link>
              )}
              {user?.roles?.length > 5 && rolesMore.expanded && (
                <Link
                  to="#"
                  onClick={() =>
                    setRolesMore({ itemsCount: 5, expanded: false })
                  }
                >
                  Voir moins
                </Link>
              )}
              {(user?.roles === null || user?.roles?.length === 0) && (
                <li className="list-group-item">
                  <FontAwesomeIcon icon="exclamation-circle" /> Aucun assigné
                </li>
              )}
            </ul>
          </span>
        </li>
      </ul>
    </div>
  );
};
