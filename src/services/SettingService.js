import axios from 'axios';
import authHeader from "./AuthHeader";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/settings`;

class SettingService {
    getApplicationSetting() {
        return axios
          .get(`${API_URL}/active`, { headers: authHeader() })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
    }

}

export default new SettingService();