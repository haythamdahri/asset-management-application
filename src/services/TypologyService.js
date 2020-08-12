import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/typologies`;

class TypologyService {
  getTypologiesPage(name, pageable, sort) {
    const params = {
      name: name !== "" ? name : "",
      page: pageable.pageNumber,
      size: pageable.pageSize,
      sort: sort?.field,
      direction: sort?.direction
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

  getTypologiesCounter() {
    return axios
      .get(`${API_URL}/counter`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getTypology(id) {
    return axios
      .get(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteTypology(id) {
    return axios
      .delete(`${API_URL}/${id}`, { headers: authHeader() })
      .then(() => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

  updateThreatStatus(typologyId, threatId, status) {
    return axios
      .put(`${API_URL}/${typologyId}/threats/${threatId}/status`, {}, { params: {status}, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteThreat(typologyId, threatId) {
    return axios
      .delete(`${API_URL}/${typologyId}/threats/${threatId}`, { headers: authHeader() })
      .then(() => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteRiskScenario(typologyId, riskScenarioId) {
    return axios
      .delete(`${API_URL}/${typologyId}/riskscenarios/${riskScenarioId}`, { headers: authHeader() })
      .then(() => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteVulnerability(typologyId, vulnerabilityId) {
    return axios
      .delete(`${API_URL}/${typologyId}/vulnerabilities/${vulnerabilityId}`, { headers: authHeader() })
      .then(() => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

  getCustomTypologies() {
    return axios
      .get(`${API_URL}/custom`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  updateRiskScenarioStatus(typologyId, riskScenarioId, status) {
    return axios
      .put(`${API_URL}/${typologyId}/riskscenarios/${riskScenarioId}/status`, {}, { params: {status}, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  updateVulnerabilityStatus(typologyId, vulnerabilityId, status) {
    return axios
      .put(`${API_URL}/${typologyId}/vulnerabilities/${vulnerabilityId}/status`, {}, { params: {status}, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  saveTyplogy(typology) {
    return axios
      .post(`${API_URL}/`, typology, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getThreat(typologyId, threatId) {
    return axios
      .get(`${API_URL}/${typologyId}/threats/${threatId}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getVulnerability(typologyId, vulnerabilityId) {
    return axios
      .get(`${API_URL}/${typologyId}/vulnerabilities/${vulnerabilityId}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getRiskScenario(typologyId, riskScenarioId) {
    return axios
      .get(`${API_URL}/${typologyId}/riskscenarios/${riskScenarioId}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

}

export default new TypologyService();
