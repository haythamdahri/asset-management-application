import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = "http://localhost:8080/api/v1/departments";

class DepartmentService {
  getDepartments() {
    return axios
      .get(`${API_URL}/`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }
}

export default new DepartmentService();