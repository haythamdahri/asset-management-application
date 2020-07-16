import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import {
  faCheckSquare,
  faCoffee,
  faHome,
  faSignInAlt,
  faSignOutAlt,
  faTasks,
  faUsers,
  faMoneyBill,
  faAlignLeft,
  faIndent,
  faQuestionCircle,
  faUser,
  faUserCircle,
  faUserClock,
  faExclamation,
  faShoppingBasket,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faSearchDollar,
  faAngleDoubleRight,
  faAngleDoubleLeft,
  faEye,
  faSync,
  faFileMedicalAlt,
  faEdit,
  faPlusCircle,
  faUndo,
  faSave,
  faEnvelope,
  faMapMarker,
  faImage,
  faUpload,
  faReply,
  faSignature,
  faPhone,
  faCommentDots,
  faDotCircle,
  faPaperPlane,
  faCircle,
  faUserEdit,
  faStreetView,
  faLayerGroup,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  fab,
  faCheckSquare,
  faCoffee,
  faHome,
  faSignInAlt,
  faSignOutAlt,
  faTasks,
  faUsers,
  faMoneyBill,
  faAlignLeft,
  faIndent,
  faQuestionCircle,
  faUser,
  faUserCircle,
  faUserClock,
  faExclamation,
  faShoppingBasket,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faSearchDollar,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faEye,
  faSync,
  faFileMedicalAlt,
  faEdit,
  faPlusCircle,
  faUndo,
  faSave,
  faMapMarker,
  faEnvelope,
  faImage,
  faUpload,
  faReply,
  faSignature,
  faPhone,
  faCommentDots,
  faDotCircle,
  faPaperPlane,
  faCircle,
  faUserEdit,
  faStreetView,
  faLayerGroup,
  faUserMinus,
  faUserEdit
);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Fontawesome Icons


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
