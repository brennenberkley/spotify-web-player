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
  const [player] = useState(new SpotifyPlayer());

  const [currentTrack, setCurrentTrack] = useState();

  // On load
  useEffect(() => {
    console.log("Page loaded");
    // setupPlayer();
    setupViewer();
  }, []);

  function setupPlayer() {
    authenticator.getAccessToken()
      .then(token => {
        player.bind(token, updateTrack);
    });
  }
  function setupViewer() {
    authenticator.getAccessToken()
      .then(async token => {
        // returns a 204 No Content code if not playing
        const currentPlayer = await get('/me/player', token);

        if (currentPlayer.is_playing) {
          setCurrentTrack(currentPlayer.item);
        }
    });
  }

  function updateTrack(trackData) {
    setCurrentTrack(trackData);

    if (trackData?.id !== currentTrack?.id) {
      const smallestImage = trackData.album.images.sort((a, b) => a.height - b.height)[0];

      colorAnalyzer.getDominantColor(smallestImage.url, smallestImage.width, smallestImage.height)
      .then(color => {
        console.log("Got color", color);

        let maxBrightness = 120;
        let minBrightness = 40;

        if (color.brightness > maxBrightness) {
          color.r = color.r * maxBrightness / color.brightness;
          color.g = color.g * maxBrightness / color.brightness;
          color.b = color.b * maxBrightness / color.brightness;
        } else if (color.brightness < minBrightness) {
          color.r = color.r + (minBrightness - color.brightness);
          color.g = color.g + (minBrightness - color.brightness);
          color.b = color.b + (minBrightness - color.brightness);
        }

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
