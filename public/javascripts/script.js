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

  socket.on("message", function(message) {
    console.log("Received Message");
    var newElement = $("<li></li>").text(message.text);
    $("#messages").prepend(newElement);
  });

  $("#message-box").focus();

  $("#message-form").submit(function() {
    console.log("Form submitted");

    var message = $("#message-box").val();

    chatApp.sendMessage(message);
    $("#messages").prepend(liEscapedContentElement(message));
    $("#messages-container").scrollTop($("#messages-container").prop("scrollHeight"));
    $("#message-box").val("");

    return false;
  });

  $("#name-form").submit(function() {
    console.log("Name change submitted");
    var name = $("#name-box").val();

    chatApp.changeName(name);

    return false;
  });

  geo = new Geo();
  geo.track_location();
});