const tmi = require("tmi.js");
const striptags = require('striptags');
require("dotenv").config();

const excluded_users = [
  'nightbot',
  'streamelements'
];

const excluded_inital_chars = [
  '!',
  '/'
];

class Chat {
  constructor(server,twitch_auth,twitch_api) {
    this.server = server;
    this.twitch_api = twitch_api;
    this.username = process.env.USERNAME;
    this.access_token = `oauth:${twitch_auth.token_data.access_token}`;
    this.channel_name = process.env.CHANNEL_NAME;

    this.replace_names = JSON.parse(process.env.REPLACE_NAMES);

    this.excluded_users = new Set();
    excluded_users.forEach(e => this.excluded_users.add(e));

    this.excluded_inital_chars = new Set();
    excluded_inital_chars.forEach(e => this.excluded_inital_chars.add(e));

    this.viewers = {};

    this.client = new tmi.Client({
      options: { debug: true },
      identity: {
        username: this.username,
        password: this.access_token
      },
      channels: [
        this.channel_name
      ],
    });
    
    this.client.connect();

    this.client.on("message", async (channel, userstate, message, self) => {
      this.process_message(channel, userstate, message, self);
    });
  }

  process_message(channel, userstate, message, self) {
    //  Filtramos usuarios y comandos
    if (this.excluded_users.has(userstate.username.toLowerCase())) return;
    if (this.excluded_inital_chars.has(message[0])) return;
    //  Pillamos la info del mensaje
    let username = userstate.username;
    let display_name = striptags(userstate["display-name"]);
    let color = userstate.color;
    let subscriber = userstate.subscriber;
    let emotes = userstate.emotes;
    let is_mod = userstate.mod;
    let type = userstate["message-type"];
    let trimed_message = striptags(message.replace(/ {2,}/g,' ')).trim();
    //  Si es un usuario elegido (.env) le cambiamos el nombre
    if (display_name in this.replace_names)
      display_name = this.replace_names[display_name];
    //  Creamos la entrada del usuario en el objecto viewers en caso que no exista
    if (!(username in this.viewers))
      this.viewers[username] = {};
    //  Actualizamos la info del objeto viewer con los datos recibidos
    this.viewers[username]['name'] = display_name;
    this.viewers[username]['subscriber'] = subscriber;
    this.viewers[username]['badge'] = subscriber ? userstate['badge-info'].subscriber : '';
    this.viewers[username]['color'] = color;
    this.viewers[username]['is_mod'] = is_mod;
    this.viewers[username]['type'] = type;
    this.viewers[username]['emotes'] = emotes;
    this.viewers[username]['message'] = trimed_message;
    //  En caso que sea el primer mensaje del usuario des de que se abrió el servidor,
    //  el usuario no tendrá inicializada la imagen de perfil y hay que setearla.
    //  En caso que ya la tenga, la mandamos automáticamente
    if (typeof this.viewers[username]['image'] === 'undefined')
      this.twitch_api.get_twitch_avatar(this.viewers,username,this.server);
    else
      this.server.send_message('chat', this.viewers[username]);
  }
}

module.exports = { Chat };