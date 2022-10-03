import logo from './logo.svg';
import './App.css';
import { get } from './network';
import Authenticator from './Authenticator';
import { useCallback, useEffect, useState } from 'react';

function App() {
  const [authenticator, _] = useState(new Authenticator());

  useEffect(() => {
    console.log("Page loaded");
    authenticator.getAccessToken()
      .then(token => getPlaybackState(token));
    }, []);

  function getPlaybackState(token) {
    console.log("Fetched token", token);
    // returns a 204 No Content code if not playing
    get('/me/player', localStorage.getItem("spotify_access_token"));
  }

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
