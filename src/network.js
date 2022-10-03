const SPOTIFY_URL = 'https://api.spotify.com';

export async function get(endpoint, accessToken) {
  let path = SPOTIFY_URL + '/v1' + endpoint;

  const options = {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  };

  return fetch(path, options)
  .then((response) => response.json());
}
