import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/entities`;

class EntityService {
  getEntities() {
    return axios
      .get(`${API_URL}/`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getOrganizationEntities(organizationId) {
    return axios
      .get(`${API_URL}/organizations/${organizationId}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getEntity(id) {
    return axios
      .get(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getEntitiesCounter() {
    return axios
      .get(`${API_URL}/counter`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteEntity(id) {
    return axios
      .delete(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  saveEntity(entityRequest) {
    return axios
      .post(`${API_URL}/`, entityRequest, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getEntitiesPage(name, pageable, sort) {
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
}

export default new EntityService();