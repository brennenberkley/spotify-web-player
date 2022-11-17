import { useEffect, useState } from 'react';
import './TrackView.css';

const defaultColor = {r: 50, g: 50, b: 50};

function TrackView(props) {
  const [albumOnRight, setAlbumOnRight] = useState(false);
  const [listenerPresent, setListenerPresent] = useState(false);
  const [useColor, setUseColor] = useState(true);

  useEffect(() => {
    setAlbumOnRight(Math.random() < 0.5);
  }, [props.currentTrack?.id])

  function toggleFullscreen() {
    if (document.fullscreen) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }

  if (!listenerPresent) {
    setListenerPresent(true);
    document.addEventListener('keyup', (e) => {
      if (e.key === 'c') {
        console.log("toggle color");
        setUseColor(oldVal => !oldVal);
        console.log(useColor);
      }
    });
  }

  function albumArt() {
    const largestImage = props.currentTrack.album.images.sort((a, b) => b.height - a.height)[0];

    console.log(`Using ${largestImage.width} x ${largestImage.height} image`);

    return (
      <img className="albumArt" src={largestImage.url} alt="Album cover" onClick={toggleFullscreen}/>
    );
  }

  function trackInfo() {
    return (
      <>
        <div className={albumOnRight ? "flexGrow2" : "flexGrow1"} />
        <div className="trackInfo" style={{textAlign: albumOnRight ? 'right' : 'left'}}>
          <h1 className="primaryText">{props.currentTrack.name}</h1>
          <div className="secondaryText">{props.currentTrack.artists.map(artist => artist.name).join(', ')}</div>
        </div>
        <div className={albumOnRight ? "flexGrow1" : "flexGrow2"} />
      </>
    );
  }

  function content() {
    if (albumOnRight) {
      return (
        <div className="contentWrapper">
          {trackInfo()}
          <div className="titleSpacer" />
          {albumArt()}
        </div>
      );
    } else {
      return (
        <div className="contentWrapper">
          {albumArt()}
          <div className="titleSpacer" />
          {trackInfo()}
        </div>
      );
    }
  }

  function formatColor(color) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
  }

  const light = (useColor ? props.dominantColor : defaultColor) || defaultColor;
  // const light = defaultColor;
  let darkenAmount = 65;
  const dark = {
    r: Math.max(0, light.r - darkenAmount),
    g: Math.max(0, light.g - darkenAmount),
    b: Math.max(0, light.b - darkenAmount)
  }

  return (
    <div className="TrackView" style={{ backgroundImage: `linear-gradient(${formatColor(light)}, ${formatColor(dark)})` }}>
      {props.currentTrack && content()}
    </div>
  );
}

export default TrackView;
