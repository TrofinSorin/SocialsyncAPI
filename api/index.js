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

io.on('connection', (socket) => {
  socket.on('login', (data) => {
    console.log(`a user ${data.userId} connected`);
    // saving userId to array with socket ID
    users[socket.id] = data.userId;
    console.log('data.userId:', data.userId);
  });

  socket.on('getOnlineUsers', () => {
    const srvSockets = io.sockets.sockets;
    console.log('serversockets', Object.keys(srvSockets));
    console.log('users', users);

    io.emit('getOnlineUsers', users);
  });

  socket.on('chat message', (msg) => {
    console.log('msg.to:', msg.to)
    console.log('msg.fromSocket:', msg.fromSocket)
    if (msg.to && msg.fromSocket) {
      rooms[`${msg.fromUser.id}-${msg.toUser.id}`] = `${msg.fromUser.id}-${msg.toUser.id}`;

      const roomToJoin = rooms[`${msg.fromUser.id}-${msg.toUser.id}`];
      const sockets = {};
      sockets[msg.to] = msg.to;
      sockets[msg.fromSocket] = msg.fromSocket;

      Object.keys(users).forEach((key) => {
        if (sockets[key]) {
          console.log('sockets key', sockets[key]);
          io.sockets.connected[sockets[key]].join(roomToJoin);
        }
      });

      io.to(roomToJoin).emit('chat message', msg);
    } else {
      if (msg.to) {
        io.to(msg.to).emit('chat message', msg);
      }

      if (msg.fromSocket) {
        io.to(msg.fromSocket).emit('chat message', msg);
      }
    }
  });

  socket.on('getMessages', async (data) => {
    const getAllMessagesLimit = await MessageService.getConversationLimit(data.fromId, data.toId);
    const totalPages = Math.ceil(getAllMessagesLimit[0].count / process.env.MESSAGES_LIMIT);
    console.log('totalPages:', totalPages);

    const allMessages = await MessageService.getMessagesByFromUser(data.fromId, data.toId);

    io.to(data.socket).emit('receiveMessages', JSON.parse(JSON.stringify(allMessages)));
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
    delete users[socket.id];
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
