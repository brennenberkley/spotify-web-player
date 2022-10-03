export default class SpotifyPlayer {
  bind(accessToken) {
    window.onSpotifyWebPlaybackSDKReady = () => {
      // eslint-disable-next-line no-undef
      const player = new Spotify.Player({
        name: 'Brennen\'s Web Player',
        getOAuthToken: callback => { callback(accessToken); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('initialization_error', ({ message }) => {
        console.error(message);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error(message);
      });

      player.addListener('account_error', ({ message }) => {
        console.error(message);
      });

      player.addListener('player_state_changed', (playerData) => {
        console.log("Player data:", playerData);
      });

      player.connect();

      document.getElementById('togglePlay').onclick = function() {
        player.togglePlay();
      };
    }
  }
}