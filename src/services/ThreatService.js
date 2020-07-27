import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/threats`;

class ThreatService {

    getThreatsPage(name, pageable) {
        const params = {
          name: name !== "" ? name : "",
          page: pageable.pageNumber,
          size: pageable.pageSize,
        };
        return axios
          .get(`${API_URL}/page`, { params, headers: authHeader() })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
    }

}

export default new ThreatService();