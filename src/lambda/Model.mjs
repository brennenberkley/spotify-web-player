import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

const REGION = 'us-west-2';

export default class Model {
  dynamoDBClient = new DynamoDBClient({ region: REGION });

  async saveTokenToDatabase(loginId, accessToken, refreshToken) {
    console.log("Saving", loginId, accessToken, refreshToken)
    let authData = {
      loginId,
      accessToken,
      refreshToken,
      ttl: Date.now() / 1000 + 120
    };

    console.log("Auth data", authData)

    let params = {
      TableName: 'SpotifyLogins',
      Item: this._formatDynamoDBItem(authData)
    };

    const command = new PutItemCommand(params);
    await this.dynamoDBClient.send(command);
  }

  async getToken(loginId) {
    const params = {
      TableName: 'SpotifyLogins',
      ExpressionAttributeValues: {
        ':loginId' : {S: loginId}
      },
      KeyConditionExpression: 'loginId=:loginId'
    }

    const command = new QueryCommand(params);
    const response = await this.dynamoDBClient.send(command);

    if (response.ScannedCount == 0) {
      return null;
    }

    return {
      accessToken: response.Items[0].accessToken.S,
      refreshToken: response.Items[0].refreshToken.S
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
}