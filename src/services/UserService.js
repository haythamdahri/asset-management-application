import axios from "axios";
import authHeader from "./AuthHeader";
import { ENABLE, DISABLE } from "./ConstantsService";
import EventEmitter from 'eventemitter3';


const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/users`;

class UserService {

  constructor() {
    const eventEmitter = new EventEmitter();
    this.Emitter = {
      on: (event, fn) => eventEmitter.on(event, fn),
      once: (event, fn) => eventEmitter.once(event, fn),
      off: (event, fn) => eventEmitter.off(event, fn),
      emit: (event, payload) => eventEmitter.emit(event, payload)
    }
  }

  requestPasswordReset(email) {
    return axios
      .get(`${API_URL}/passwordsreset`, {params: {email}})
      .then((response) => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

  checkTokenValidity(token) {
    return axios
      .get(`${API_URL}/passwordsreset/tokensvalidity/${token}`)
      .then((response) => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

  resetPassword(token, password) {
    return axios
      .put(`${API_URL}/passwordsreset`, {token, password}, {})
      .then((response) => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteUser(id) {
    return axios
      .delete(`${API_URL}/${id}`, {headers: authHeader()})
      .then((response) => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

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
      .put(`${API_URL}/profile/image`, formData, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  saveUser(formData) {
    return axios
      .put(`${API_URL}/`, formData, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;  
      });
  }

  getUsersCounter() {
    return axios
      .get(`${API_URL}/counter`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;  
      });
  }

  saveUserProfile(data) {
    return axios
      .put(`${API_URL}/profile`, data, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;  
      });
  }

  getAuthenticatedUserDetails() {
    return axios
      .get(`${API_URL}/profile`, { headers: authHeader() })
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

  getCustomUsers() {
    return axios
      .get(`${API_URL}/custom`, { headers: authHeader() })
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

  async canEditUser() {
    return axios
      .get(`${API_URL}/roles/checking/users`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  async checkUserAdmin() {
    return axios
      .get(`${API_URL}/roles/checking/admin`, { headers: authHeader() })
      .then((response) => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  }

}

export default new UserService();