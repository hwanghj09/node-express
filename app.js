const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('views'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Initialize database if it doesn't exist
db.defaults({ messages: [] }).write();
const users = {}; // Store user nicknames

io.on('connection', (socket) => {
    console.log('a user connected');

    // Event handler for setting nickname
    socket.on('set nickname', (nickname) => {
        users[socket.id] = nickname;
        socket.broadcast.emit('chat message', { text: `${nickname} has joined the chat.`, nickname: 'System' });
    });

    // Send previous messages to the new client
    socket.emit('previous messages', db.get('messages').value());

    socket.on('disconnect', () => {
        const nickname = users[socket.id];
        if (nickname) {
            io.emit('chat message', { text: `${nickname} has left the chat.`, nickname: 'System' });
        }
        delete users[socket.id];
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        const nickname = users[socket.id] || 'Anonymous';
        const newMessage = { text: msg.text, nickname: nickname, timestamp: new Date() };
        db.get('messages').push(newMessage).write();
        io.emit('chat message', newMessage);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});