var Chat = function(socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function(text) {
  var message = {
    text: text
  };

  this.socket.emit("message", message);
};

Chat.prototype.processCommand = function(command) {
  var words = command.split(" ");
  var command = words[0].substring(1, words[0].length).toLowerCase();
  var message = false;

  switch(command) {
    case "nick":
      words.shift();
      var name = words.join(" ");
      this.socket.emit("nameAttempt", name);
      break;
    default:
      message = "Unrecognized command";
      break;
  }

  return message;
};