const { default: Axios } = require("axios");
const { default: authHeader } = require("./AuthHeader");

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/languages`;

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
    
    getLanguagesCounter() {
      return Axios.get(`${API_URL}/counter`, { headers: authHeader() })
        .then((response) => {
          return response.data;
        })
        .catch((err) => {
          throw new Error(err);
        });
    }
}

export default new LanguageService();