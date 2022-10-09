export default class SpotifyPlayer {
  bind(accessToken, playerStateListener) {
    this._addListeners(accessToken, playerStateListener);
    this._embedScript();
  }

  _embedScript() {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  }

  _addListeners(accessToken, playerStateListener) {
    window.onSpotifyWebPlaybackSDKReady = () => {
      // eslint-disable-next-line no-undef
      this.player = new Spotify.Player({
        name: 'Brennen\'s Web',
        getOAuthToken: callback => { callback(accessToken); },
        volume: 0.5
      });

      this.player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });

      // Not Ready
      this.player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      this.player.addListener('initialization_error', ({ message }) => {
        console.error(message);
      });

      this.player.addListener('authentication_error', ({ message }) => {
        console.error(message);
      });

      this.player.addListener('account_error', ({ message }) => {
        console.error(message);
      });

      this.player.addListener('player_state_changed', (playerData) => {
        console.log("Player data:", playerData);
        playerStateListener(playerData.track_window.current_track);
      });

      this.player.connect();

      // document.getElementById('togglePlay').onclick = function() {
      //   this.player.togglePlay();
      // };
    }
  }
}