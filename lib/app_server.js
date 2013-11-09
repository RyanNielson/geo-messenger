var socketio = require('socket.io');
var io;
var users = {};  // user is socket_id, name, and location.
var userNumber = 0;
var roomName = 'Chat';

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    userNumber = handleConnection(socket, userNumber, users);
    joinChat(socket, roomName);

    handleMessageBroadcasting(socket, users, roomName);
    handleLocationChange(socket, users, roomName);
    // handleNameChangeAttempts(socket, nickNames, namesUsed);

    handleClientDisconnection(socket, users);
  });
}

function handleConnection(socket, guestNumber, users) {
  var name = 'User ' + userNumber;
  users[socket.id] = {
    socket_id: socket.id,
    name: name,
    location: {
      latitude: null,
      longitude: null
    }
  };

  socket.emit('nameResult', {
    success: true,
    name: name
  });

  return userNumber + 1;
}

function joinChat(socket, room) {
  socket.join(room);
  socket.broadcast.to(room).emit('message', {
    text: users[socket.id].name + ' has joined.'
  });
}

function handleLocationChange(socket, users, room) {
  socket.on('locationChange', function(position) {
    users[socket.id].location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    console.log(users);

    //TODO: once user objects exist add the coords to them (user.coords = coords;)
    socket.broadcast.to(room).emit('message', {
      text: 'Hey everyone, ' + socket.id + ' is now at ' + position.coords.latitude + ', ' + position.coords.longitude
    });
  });
}

function handleClientDisconnection(socket, users) {
  socket.on("disconnect", function() {
    delete users[socket.id];
  });
}

function handleMessageBroadcasting(socket, users, room) {
  socket.on("message", function(message) {
    console.log("Message broadcasting - " + message.text);
    socket.broadcast.to(room).emit("message", {
      text: users[socket.id].name + ": " + message.text
    });
  });
}