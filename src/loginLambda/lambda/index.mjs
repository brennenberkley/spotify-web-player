import Model from "./Model.mjs";
import { fetchToken } from "./networkHelper.mjs";

const CLIENT_ID = "04c1cbfe68de4f2bb0c7e016ee6c1733";
const REDIRECT_URI = "https://6nb5wkc5yl.execute-api.us-west-2.amazonaws.com/authorized";
const SCOPE = "user-modify-playback-state+user-read-recently-played+user-read-playback-position+playlist-read-collaborative+app-remote-control+user-read-playback-state+streaming+user-library-modify+user-read-currently-playing+user-library-read+playlist-read-private+playlist-modify-private+user-read-email+user-read-private"

const LOGIN_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&scope=${SCOPE}`;

export const handler = async(event) => {
  console.log("Route key:", event.routeKey);

  if (event.routeKey == 'GET /login') {
    return login(event);
  } else if (event.routeKey == 'GET /authorized') {
    return authorized(event);
  } else if (event.routeKey == 'GET /getToken') {
    return getToken(event);
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

  await fetchToken(loginId, authCode);

  return {
    statusCode: 200,
    body: "success"
  }
}

async function getToken(event) {
  const loginId = event.queryStringParameters.id;

  let model = new Model();
  let token = await model.getToken(loginId);
  if (token) {
    return {
      statusCode: 200,
      body: JSON.stringify(token)
    }
  } else {
    return {
      statusCode: 404
    }
  }
}

function buildLoginUrl(loginId) {
  const loginUrl = `${LOGIN_URL}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${loginId}`;

  return loginUrl;
}
