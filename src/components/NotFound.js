import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default () => {
  return (
    <div className="row">
      <div className="col-12 h-100">
        <div className="shadow p-5 mt-5 mb-5 bg-warning rounded font-weight-bold text-center display-4 h-100">
          <FontAwesomeIcon icon="exclamation-circle" /> La Page recherchée est
          non trouvée {" "}
          <Link to="/">
            <FontAwesomeIcon icon="home" /> Acceuil
          </Link>
        </div>
      </div>
    </div>
  );
};
