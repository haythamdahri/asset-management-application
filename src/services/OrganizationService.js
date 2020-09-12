import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/organizations`;

class OrganizationService {
  getOrganizations() {
    return axios.get(`${API_URL}/`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  getOrganization(id) {
    return axios.get(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getOrganizationsCounter() {
    return axios.get(`${API_URL}/counter`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  getOrganizationsPage(search, pageable) {
    const params = {
      search: search !== "" ? search : "",
      page: pageable?.pageNumber,
      size: pageable?.pageSize,
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

  getOrganizationProcessesPage(id, search, pageable) {
    const params = {
      id,
      search: search !== "" ? search : "",
      page: pageable?.pageNumber,
      size: pageable?.pageSize,
    };
    return axios
      .get(`${API_URL}/organizations/${id}/page`, { params, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteOrganization(id) {
    return axios
      .delete(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  saveOrganization(formData) {
    return axios
      .post(`${API_URL}/`, formData, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getOrganizationProcesses(organizationId) {
    return axios
      .get(`${API_URL}/${organizationId}/processes`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getOrganizationUsers(organizationId) {
    return axios
      .get(`${API_URL}/${organizationId}/users`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getCustomOrganizations() {
    return axios
      .get(`${API_URL}/custom`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }


}

export default new OrganizationService();
