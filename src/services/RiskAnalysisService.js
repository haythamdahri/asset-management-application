import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/riskanalyzes`;

class RiskAnalysisService {
  getRiskAnalysisPage(assetId, pageable) {
    const params = {
      assetId: assetId !== "" ? assetId : "",
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

  getRiskAnalyzesCounter() {
    return axios
      .get(`${API_URL}/counter`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  saveRiskAnalysis(riskAnalysisRequest) {
    return axios
      .post(`${API_URL}/`, riskAnalysisRequest, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }
}

export default new RiskAnalysisService();
