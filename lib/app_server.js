var socketio = require('socket.io');
var io;
var users = {};  // user is socket_id, name, and location.
var userNumber = 0;
var roomName = 'Chat';
var proximity = 5; //distance in km

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    userNumber = handleConnection(socket, userNumber, users);
    joinChat(socket, roomName, users);

    handleMessageBroadcasting(socket, users, roomName);
    handleLocationChange(socket, users, roomName);
    handleNameChange(socket, users, roomName);

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

function joinChat(socket, room, users) {
  socket.join(room);
  socket.broadcast.to(room).emit('message', {
    text: users[socket.id].name + ' has joined.'
  });

  io.sockets.emit("userListChanged", users);
}

function handleLocationChange(socket, users, room) {
  socket.on('locationChange', function(position) {
    users[socket.id].location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    var localUsers = getUsersWithinRadius(users[socket.id], socket.id);
    //broadcast to these users that this user is with their radius
    //broadcast these users to the current user
    //broadcase to all other users that this user is not within their radius

    socket.broadcast.to(room).emit('message', {
      text: 'Hey everyone, ' + socket.id + ' is now at ' + position.coords.latitude + ', ' + position.coords.longitude
    });
  });
}

function handleNameChange(socket, users, room) {
  socket.on("nameChange", function(name) {
    var previousName = users[socket.id].name;
    users[socket.id].name = name;

    socket.broadcast.to(room).emit("message", {
      text: previousName + " is now know as " + name + "."
    });

    io.sockets.emit("userListChanged", users);
  });
}

function handleClientDisconnection(socket, users) {
  socket.on("disconnect", function() {
    delete users[socket.id];
    io.sockets.emit("userListChanged", users);
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

/* Proximity Helpers */
Number.prototype.toRad = function() {
  return this * (Math.PI/180);
}

function calculateDistance(pointA, pointB) {
  var R = 6371;
  var lat1 = pointA.latitude;
  var lat2 = pointB.latitude;
  var lon1 = pointA.longitude;
  var lon2 = pointB.longitude;
  var dLat = (lat2-lat1).toRad();
  var dLon = (lon2-lon1).toRad();
  lat1 = lat1.toRad();
  lat2 = lat2.toRad();

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

function getUsersWithinRadius(localUser, localUserId) {
  var localUsers = {};
  if(typeof localUser.location !== 'undefined') {
    for(var index in users){
      if(index != localUserId) {
        var user = users[index];
        if(typeof user.location !== 'undefined'){
          var diff = calculateDistance(user.location, localUser.location);
          if(diff <= proximity)
            localUsers[index] = user;
        }
      }
    }
  }
  return localUsers;
}