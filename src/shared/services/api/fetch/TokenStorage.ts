//Rótulos na LocalStorage para a guarda do accessToke e refreshToken
const LS_ACESS_TOKEN = "APP_ACCESS_TOKEN";
const LS_REFRESH_TOKEN = "APP_REFRESH_TOKEN";
export class TokenStorage {
  static get accessToken() {
    return localStorage.getItem(LS_ACESS_TOKEN);
  }

  static set accessToken(token: string | null) {
    if (token) {
      localStorage.setItem(LS_ACESS_TOKEN, token);
    } else {
      localStorage.removeItem(LS_ACESS_TOKEN);
    }
  }

  static get refreshToken() {
    return localStorage.getItem(LS_REFRESH_TOKEN);
  }

  static set refreshToken(token: string | null) {
    if (token) {
      localStorage.setItem(LS_REFRESH_TOKEN, token);
    } else {
      localStorage.removeItem(LS_REFRESH_TOKEN);
    }
  }

  static clear() {
    TokenStorage.accessToken = null;
    TokenStorage.refreshToken = null;
  }
}
