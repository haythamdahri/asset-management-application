import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/locations`;

class LocationService {

  getLocation(id) {
    return axios
      .get(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteLocation(id) {
    return axios
      .delete(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getLocations() {
    return axios
      .get(`${API_URL}/`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getLocationsCounter() {
    return axios
      .get(`${API_URL}/counter`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getLocationsPage(search, pageable, sort) {
    const params = {
      search: search !== "" ? search : "",
      page: pageable?.pageNumber,
      size: pageable?.pageSize,
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

  saveLocation(formData) {
    return axios
      .post(`${API_URL}/`, formData, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }
}

export default new LocationService();