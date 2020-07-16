import axios from "axios";
import authHeader from "./AuthHeader";
import { ENABLE, DISABLE } from "./ConstantsService";

const API_URL = "http://localhost:8080/api/v1/users";

class UserService {


  updateAcountStatus(status, id) {
    switch (status) {
      case ENABLE:
        return axios
          .get(`${API_URL}/${ENABLE}`, {
            params: { id: id },
            headers: authHeader(),
          })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw new Error(err);
          });
      case DISABLE:
        return axios
          .get(`${API_URL}/${DISABLE}`, {
            params: { id },
            headers: authHeader(),
          })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw new Error(err);
          });
      default:
        return null;
    }
  }

  updateUserImage(formData) {
    
    return axios
      .post(`${API_URL}/image`, formData, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  saveUser(id, email, username, location) {
    return axios
      .patch(`${API_URL}/${id}`, {email, username, location}, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err?.response?.data?.message || 'An error occurred, please try again!');
      });
  }

  getAuthenticatedUserDetails() {
    return axios
      .get(`${API_URL}/current`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  getUser(id) {
    return axios
      .get(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  getUsersPage(search, pageable) {
    const params = {
      search: search !== "" ? search : "",
      page: pageable.pageNumber,
      size: pageable.pageSize,
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

export default new UserService();