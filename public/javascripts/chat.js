var Chat = function(socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function(text) {
  var message = {
    text: text
  };

  this.socket.emit("message", message);
};

Chat.prototype.changeName = function(name) {
  this.socket.emit("nameChange", name);
};