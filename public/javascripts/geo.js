var Geo = function() {
};

Geo.prototype.changeTolerance = 0.0001; // approx 7.8m

Geo.prototype.current_location = function(position) {
  var coords = position.coords;
  var dLat = Math.abs(this.point.lat - coords.latitude);
  var dLon = Math.abs(this.point.lon - coords.longitude);
  if(dLat >= this.changeTolerance || dLon >= this.changeTolerance || this.point.lat === false || this.point.lon === false) {
    this.point.lat = coords.latitude;
    this.point.lon = coords.longitude;
    this.location_established = true;
    console.log("You're now at Lat: " + coords.latitude + " & Lon: " + coords.longitude);
    alert("You're now at Lat: " + coords.latitude + " & Lon: " + coords.longitude);
    socket.emit('locationChange', { coords: coords });
  }
  else{
    alert("You coords changed, but not that much. Delta Lat: " + dLat + ", Delta Lon: " + dLon);
  }
};

Geo.prototype.error = function(err) {
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

Geo.prototype.point = {
  lat: false,
  lon: false
};

Geo.prototype.location_established = false;

Geo.prototype.track_location = function(){
  if(Modernizr.geolocation){
      _this = this;
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