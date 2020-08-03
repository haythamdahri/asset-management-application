import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/roles`;

class RoleService {

  getRoles() {
    return axios
      .get(`${API_URL}/`, {headers: authHeader()})
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  getRolesCounter() {
    return axios
      .get(`${API_URL}/counter`, {headers: authHeader()})
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }



}

export default new RoleService();