import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = "http://localhost:8080/api/v1/roles";

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



}

export default new RoleService();