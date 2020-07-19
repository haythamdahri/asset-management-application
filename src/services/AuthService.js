import axios from "axios";
import UserTokenModel from "../models/UserTokenModel";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/auth`;
const USER_API_URL = `${process.env.REACT_APP_API_URL}/api/v1/users`;
const STORAGE_USER = "user";

class AuthService {
  signin(user) {
    return axios
      .post(`${API_URL}/`, user)
      .then((userData) => {
        let userToken = this.decodeToken(userData.data.token);
        localStorage.setItem(STORAGE_USER, JSON.stringify(userToken));
        return userToken;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  signout(history = null) {
    localStorage.removeItem(STORAGE_USER);
    if (history != null) {
      history.push("/signin");
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_USER) || "{}");
  }

  isAuthenticated() {
    return localStorage.getItem(STORAGE_USER) != null;
  }

  isAuthorized() {
    return this.isAuthenticated() && (this.isAdmin() || this.isEmployee());
  }

  // Check if user has role
  async hasRole(roleName) {
    let userToken = JSON.parse(
      localStorage.getItem(STORAGE_USER) || "{}"
    );
    return (
      userToken?.roles?.find((role) => role.authority === roleName) != null
    );
  }

  // Check if user has a specific role or his group has
  async hasAsyncRole(roleName) {
    const response = await axios
    .get(`${USER_API_URL}/roles/checking`, {
      params: { roleName: roleName },
      headers: authHeader(),
    })
    .then((response) => {
      // If user not found then sign out and redirect to sign in page
      if( response.data.signOutRequired ) {
        this.signout();
        window.location.href = "/signin";
      }
      // Return response
      return response.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
    return response.hasRole;
  }

  // Check if connected user is an admin
  isAdmin() {
    let userToken = JSON.parse(
      localStorage.getItem(STORAGE_USER) || "{}"
    );
    return (
      userToken?.roles?.find((role) => role.authority === "ROLE_ADMIN") != null
    );
  }

  // Check if connected user is an admin
  isEmployee() {
    let userToken = JSON.parse(
      localStorage.getItem(STORAGE_USER) || "{}"
    );
    return (
      userToken?.roles?.find((role) => role.authority === "ROLE_EMPLOYEE") !=
      null
    );
  }

  // Decode token
  decodeToken(token) {
    var jwtDecode = require("jwt-decode");
    const decoded = jwtDecode(token);
    let userToken = new UserTokenModel();
    userToken.bearerToken = "Bearer " + token;
    userToken.token = token;
    userToken.email = decoded.sub;
    userToken.roles = decoded.roles;
    userToken.exp = Number(decoded.exp * 1000);
    return userToken;
  }
}

export default new AuthService();