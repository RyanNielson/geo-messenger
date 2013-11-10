var Geo = function() {
};

Geo.prototype.changeTolerance = 0.0001; // approx 7.8m

Geo.prototype.current_location = function(position) {
  var coords = position.coords;
  var dLat = Math.abs(this.location.lat - coords.latitude);
  var dLon = Math.abs(this.location.lon - coords.longitude);
  if(dLat >= this.changeTolerance || dLon >= this.changeTolerance || this.location.lat === false || this.location.lon === false) {
    this.location.lat = coords.latitude;
    this.location.lon = coords.longitude;
    this.location_established = true;
    socket.emit("locationChange", { coords: coords });
  }
  //enable chat functionality
  enableChat();
  $("#user-location").text(coords.latitude + ", " + coords.longitude);
};

Geo.prototype.error = function(err) {
  console.log("Sorry, but it looks like your browser or device does not support geolocation. If you have it disabled please enable it.");
  console.log(err);
  if(err.message)
      console.log(err.message);
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
      _this = this;
      navigator.geolocation.getCurrentPosition(function(position){
        _this.current_location(position);
      });
      navigator.geolocation.watchPosition(
        function(position){
          _this.current_location(position);
        },
        this.error,
        this.default_options
      );
  }
  else
      this.error();
}