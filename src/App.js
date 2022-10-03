import './App.css';
import { get, trackFeatures } from './network';
import Authenticator from './Authenticator';
import { useEffect, useState } from 'react';
import SpotifyPlayer from './SpotifyPlayer';

function App() {
  const [authenticator] = useState(new Authenticator());
  const [player] = useState(new SpotifyPlayer());

  const [currentTrack, setCurrentTrack] = useState();

  // On load
  useEffect(() => {
    console.log("Page loaded");
    authenticator.getAccessToken()
      .then(token => {
      getPlaybackState(token);
      player.bind(token);

      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    });
  }, []);

  async function getPlaybackState(token) {
    // returns a 204 No Content code if not playing
    const currentPlayer = await get('/me/player', token);
    console.log(currentPlayer);

    if (currentPlayer.is_playing) {
      setCurrentTrack(currentPlayer.item);
    }
  }

  async function getTrackFeatures() {
    const trackId = '6ovkLF42qFLN7VqKX0r0jT';
    authenticator.getAccessToken().then(async (token) => {
      const features = await trackFeatures(trackId, token);
      console.log(features);
    });
  }

  return (
    <div className="App">
      {currentTrack &&
        <div>
          <img src={currentTrack.album.images[0].url} alt="Album cover" height="300"/>
          <h1>{currentTrack.name}</h1>
          <div>{currentTrack.artists.map(artist => artist.name).join(', ')}</div>
          <div>{currentTrack.album.name}</div>
        </div>
      }

      <button id="togglePlay">Toggle Play</button>
      <button id="getTrackFeatures" onClick={getTrackFeatures}>Get Track Features</button>
    </div>
  );
}

export default App;
