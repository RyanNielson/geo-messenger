var socketio = require('socket.io');
var io;

exports.listen = function(server){
	io = socketio.listen(server);
	io.set('log level', 1);

	io.sockets.on('connection', function(socket){
		console.log('connection made');
		socket.join('testSock');
		socket.emit('testConnection', {text: 'Welcome, you have connected!'});
		socket.broadcast.to('testSock').emit('testBroadcast', {text: 'Hey everyone, someone else just joined!'});

		socket.on('locationChange', function(position){
			//TODO: once user objects exist add the coords to them (user.coords = coords;)
			socket.broadcast.to('testSock').emit('locationChangeNotification', {
				text: 'Hey everyone, ' + socket.id + ' is now at ' + position.coords.latitude + ', ' + position.coords.longitude
			});
		});
	});
};