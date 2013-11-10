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

    handleClientDisconnection(socket);
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
    },
    nearByUserIds: []
  };

  socket.emit('nameResult', {
    success: true,
    name: name
  });

  return userNumber + 1;
}

function joinChat(socket, room, users) {
  //once you connect not much can happen until your geolocation has been detected
  socket.join(room);
  socket.broadcast.to(room).emit('message', {
    text: users[socket.id].name + ' has joined.'
  });
}

//this happens when a geolocation is first detected and when it is changed
function handleLocationChange(socket, users, room) {
  socket.on('locationChange', function(position) {
    users[socket.id].location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    //remove this before production, but it is handy for testing
    socket.broadcast.to(room).emit('message', {
      text: 'Hey everyone, ' + users[socket.id].name + ' is now at ' + position.coords.latitude + ', ' + position.coords.longitude
    });

    //go through each user, compare to each other user and emit a (possibly) unique list to each user
    for(var userId in users){
      var nearByUsers = getUsersWithinRadius(users[userId], userId);
      var nearByUserIds = [];
      for(nearByUserId in nearByUsers)
        nearByUserIds.push(nearByUserId);
      users[userId].nearByUserIds = nearByUserIds;
      io.sockets.sockets[userId].emit("userListChanged", nearByUsers);
    }
  });
}

function handleNameChange(socket, users, room) {
  socket.on("nameChange", function(name) {
    var previousName = users[socket.id].name;
    users[socket.id].name = name;

    //loop through all near by users and emit the message only to them
    for(var i = 0; i < users[socket.id].nearByUserIds.length; i++) {
      var nearByUserId = users[socket.id].nearByUserIds[i];
      io.sockets.sockets[nearByUserId].emit("message", {
        text: previousName + " is now know as " + name + "."
      });

      /*
      on the surface this looks verbose and kinda of ugly by the names DO make sense
      and DO follow the rest of our "descriptive" naming standards
      this is basically a copy from the change location userListChange emit
      BUT this is not called on EVERY user, only affected ones
      plus it doesn't update the nearByUserIds on the user because that hasn't changed
      */
      var nearByUser = users[nearByUserId];
      var nearByUserNearByUsers = getUsersWithinRadius(nearByUser, nearByUserId);
      var nearByUserNearByUserIds = [];
      for(nearByUserNearByUserId in nearByUserNearByUsers)
        nearByUserNearByUserIds.push(nearByUserNearByUserId);

      io.sockets.sockets[nearByUserId].emit("userListChanged", nearByUserNearByUsers);
    }

    socket.emit('nameResult', {
      success: true,
      name: name
    });
  });
}

function handleClientDisconnection(socket) {
  socket.on("disconnect", function() {
    for(var userId in users){
      nearByUsers = [];

      /*
       * we stored near by user ids in the location change
       * now go through all users and their known near by users
       *  get rid of the delete user in any instance and emit user list to specific user
       */
      for(var i = 0; i < users[userId].nearByUserIds.length; i++) {
        var nearByUserId = users[userId].nearByUserIds[i];
        if(nearByUserId == socket.id)
          delete users[userId].nearByUserIds[i];
        else
          nearByUsers.push(users[nearByUserId]);
      }

      io.sockets.sockets[userId].emit("userListChanged", nearByUsers);
    }

    sendUserLeftMessage(socket);
    delete users[socket.id];
  });
}

function sendUserLeftMessage(socket) {
  for(var i = 0; i < users[socket.id].nearByUserIds.length; i++) {
    var nearByUserId = users[socket.id].nearByUserIds[i];
    io.sockets.sockets[nearByUserId].emit("message", {
      text: users[socket.id].name + " left."
    });
  }
}

function handleMessageBroadcasting(socket, users, room) {
  socket.on("message", function(message) {
    console.log("Message broadcasting - " + message.text);
    //loop through all near by users and emit the message only to them
    for(var i = 0; i < users[socket.id].nearByUserIds.length; i++) {
      var nearByUserId = users[socket.id].nearByUserIds[i];
      io.sockets.sockets[nearByUserId].emit("message", {
        text: users[socket.id].name + ": " + message.text
      });
    }
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
  if(typeof localUser.location !== 'undefined' && (localUser.location.latitude != null && localUser.location.longitude != null)) {
    for(var index in users){
      if(index != localUserId) {
        var user = users[index];
        if(typeof user.location !== 'undefined' && (user.location.latitude != null && user.location.longitude != null)){
          var diff = calculateDistance(user.location, localUser.location);
          if(diff <= proximity)
            localUsers[index] = user;
        }
      }
    }
  }
  return localUsers;
}