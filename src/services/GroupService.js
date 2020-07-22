import axios from "axios";
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/groups`;

class GroupService {

  getGroups() {
    return axios
      .get(`${API_URL}/`, {headers: authHeader()})
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  getGroupsPage(name, pageable) {
    const params = {
      name: name !== "" ? name : "",
      page: pageable.pageNumber,
      size: pageable.pageSize,
    };
    return axios
      .get(`${API_URL}/pages`, { params, headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }

  deleteGroupe(id) {
    return axios
      .delete(`${API_URL}/${id}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  }



}

export default new GroupService();