import logo from './logo.svg';
import './App.css';
import { get } from './network';

const clientId = "04c1cbfe68de4f2bb0c7e016ee6c1733";
const clientSecret = "d43ad4e7614140f4a41c2df1afa31f15"; // TODO: remove this if publishing app;;
const redirectUri = "http://localhost:3000";
const scope = "user-modify-playback-state+user-read-recently-played+user-read-playback-position+playlist-read-collaborative+app-remote-control+user-read-playback-state+streaming+user-library-modify+user-read-currently-playing+user-library-read+playlist-read-private+playlist-modify-private"

const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;

// get('/me/player', code);

console.log(url);

function getAuthToken() {
  let params = new URLSearchParams(window.location.search);
  let code = params.get('code');
  if (!code) {
    window.location.replace(url);
    return;
  }

  console.log("Got code, ", code);

  const postData = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri
  }).toString();

  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: postData
  };


  window.fetch('https://accounts.spotify.com/api/token', options)
  .then((response) => response.json())
  .then((data) => {
    localStorage.setItem("spotify_access_token", data.access_token)
    localStorage.setItem("spotify_refresh_token", data.refresh_token)
    console.log(data)
  });
}

getAuthToken();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
