'use strict'

const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')
const server = require('http').Server(app);
const io = require('socket.io')(server);

const signin = require('./routers/signin')
const index = require('./routers/index')
const nlp = require('./routers/nlp')
const users = require('./routers/users');
const posts = require('./routers/posts');
const song = require('./routers/song')

// Mongoose ODM
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dbsentiment', err => {
  err ? console.log(err) : console.log('database connected')
});

// Socket IO
var connections = [];

io.on('connection', function(socket){
  // console.log('a user connected', socket.handshake.headers['user-agent']);

  connections.push(socket);
  console.log(`Connected: ${connections.length} sockets connected`);
  io.sockets.emit('connected', { connected: connections.length })

  socket.on('create post', function(userName, post){
    io.sockets.emit('new post', { username: userName, post: post })
  });

  socket.on('disconnect', function(data) {
    connections.splice(connections.indexOf(socket), 1)
    console.log(`A user disconnected: ${connections.length} sockets connected`);
    io.sockets.emit('connected', { connected: connections.length })
  })
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(bodyParser.json());
app.use(cors())

app.use('/', index);
app.use('/signin', signin);
app.use('/nlp', nlp);
app.use('/users',users);
app.use('/posts',posts);
app.use('/song', song)

server.listen(process.env.PORT || 3000);
