import { useEffect, useState } from 'react';
import './TrackView.css';


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
        albumArt.style.right = albumOffset + 'px';
        trackInfo.style.right = trackInfoOffset + 'px';
      } else {
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
      setTrackInfoOffset(extraSpace.clientWidth / 2 + offset / 2)
    }
  }, [props.currentTrack?.id])

  function albumArt() {
    return (
      <img className="albumArt" src={props.currentTrack.album.images[0].url} alt="Album cover"/>
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

  return (
    <div className="TrackView">
      {props.currentTrack && content()}
    </div>
  );
}

export default TrackView;
