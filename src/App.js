import React, { useEffect } from "react";
import "./App.css";
import Router from "./components/router/Router";

function App() {
  useEffect(() => {
    // Add event listener
    window.addEventListener("storage", (e) => {
      window.location.reload();
    });
    return () => {
      window.removeEventListener("storage", () => {});
    };
  });

  return (
    <Router />
  );
}

export default App;
