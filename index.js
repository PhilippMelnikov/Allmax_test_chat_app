const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const messageService = require('./services/MessageService');
const userService = require('./services/UserService');
mongoose.connect('mongodb://localhost:27017/chat_app');

const users = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * homepage
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

/**
 * get users online
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
app.get('/api/users', function (req, res) {
    res.send(users);
});

/**
 * get messages list
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
app.get('/api/messages', function (req, res) {
    messageService.getMessages().then((messages) => {
        const clientSideMessages = messages.map((item) => {
            const clientSideMessage = {
                user: item.user.name,
                text: item.text,
                date: item.date,
            }
            return clientSideMessage
        })
        res.send(clientSideMessages);
    })
});

io.on('connection', function (socket) {
    userService.getOrCreateUser(socket.handshake.address).then((user) => {
        users.push(user);
        socket.broadcast.emit('user joined', user.name);
        io.emit('update clientCount', users.length);
    }).catch((err) => {
        throw err;
    });

    // chat message
    socket.on('send message', function (msg) {
        const user = users.map((client) => {
            if (client.IP === socket.handshake.address) {
                return client;
            }
        })[0];
        messageService.saveMessage(user, msg).then((res) => {
            const message = {
                user: user.name,
                text: res.text,
                date: res.date
            }
            io.emit('broadcast message', message);
        }).catch((err) => {
            throw err;
        });
    });
    // disconnect
    socket.on('disconnect', function () {
        let user;
        for (let i = 0; i < users.length; i++) {
            if (users[i].IP === socket.handshake.address) {
                user = users.splice(i, 1)[0];
                break;
            }
        }
        socket.broadcast.emit('user leaved', user.name);
        io.emit('update clientCount', users.length);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});