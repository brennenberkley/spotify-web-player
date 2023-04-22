const CLIENT_ID = "04c1cbfe68de4f2bb0c7e016ee6c1733";
const CLIENT_SECRET = "d43ad4e7614140f4a41c2df1afa31f15"; // TODO: remove this if publishing app;
const REDIRECT_URI = window.location.origin + window.location.pathname;
const SCOPE = "user-modify-playback-state+user-read-recently-played+user-read-playback-position+playlist-read-collaborative+app-remote-control+user-read-playback-state+streaming+user-library-modify+user-read-currently-playing+user-library-read+playlist-read-private+playlist-modify-private+user-read-email+user-read-private"

const LOGIN_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&scope=${SCOPE}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

const ACCESS_TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const EXPIRATION_KEY = 'spotify_access_token_expiration';

const EXPIRATION_BUFFER = 2 * 60 * 1000;

class Authenticator {
  pendingTokenRefresh = false;

  async getAccessToken() {
    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    let expiration = parseInt(localStorage.getItem(EXPIRATION_KEY)) || 0;
    let currentTime = new Date().getTime();

    if (!accessToken) {
      let params = new URLSearchParams(window.location.search);
      let code = params.get('code');

      // return Promise.resolve("AAA");
      if (code) {
        console.info("Received authorization code from Spotify");
        this._clearQueryParams();
        return await this._fetchInitialAccessToken(code);
      } else {
        console.info("No access token found, redirecting to spotify login");
        this._redirectToLogin();
        return;
      }
    }

    this._clearQueryParams();

    if (expiration < currentTime) {
      console.info("Token expired, refreshing token");
      return await this._refreshAccessToken();
    } else if (expiration - currentTime < EXPIRATION_BUFFER && !this.pendingTokenRefresh) {
      console.info("Token expires soon, refreshing token in the background");
      this._refreshAccessToken();
    }

    console.info("Existing token is valid")
    return accessToken;
  }

  async _fetchInitialAccessToken(code) {
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }).toString();

    console.log('_fetchInitialAccessToken', requestBody);

    return await this._fetchAccessToken(requestBody);
  }

  async _refreshAccessToken() {
    console.log('_refreshAccessToken');
    const requestBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: localStorage.getItem(REFRESH_TOKEN_KEY),
      redirect_uri: REDIRECT_URI
    }).toString();

    return await this._fetchAccessToken(requestBody);
  }

  async _fetchAccessToken(requestBody) {
    console.log('_fetchAccessToken');
    if (this.pendingTokenRefresh) {
      return;
    }

    this.pendingTokenRefresh = true;

    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
      },
      body: requestBody
    };

    let accessToken = null;

    console.log("Starting call");
    await window.fetch('https://accounts.spotify.com/api/token', options)
    .then((response) => response.json())
    .then((data) => {
      console.log("received data", data);
      accessToken = data.access_token;

      if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      }

      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
      }

      let expiration = new Date().getTime() + (data.expires_in * 1000);

      if (expiration) {
        localStorage.setItem(EXPIRATION_KEY, expiration);
      }

      console.info("Token refreshed");

      this.pendingTokenRefresh = false;
    });

    console.log("Finished call. token: ", accessToken);

    return accessToken;
  }

  _redirectToLogin() {
    window.location.replace(LOGIN_URL);
  }

  _clearQueryParams() {
    window.history.replaceState({}, document.title, '/');
  }
}