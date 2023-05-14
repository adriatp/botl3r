const WebSocket = require('ws');
const axios = require('axios');

class Socket {
  constructor(server, twitch_auth, client_db) {
    this.url = 'wss://eventsub-beta.wss.twitch.tv/ws';
    this.auth_token = twitch_auth.token_data.access_token;
    this.channel_id = process.env.CHANNEL_ID;
    this.client_id = process.env.CLIENT_ID;
    this.server = server;
    this.client_db = client_db;

    this.event_subs = [
      'channel.follow',
      'channel.subscribe',
      'channel.subscription.gift',
      'channel.cheer',
      'channel.raid',
      'channel.channel_points_custom_reward_redemption.add',
      'channel.subscription.message'
    ]

    this.ws = new WebSocket(this.url);

    this.ws.on('message', this.onMessage);
  }

  onMessage = (message) => {
    const data = JSON.parse(message);
    // Maneja los diferentes tipos de mensajes recibidos desde el servidor
    try {
      switch (data.metadata.message_type) {
        case 'session_keepalive':
          //console.log('> Received session_keepalive message');
          break;
        case 'session_welcome':
          this.session_id = `${data.payload.session.id}`;
          this.event_subs.forEach(e => this.create_eventsub_subscription(e));
          console.log('> Received session_welcome message');
          break;
        case 'notification':
          let message = this.get_message_from_notification(data.payload);
          this.server.send_message(data.payload.subscription.type, message);
          this.server.update_stats(data.payload.subscription.type, message);
          break;
        default:
          console.log('Unknown message:', data);
          break;
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  get_message_from_notification(payload) {
    switch (payload.subscription.type) {
      case "channel.follow": 
      return `${payload.event.user_name}`;
      case "channel.subscribe":
        return `${payload.event.user_name}`;
      case "channel.subscription.gift":
        return `${payload.event.user_name} (${payload.event.total} subs)`;
      case "channel.subscription.message":
        return `${payload.event.user_name} (${payload.event.cumulative_months} months)`;
      case "channel.cheer":
        return `${payload.event.user_name} (${payload.event.bits} bits)`;
      case "channel.raid":
        return `${payload.event.from_broadcaster_user_login} (${payload.event.viewers} viewers)`;
      case "channel.channel_points_custom_reward_redemption.add":
        return `${payload.event.user_name} (${payload.event.reward.title})`;
    }
  }

  async create_eventsub_subscription(type) {
    let data = {
      version: "1",
      type: type,
      condition: {},
      transport: {
        method: "websocket",
        session_id: `${this.session_id}`
      }
    };
    switch (type) {
      case "channel.follow":
        data.version = 'beta';
        data.condition.broadcaster_user_id = `${this.channel_id}`;
        data.condition.moderator_user_id = `${this.channel_id}`;
      break;
      case "channel.subscribe":
        data.condition.broadcaster_user_id = `${this.channel_id}`;
      break;
      case "channel.subscription.gift":
        data.condition.broadcaster_user_id = `${this.channel_id}`;
      break;
      case "channel.cheer":
        data.condition.broadcaster_user_id = `${this.channel_id}`;
      break;
      case "channel.raid":
        data.condition.to_broadcaster_user_id = `${this.channel_id}`;
      break;
      case "channel.channel_points_custom_reward_redemption.add":
        data.condition.broadcaster_user_id = `${this.channel_id}`;
      break;
      case "channel.subscription.message":
        data.condition.broadcaster_user_id = `${this.channel_id}`;
      break;
    }
    if (data !== null) {
      const url = "https://api.twitch.tv/helix/eventsub/subscriptions";
      const config = {
        headers: {
          'Authorization': `Bearer ${this.auth_token}`,
          'Client-Id': `${this.client_id}`,
          'Content-Type': 'application/json'
        }
      }
      const body = JSON.stringify(data);
      const response = await axios.post(url, body, config);
      if (response.status < 200 || response.status >= 300)
        throw(response);
      else
        console.log(`> Created eventsub for ${type}`);
    }
  }  
}

module.exports = { Socket };