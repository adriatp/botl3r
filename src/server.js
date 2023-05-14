const express = require('express');
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs').promises;

class Server {
    constructor(port,db) {
        this.port = port;
        this.sockets = {};
        this.db = db;
        app.use(express.static(path.join(__dirname,'../public/assets')));

        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });

        app.get('/iframe', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/iframe.html'));
        });

        io.on('connection', (socket) => {
            let userId = socket.request._query['userId'];
            this.sockets[userId] = socket;
            socket.on('disconnect', () => {
                delete this.sockets[userId];
            });
            this.initialize_stats(socket);
        });

        http.listen(this.port, async () => {
            console.log(`> Server running at ${this.port}`);
        });
    }

    send_message(type, message) {
        Object.values(this.sockets).forEach(function(socket) {
            socket.emit(type, JSON.stringify(message));
        });
    }

    async update_stats(type, message) {
        this.stats[type] = message;
        await this.db.insert_one('current_stats',this.stats);
    }

    async initialize_stats(socket) {
        //  this.stats = JSON.parse(await fs.readFile(`${__dirname}/../stats.json`, 'UTF-8'));
        //  await this.db.insert_one('current_stats',this.stats);
        this.stats = await this.db.get_last('current_stats');
        Object.keys(this.stats).forEach(e => {
            socket.emit(e, this.stats[e]);
        });
        console.log(this.stats);
    }
}

module.exports = { Server };