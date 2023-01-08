const CLIENT_ID = "04c1cbfe68de4f2bb0c7e016ee6c1733";
const CLIENT_SECRET = "d43ad4e7614140f4a41c2df1afa31f15"; // TODO: remove this if publishing app;
const REDIRECT_URI = "https://6nb5wkc5yl.execute-api.us-west-2.amazonaws.com/authorized";
const SCOPE = "user-modify-playback-state+user-read-recently-played+user-read-playback-position+playlist-read-collaborative+app-remote-control+user-read-playback-state+streaming+user-library-modify+user-read-currently-playing+user-library-read+playlist-read-private+playlist-modify-private+user-read-email+user-read-private"

const LOGIN_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&scope=${SCOPE}`;

export const handler = async(event) => {
  if (event.routeKey == 'GET /login') {
    return login(event);
  } else if (event.routeKey = 'GET /authorized') {
    return authorized(event);
  }
};

async function login(event) {
  const loginId = event.queryStringParameters.id;

  console.log("Logging in with id:", loginId);




  const response = {
      statusCode: 301,
      headers: {
        Location: buildLoginUrl(loginId),
      }
  };

  return response;
}

async function authorized(event) {
  const authCode = event.queryStringParameters.code;
  const loginId = event.queryStringParameters.state;

  console.log("Received authorization code for login id:", loginId);

  await _fetchInitialAccessToken(authCode);

  return {
    statusCode: 200,
    body: "success"
  }
}

async function _fetchInitialAccessToken(code) {
  const requestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI
  }).toString();

  return await _fetchAccessToken(requestBody);
}


async function _fetchAccessToken(requestBody) {
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
  .then(async (data) => {
    accessToken = data.access_token;

    await saveTokenToDatabase(data.access_token, data.refresh_token)
  });
}

async function saveTokenToDatabase() {

}

function buildLoginUrl(loginId) {
  const loginUrl = `${LOGIN_URL}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${loginId}`;

  return loginUrl;
}
