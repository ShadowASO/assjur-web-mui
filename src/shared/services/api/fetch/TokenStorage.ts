export class TokenStorage {
  static get accessToken() {
    return localStorage.getItem("APP_ACCESS_TOKEN");
  }

  static set accessToken(token: string | null) {
    if (token) {
      localStorage.setItem("APP_ACCESS_TOKEN", token);
    } else {
      localStorage.removeItem("APP_ACCESS_TOKEN");
    }
  }

  static get refreshToken() {
    return localStorage.getItem("APP_REFRESH_TOKEN");
  }

  static set refreshToken(token: string | null) {
    if (token) {
      localStorage.setItem("APP_REFRESH_TOKEN", token);
    } else {
      localStorage.removeItem("APP_REFRESH_TOKEN");
    }
  }

  static clear() {
    TokenStorage.accessToken = null;
    TokenStorage.refreshToken = null;
    // TokenStorage.accessToken = "";
    // TokenStorage.refreshToken = "";
  }
}
