const axios = require('axios');

class TwitchAPI {
  constructor(twitch_auth) {
    this.client_id = twitch_auth.client_id;
    this.access_token = twitch_auth.token_data.access_token
    
    /*
    this.socket_client = io('wss://eventsub-beta.wss.twitch.tv/ws');

    this.socket_client.on('connect', function() {
      console.log('Conexión establecida');
    });
    
    this.socket_client.on('disconnect', function() {
      console.log('Conexión cerrada');
    });
    
    this.socket_client.on('connect_error', function(error) {
      console.error('Error de conexión:', error);
    });
    */
  }
  
  get_twitch_avatar(viewers, username, server) {
    const url = `https://api.twitch.tv/helix/users?login=${username}`;
    let headers = {
      'Client-ID': this.client_id,
      'Authorization': `Bearer ${this.access_token}`
    }
    axios.get(url, { headers })
    .then(response => {
      const user = response.data.data[0];
      viewers[username]['image'] = user.profile_image_url;
      server.send_message('chat', viewers[username]);
    })
    .catch(error => {
      console.error(`Error al obtener el avatar: ${error}`);
    });
  }
}

module.exports = { TwitchAPI };