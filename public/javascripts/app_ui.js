var socket = io.connect();

//socket demo functions
socket.on('testConnection', function(message){
	console.log(message.text);
});

socket.on('testBroadcast', function(message){
	console.log(message.text);
});

socket.on('locationChangeNotification', function(message){
	console.log(message.text);
});

var Geo = function(){};
Geo.prototype.current_location = function(position){
	var coords = position.coords;
	this.location.lat = coords.latitude;
	this.location.lon = coords.longitude;
	this.location_established = true;
	console.log("You're now at Lat: " + coords.latitude + " & Lon: " + coords.longitude);
	socket.emit('locationChange', {coords: coords});
};
Geo.prototype.error = function(err){
	console.log("Sorry, but it looks like your browser or device does not support geolocation. If you have it disabled please enable it.");
	console.log(err);
	if(err.message)
		console.log(err.message);
	//TODO: disable chat functionality/interface
};
Geo.prototype.default_options = {
	enableHighAccuracy: true,
	timeout: 5000
};
Geo.prototype.location = {
	lat: false,
	lon: false
};
Geo.prototype.location_established = false;
Geo.prototype.track_location = function(){
	if(Modernizr.geolocation){
		navigator.geolocation.watchPosition(this.current_location, this.error, this.default_options);
	}
	else
		this.error();
}

geo = new Geo();
geo.track_location();