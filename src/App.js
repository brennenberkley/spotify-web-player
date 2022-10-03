import './App.css';
import { get } from './network';
import Authenticator from './Authenticator';
import { useEffect, useState } from 'react';

function App() {
  const [authenticator, _] = useState(new Authenticator());
  const [currentTrack, setCurrentTrack] = useState();

  useEffect(() => {
    console.log("Page loaded");
    authenticator.getAccessToken()
      .then(token => getPlaybackState(token));
    }, []);

  async function getPlaybackState(token) {
    // returns a 204 No Content code if not playing
    const currentPlayer = await get('/me/player', localStorage.getItem("spotify_access_token"));
    console.log(currentPlayer);

    if (currentPlayer.is_playing) {
      setCurrentTrack(currentPlayer.item);
    }
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
    </div>
  );
}

export default App;
