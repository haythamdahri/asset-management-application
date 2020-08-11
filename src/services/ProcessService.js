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

  deleteProcess(id) {
    return axios
      .delete(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  updateProcessStatus(id, status) {
    return axios
      .put(`${API_URL}/${id}/status`,{}, { headers: authHeader(), params: {status} })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  updateProcessClassificationStatus(id, status) {
    return axios
      .put(`${API_URL}/${id}/classification/status`,{}, { headers: authHeader(), params: {status} })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  saveProcess(processRequest) {
    return axios
      .post(`${API_URL}/`,processRequest, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getProcess(id) {
    return axios
      .get(`${API_URL}/${id}`,{ headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getCustomProcesses(excludedProcessId) {
    return axios
      .get(`${API_URL}/custom`,{ params: {id: excludedProcessId}, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getProcessesPage(search, pageable, sort) {
    const params = {
      name: search !== "" ? search : "",
      page: pageable?.pageNumber,
      size: pageable?.pageSize,
      sort: sort?.field,
      direction: sort?.direction
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
