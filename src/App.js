import './App.css';
import { get, trackFeatures } from './network';
import Authenticator from './Authenticator';
import { useEffect, useState } from 'react';
import SpotifyPlayer from './SpotifyPlayer';

function App() {
  const [authenticator] = useState(new Authenticator());
  const [player] = useState(new SpotifyPlayer());

  const [currentTrack, setCurrentTrack] = useState();
  const [features, setFeatures] = useState();

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

  async function getTrackFeatures() {
    authenticator.getAccessToken().then(async (token) => {
      const features = await trackFeatures(currentTrack.id, token);
      setFeatures(features);
      console.log(features);

      // const timeSignature = 4;
      // features.bars.forEach(bar => {
      //   console.log("Setting bar");
      //   setTimeout(() => flash("tempo-1"), bar.start * 1000);

      //   setTimeout(() => flash("tempo-2"), bar.start * 1000 + (bar.duration / 4 * 1000));
      //   setTimeout(() => flash("tempo-2"), bar.start * 1000 + (bar.duration / 4 * 1000 * 2));
      //   setTimeout(() => flash("tempo-2"), bar.start * 1000 + (bar.duration / 4 * 1000 * 3));
      // });
    });
  }

  function flash(id) {
    const element = document.getElementById(id);
    element.style.transitionDuration = '0s'
    element.style.backgroundColor = '#ff0000';
    setTimeout(() => {
      element.style.transitionDuration = '0.5s';
      element.style.backgroundColor = '#eeeeee';
    }, 10)
  }


  let tempos = null;
  if (features) {
    tempos = features.beats.filter(b => b.confidence > 0.1).map(beat => Math.round(1 / beat.duration * 60)).sort((a, b) => a - b);
    console.log(tempos);
    console.log(`Filtered out ${features.beats.length - tempos.length} / ${features.beats.length} beats`);
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

      <button id="togglePlay">Toggle Play</button><br />
      <button id="getTrackFeatures" onClick={getTrackFeatures}>Get Track Features</button><br />
      <button onClick={() => flash('tempo-1')}>Flash</button>

      <div>
        <div id="tempo-1" style={{borderRadius: "25px", width: "50px", height: "50px", margin: "20px", display: 'inline-block', background: '#eee', transitionProperty: 'background'}}></div>
        <div id="tempo-2" style={{borderRadius: "25px", width: "50px", height: "50px", margin: "20px", display: 'inline-block', background: '#eee', transitionProperty: 'background'}}></div>
      </div>

      {features &&
        <div>
          <div>
            Overall tempo: {features.track.tempo}
          </div>
          <div>
            Tempo range: {tempos[0]} - {tempos[tempos.length - 1]}
          </div>
        </div>
      }
    </div>
  );
}

export default App;
