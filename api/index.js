import config from 'dotenv';
import bodyParser from 'body-parser';
import userRoutes from './server/routes/UserRoutes';
import loginRoutes from './server/routes/LoginRoutes';
import securedRoutes from './server/routes/securedRoutes';
import messageRoutes from './server/routes/MessageRoutes';
import MessageService from './server/services/MessageService';

const Ioport = 8001;

config.config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.listen(Ioport);

const users = {};
const rooms = {};

function generateRoomId(string) {
  const output = string.split('-');

  const result = output.map((item) => {
    return parseInt(item, 10);
  }).sort((a, b) => {
    return a - b;
  }).join('-');

  return result;
}

io.on('connection', (socket) => {
  socket.on('login', (data) => {
    console.log(`a user ${data.userId} connected`);
    // saving userId to array with socket ID
    users[data.userId] = socket.id;
  });

  socket.on('getOnlineUsers', () => {
    const srvSockets = io.sockets.sockets;
    console.log('serversockets', Object.keys(srvSockets));
    console.log('users', users);

    io.emit('getOnlineUsers', users);
  });

  socket.on('chat message', (msgData) => {
    const fromUserSocket = users[msgData.fromUser.id];
    const toUserSocket = users[msgData.toUser.id];
    let roomToJoin;

    if (fromUserSocket && toUserSocket) {
      rooms[generateRoomId(`${msgData.fromUser.id}-${msgData.toUser.id}`)] = [fromUserSocket, toUserSocket];

      Object.keys(rooms).forEach((item) => {
        if (rooms[item].includes(fromUserSocket && toUserSocket)) {
          roomToJoin = item;
        }
      });

      const socketsToConnectTo = {};
      socketsToConnectTo[fromUserSocket] = fromUserSocket;
      socketsToConnectTo[toUserSocket] = toUserSocket;

      Object.keys(socketsToConnectTo).forEach((key) => {
        io.sockets.connected[socketsToConnectTo[key]].join(roomToJoin);
      });

      console.log('io.sockets.manager.roomClients[socket.id]', io.sockets.adapter.sids);
      console.log('roomsToJOIN', rooms);

      io.to(roomToJoin).emit('chat message', msgData);
    } else {
      if (users[msgData.toUser.id]) {
        io.to(users[msgData.toUser.id]).emit('chat message', msgData);
      }

      if (users[msgData.fromUser.id]) {
        io.to(users[msgData.fromUser.id]).emit('chat message', msgData);
      }
    }
  });

  socket.on('getMessages', async (data) => {
    const getAllMessagesLimit = await MessageService.getConversationLimit(data.fromId, data.toId);
    const totalPages = Math.ceil(getAllMessagesLimit[0].count / process.env.MESSAGES_LIMIT);
    const allMessages = await MessageService.getMessagesByFromUser(data.fromId, data.toId);

    io.to(users[data.fromId]).emit('receiveMessages', JSON.parse(JSON.stringify(allMessages)));
  });

  socket.on('createRoom', async (room) => {
    socket.join(room);
    io.emit('roomJoined', room);
  });

  socket.on('createRoom', async (room) => {
    socket.join(room);
    io.emit('roomJoined', room);
  });

  socket.on('leaveRoom', async (room) => {
    socket.leave(room);
  });

  socket.on('getRooms', () => {
    io.emit('getRooms', socket.rooms);
  });

  socket.on('disconnect', () => {
    io.emit('disconnect');

    Object.keys(users).forEach((item) => {
      if (users[item] === socket.id) {
        delete users[item];

        Object.keys(rooms).forEach((key) => {
          if (rooms[key].includes(socket.id)) {
            delete rooms[key];
          }
        });
      }
    });

    console.log('Final Rooms', rooms);
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 8000;

app.use('/api/v1/secured/users', securedRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/', loginRoutes);
app.use('/api/v1/messages', messageRoutes);

// when a random route is inputed
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to this API.',
}));

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});


module.exports.bcrypt = { bcrypt };

export default app;
