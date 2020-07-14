import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/groups/";

class GroupService {

  getGroup(id) {
    return axios
      .get(API_URL)
      .then((group) => {
        return group;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }



}

export default new GroupService();