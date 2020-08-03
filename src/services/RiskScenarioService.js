import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/riskscenarios`;

class RiskScenarioService {

    getRiskScenariosPage(name, pageable) {
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

    getRiskScenariosCounter() {
        return axios
          .get(`${API_URL}/counter`, { headers: authHeader() })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
    }

    saveRiskScenario(riskScenariRequest) {
        return axios
          .post(`${API_URL}/`, riskScenariRequest, { headers: authHeader() })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
    }

}

export default new RiskScenarioService();