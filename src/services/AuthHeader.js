
const STORAGE_USER = 'user';

export default function authHeader() {
  const user = JSON.parse(localStorage.getItem(STORAGE_USER) || '{}');
  if (user && user.token) {
    return { Authorization: "Bearer " + user.token };
  } else {
    return {};
  }
}
