const axios = require("axios");

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/captcha`;

class CaptchaService {
    verifyCaptcha(humanKey) {
        return axios
          .get(`${API_URL}/verify`,{params: {humanKey}})
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            throw err;
          });
      }
}

export default new CaptchaService();