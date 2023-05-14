const { auth } = require("./auth");
const { TwitchAPI } = require("./twitch_api");
const { Server } = require("./server");
const { Chat } = require("./chat");
const { Socket } = require("./socket");
const { Mongo } = require("./mongo");
require("dotenv").config();
//  const { SocketServer } = require("socket.io");

class Botl3r {
  constructor() {
    auth.getTokens().then(() => {
      let server_port, mongo_ip, mongo_port, mongo_db, mongo_user, mongo_pwd;
      if (process.env.NODE_ENV === 'development') {
        server_port = 3030;
        mongo_ip = process.env.DEV_MONGO_IP;
        mongo_port = process.env.DEV_MONGO_PORT;
        mongo_user = process.env.DEV_MONGO_USER;
        mongo_pwd = process.env.DEV_MONGO_PWD;
        mongo_db = process.env.DEV_MONGO_DB;
      }
      if (process.env.NODE_ENV === 'production') {
        server_port = 3000;
        mongo_ip = process.env.PROD_MONGO_IP;
        mongo_port = process.env.PROD_MONGO_PORT;
        mongo_user = process.env.PROD_MONGO_USER;
        mongo_pwd = process.env.PROD_MONGO_PWD;
        mongo_db = process.env.PROD_MONGO_DB;
      }
      this.mongo = new Mongo(mongo_ip,mongo_port,mongo_db,mongo_user,mongo_pwd);
      this.twitch_api = new TwitchAPI(auth);
      this.server = new Server(server_port,this.mongo);
      this.chat = new Chat(this.server,auth,this.twitch_api);
      this.socket = new Socket(this.server,auth,this.mongo);
    });
  }
}

module.exports = { Botl3r }