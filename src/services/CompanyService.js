import Axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = "http://localhost:8080/api/v1/companies";

class CompanyService {
  getCompanies() {
    return Axios.get(`${API_URL}/`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
}

export default new CompanyService();