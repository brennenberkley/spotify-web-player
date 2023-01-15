import https from 'https'
import Model from './Model.mjs';

const CLIENT_ID = "04c1cbfe68de4f2bb0c7e016ee6c1733";
const CLIENT_SECRET = "d43ad4e7614140f4a41c2df1afa31f15"; // TODO: remove this if publishing app;
const REDIRECT_URI = "https://6nb5wkc5yl.execute-api.us-west-2.amazonaws.com/authorized";

export async function fetchToken(loginId, accessCode) {
  return new Promise((resolve, reject) => {
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: accessCode,
      redirect_uri: REDIRECT_URI,
    }).toString();

    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
      }
    };

    const req = https.request(options, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', async () => {
        if (resp.statusCode < 400) {
          const model = new Model();

          console.log("Received response", resp.statusCode, data)

          const json = JSON.parse(data);
          await model.saveTokenToDatabase(loginId, json.access_token, json.refresh_token)

          resolve();
        } else {
          reject(`Error retrieving data. Status code: ${resp.statusCode}. Response body: ${data}`);
        }
      });

    }).on("error", (err) => {
      console.error("Error: " + err.message);
    });

    req.write(requestBody);
    req.end();
  });
}
