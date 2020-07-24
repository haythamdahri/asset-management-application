import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/processes`;

class ProcessService {

  getProcessesCounter() {
    return axios
      .get(`${API_URL}/counter`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getProcessesPage(search, pageable) {
    const params = {
      search: search !== "" ? search : "",
      page: pageable?.pageNumber,
      size: pageable?.pageSize,
    };
    return axios
      .get(`${API_URL}/`, { params, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }


}

export default new ProcessService();
