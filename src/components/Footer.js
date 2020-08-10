import React from "react";

export default () => {
  return (
    <footer className="main-footer">
      <div className="float-right d-none d-sm-block">
        <b>Version</b> 0.0.1-Alpha
      </div>
      <strong>
        Copyright © Copyright © {new Date().getFullYear()}.
      </strong>{" "}
      Tous les droits sont reservés.
    </footer>
  );
};
