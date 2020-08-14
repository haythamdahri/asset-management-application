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

    getClassificationSetting() {
        return axios
          .get(`${API_URL}/active/classification`, { headers: authHeader() })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
    }

    getActiveSettingRiskAnalysisOptions() {
        return axios
          .get(`${API_URL}/active/riskanalyzes`, { headers: authHeader() })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
    }

    getCaptchaAttemptsSetting() {
        return axios
          .get(`${API_URL}/active/captcha`, { headers: authHeader() })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
    }

    saveSetting(setting) {
        return axios
          .post(`${API_URL}/`, setting, { headers: authHeader() })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
    }

}

export default new SettingService();