const { default: axios } = require('axios');
const fs = require('fs').promises;
const qs = require("querystring");

require("dotenv").config();
require("axios");

class TwitchAuth {
  constructor() {
    this.client_id = process.env.CLIENT_ID;
    this.secret = process.env.CLIENT_SECRET;
    this.token_data = '';
  }

  async getTokens() {
    try {
      await this.readTokens();
      if (!await this.validToken()) {
        const new_tokens = await this.refreshTokens();
        this.token_data = new_tokens;
        this.writeTokens();
      }
      console.log('> Authentication valid');
    }
    catch (err) {
      console.log(err);
    }
  }

  async validToken() {
    const url = "https://id.twitch.tv/oauth2/validate"
    const config = {
      headers: {
        'Authorization': `OAuth ${this.token_data.access_token}`
      }
    }
    try {
      await axios.get(url, config);
      return true;
    }
    catch (err) {
      return false
    }
  }

  async refreshTokens() {
    const url = "https://id.twitch.tv/oauth2/token";
    const data = {
      grant_type: 'refresh_token',
      refresh_token: `${this.token_data.refresh_token}`,
      client_id: `${this.client_id}`,
      client_secret: `${this.secret}`
    }
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    const body = qs.stringify(data);
    const response = await axios.post(url, body, config);
    if (response.status != 200)
      throw (err);
    return response.data;
  }

  async readTokens() {
    this.token_data = JSON.parse(await fs.readFile(`${__dirname}/../.tokens.json`, 'UTF-8'));
    return this.token_data;
  }

  async writeTokens() {
    fs.writeFile(`${__dirname}/../.tokens.json`, JSON.stringify(this.token_data))
      .then(() => {
        console.log('> Updated tokens file');
      })
      .catch((err) => {
        console.log('> Error saving tokens');
      })
  }
}

const auth = new TwitchAuth();
module.exports = { auth };