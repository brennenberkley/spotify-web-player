import './App.css';
import { get } from './network';
import Authenticator from './Authenticator';
import { useEffect, useState } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import ColorAnalyzer from './ColorAnalyzer';
import TrackView from './TrackView';

function App() {
  const [authenticator] = useState(new Authenticator());
  const [colorAnalyzer] = useState(new ColorAnalyzer());
  const [dominantColor, setDominantColor] = useState(null);
  // const [player] = useState(new SpotifyPlayer());

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

      const images = currentPlayer.item.album.images;
      const smallestImage = images[images.length - 1];

      colorAnalyzer.getDominantColor(smallestImage.url, smallestImage.width, smallestImage.height)
      .then(color => {
        console.log("Got color", color);

        let maxBrightness = 100;

        if (color.brightness > maxBrightness) {
          color.r = color.r * maxBrightness / color.brightness;
          color.g = color.g * maxBrightness / color.brightness;
          color.b = color.b * maxBrightness / color.brightness;
        }

        console.log("Adjusted color", color);
        setDominantColor(color);
      });
    }
  }

  return (
    <div className="App">
      <TrackView currentTrack={currentTrack} dominantColor={dominantColor} />
      {/* <button id="togglePlay">Toggle Play</button><br /> */}
    </div>
  );
}

export default App;
