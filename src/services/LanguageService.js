const { default: Axios } = require("axios");
const { default: authHeader } = require("./AuthHeader");

const API_URL = "http://localhost:8080/api/v1/languages";

class LanguageService {
    getLanguages() {
      return Axios.get(`${API_URL}/`, { headers: authHeader() })
        .then((response) => {
          return response.data;
        })
        .catch((err) => {
          throw new Error(err);
        });
    }
}

export default new LanguageService();