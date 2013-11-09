var socket = io.connect();

function liEscapedContentElement(message) {
  return $("<li></li>").text(message);
}

function processUserInput(chatApp, socket) {
  var message = $("#message-box").val();

  chatApp.sendMessage(message);
  $("#messages").prepend(liEscapedContentElement(message));
  $("#messages-container").scrollTop($("#messages-container").prop("scrollHeight"));

  $("#message-box").val("");
}

$(document).ready(function() {
  var chatApp = new Chat(socket);

  // socket.on("nameResult", function(result) {
  //   var message;

  //   if (result.success)
  //     message = "You are now known as " + result.name + ".";
  //   else
  //     message = result.message;

  //   $("#messages").append(divSystemContentElement(message));
  // });

  // socket.on("joinResult", function(result) {
  //   $("#room").text(result.room);
  //   $("#messages").append(divSystemContentElement("Room changed."));
  // });

  socket.on("message", function(message) {
    console.log("Received Message");
    var newElement = $("<li></li>").text(message.text);
    $("#messages").prepend(newElement);
  });

  // setInterval(function() {
  //   socket.emit("rooms");
  // }, 1000);

  $("#message-box").focus();

  $("#message-form").submit(function() {
    console.log("Form submitted");
    processUserInput(chatApp, socket);
    return false;
  });

  geo = new Geo();
  geo.track_location();
});