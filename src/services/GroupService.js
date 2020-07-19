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



}

export default new GroupService();