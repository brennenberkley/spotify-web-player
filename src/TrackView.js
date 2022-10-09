import { useEffect, useState } from 'react';
import './TrackView.css';

const defaultColor = {r: 50, g: 50, b: 50};

function TrackView(props) {
  const [albumOffset, setAlbumOffset] = useState(0);
  const [trackInfoOffset, setTrackInfoOffset] = useState(0);
  const [albumOnRight, setAlbumOnRight] = useState(false);

  useEffect(() => {
    // Update the spacing based on our existing offset
    let albumArt = document.querySelector('.albumArt');
    let trackInfo = document.querySelector('.trackInfo');

    if (albumArt && trackInfo) {
      if (albumOnRight) {
        albumArt.style.left = null;
        trackInfo.style.left = null;
        albumArt.style.right = albumOffset + 'px';
        trackInfo.style.right = trackInfoOffset + 'px';
      } else {
        albumArt.style.right = null;
        trackInfo.style.right = null;
        albumArt.style.left = albumOffset + 'px';
        trackInfo.style.left = trackInfoOffset + 'px';
      }
    }
  });

  useEffect(() => {
    // Calculate the offset for the current song
    let extraSpace = document.querySelector('.extraSpace');

    if (extraSpace) {
      let albumWidth = document.querySelector('.albumArt').clientWidth;
      let windowWidth = document.querySelector('.contentWrapper').clientWidth;
      let centered = (windowWidth - albumWidth) / 2;
      let available = Math.min(centered - 50, extraSpace.clientWidth);

      let offset = available * Math.random();

      setAlbumOffset(offset);
      setTrackInfoOffset(extraSpace.clientWidth / 2 + offset / 2);
      setAlbumOnRight(Math.random() < 0.5);
    }
  }, [props.currentTrack?.id])

  function albumArt() {
    const largestImage = props.currentTrack.album.images.sort((a, b) => b.height - a.height)[0];

    return (
      <img className="albumArt" src={largestImage.url} alt="Album cover"/>
    );
  }

  function trackInfo() {
    return (
      <>
        <div className="titleSpacer" />
        <div className="trackInfo">
          <h1 className="primaryText">{props.currentTrack.name}</h1>
          <div className="secondaryText">{props.currentTrack.artists.map(artist => artist.name).join(', ')}</div>
        </div>
        <div className="titleSpacer" />
      </>
    );
  }

  function content() {
    if (albumOnRight) {
      return (
        <div className="contentWrapper">
          <div className="extraSpace" />
          {trackInfo()}
          {albumArt()}
        </div>
      );
    } else {
      return (
        <div className="contentWrapper">
          {albumArt()}
          {trackInfo()}
          <div className="extraSpace" />
        </div>
      );
    }
  }

  function formatColor(color) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
  }

  console.log(props);
  const light = props.dominantColor || defaultColor;
  let darkenAmount = 50;
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
