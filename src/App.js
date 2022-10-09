import './App.css';
import { get } from './network';
import Authenticator from './Authenticator';
import { useEffect, useState } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import TrackView from './TrackView';

function App() {
  const [authenticator] = useState(new Authenticator());
  const [player] = useState(new SpotifyPlayer());

  const [currentTrack, setCurrentTrack] = useState();

  // setTimeout(() => setCurrentTrack(prev => ({...prev})), 5000);

  // On load
  useEffect(() => {
    console.log("Page loaded");
    authenticator.getAccessToken()
      .then(token => {
      getPlaybackState(token);

      // player.bind(token);
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

  return (
    <div className="App">
      <TrackView currentTrack={currentTrack} />
      {/* <button id="togglePlay">Toggle Play</button><br /> */}
    </div>
  );
}

export default App;
