import { DynamoDBClient, PutItemCommand, QueryCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = 'us-west-2';
const LIKED_SONGS_PLAYLIST_ID = '#LikedSongs';

export default class Model {
  dynamoDBClient = new DynamoDBClient({ region: REGION });

  async saveLikedSongs(tracks) {
    await this.saveTracksForPlaylist(tracks, {
      id: LIKED_SONGS_PLAYLIST_ID,
      name: 'Liked Songs'
    })
  }

  async savePlaylistDetails(playlist, playlistTracks) {
    let playlistData = {
      pk: 'PLAYLIST-' + playlist.id,
      sk: '#data',
      name: playlist.name,
      description: playlist.description,
      trackCount: playlist.tracks.total,
      images: playlist.images.map(image => ({
        height: image.height,
        url: image.url
      })),
      tracks: playlistTracks
    };

    let params = {
      TableName: 'SpotifyLibrary',
      Item: this._formatDynamoDBItem(playlistData)
    };

    const command = new PutItemCommand(params);
    await this.dynamoDBClient.send(command);
  }

  async saveTracksForPlaylist(tracks, playlist) {
    const writeRequests = [];

    for (let item of tracks) {
      let track = item.track;

      let album = {
        id: track.album.id,
        name: track.album.name,
        images: track.album.images.map(image => ({
          height: image.height,
          url: image.url
        })),
        releaseDate: track.album.release_date,
        releaseDatePrecission: track.album.release_date_precision
      }

      let artists = track.artists.map(artist => ({
        id: artist.id,
        name: artist.name
      }));

      let trackData = {
        pk: 'PLAYLIST-' + playlist.id,
        sk: 'TRACK-' + track.id,
        name: track.name,
        playlistName: playlist.name,
        addedAt: item.added_at,
        isrc: track.external_ids.isrc,
        album,
        artists
      };

      writeRequests.push({
        PutRequest: { Item: this._formatDynamoDBItem(trackData) }
      });
    }

    let params = {
      RequestItems: {
        'SpotifyLibrary': writeRequests
      }
    };

    const command = new BatchWriteItemCommand(params);
    await this.dynamoDBClient.send(command);
  }

  async getLikedSongs() {
    return this.getTracks(LIKED_SONGS_PLAYLIST_ID)
  }

  async getPlaylists() {
    let lastKey = null;

    const playlists = [];

    while (true) {
      const params = {
        TableName: 'SpotifyLibrary',
        IndexName: 'Songs',
        ExpressionAttributeValues: {
          ':sk' : {S: '#data'}
        },
        KeyConditionExpression: 'sk=:sk',
        ExclusiveStartKey: lastKey
      }

      const command = new QueryCommand(params);
      const response = await this.dynamoDBClient.send(command);
      for (let item of response.Items) {
        playlists.push(this._formatPlaylist(item));
      }

      lastKey = response.LastEvaluatedKey;

      if (!lastKey) {
        break;
      }
    }

    return playlists;
  }

  async getTracks(playlistId) {
    let lastKey = null;

    const tracks = [];

    while (true) {
      const params = {
        TableName: 'SpotifyLibrary',
        ExpressionAttributeValues: {
          ':pk' : {S: 'PLAYLIST-' + playlistId}
        },
        KeyConditionExpression: 'pk=:pk',
        ExclusiveStartKey: lastKey
      }

      const command = new QueryCommand(params);
      const response = await this.dynamoDBClient.send(command);
      for (let item of response.Items) {
        tracks.push(this._formatTrack(item));
      }

      lastKey = response.LastEvaluatedKey;

      if (!lastKey) {
        break;
      }
    }

    return tracks;
  }


  async getTrack(trackId) {
    const params = {
      TableName: 'SpotifyLibrary',
      IndexName: 'Songs',
      ExpressionAttributeValues: {
        ':sk' : {S: 'TRACK-' + trackId}
      },
      KeyConditionExpression: 'sk=:sk',
      Limit: 1
    }

    const command = new QueryCommand(params);
    const response = await this.dynamoDBClient.send(command);

    console.log(response);
    if (response.Items?.length > 0) {
      return this._formatTrack(response.Items[0]);
    }
  }

  _formatDynamoDBItem(object) {
    let output = {}

    for (const [key, val] of Object.entries(object)) {
      if (typeof val === 'number') {
        output[key] = { N: val.toString() }
      } else if (typeof val === 'string') {
        output[key] = { S: val }
      } else {
        output[key] = { S: JSON.stringify(val) }
      }
    }

    return output;
  }

  _formatTrack(track) {
    return {
      id: track.sk.S.replace('TRACK-', ''),
      name: track.name.S,
      addedAt: track.addedAt.S,
      isrc: track.isrc.S,
      artists: JSON.parse(track.artists.S),
      album: JSON.parse(track.album.S),
    }
  }

  _formatPlaylist(playlist) {
    return {
      id: playlist.pk.S.replace('PLAYLIST-', ''),
      name: playlist.name.S,
      description: playlist.description.S,
      tracks: JSON.parse(playlist.tracks.S),
      images: JSON.parse(playlist.images.S),
      trackCount: parseInt(playlist.trackCount.N)
    }
  }
}