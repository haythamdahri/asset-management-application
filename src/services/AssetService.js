import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/assets`;

class AssetService {
  getAssets() {
    return axios
      .get(`${API_URL}/`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getAsset(id) {
    return axios
      .get(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getAssetsPage(name, pageable) {
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

  getAssetsCounter() {
    return axios
      .get(`${API_URL}/counter`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteAsset(id) {
    return axios
      .delete(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  updateAssetStatus(assetId, status) {
    return axios
      .put(`${API_URL}/${assetId}/status`,{}, { params: {status}, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  updateAssetClassificationStatus(assetId, status) {
    return axios
      .put(`${API_URL}/${assetId}/classification/status`,{}, { params: {status}, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  updateAssetRiskAnalysisStatus(assetId, RiskAnalysisId, status) {
    return axios
      .put(`${API_URL}/${assetId}/riskanalyzes/${RiskAnalysisId}/status`, {}, { params: {status}, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getRiskAnalysis(assetId, RiskAnalysisId) {
    return axios
      .get(`${API_URL}/${assetId}/riskanalyzes/${RiskAnalysisId}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  saveAsset(formData) {
    return axios
      .post(`${API_URL}/`, formData, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteRiskAnalysis(assetId, RiskAnalysisId) {
    return axios
      .delete(`${API_URL}/${assetId}/riskanalyzes/${RiskAnalysisId}`, { headers: authHeader() })
      .then(() => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }
}

export default new AssetService();
