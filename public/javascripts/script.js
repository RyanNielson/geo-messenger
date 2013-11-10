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
    var newElement = $("<li></li>").text(message.text);
    $("#messages").prepend(newElement);
  });

  $("#message-box").focus();

  $("#message-form").submit(function() {
    var message = $("#message-box").val();

    chatApp.sendMessage(message);
    $("#messages").prepend(liEscapedContentElement(message));
    $("#messages-container").scrollTop($("#messages-container").prop("scrollHeight"));
    $("#message-box").val("");

    return false;
  });

  $("#name-form").submit(function() {
    var name = $("#name-box").val();
    chatApp.changeName(name);

    $("#name-box").val("");

    return false;
  });

  socket.on("userListChanged", function(users) {
    $('#users li').remove();
    for (var user in users) {
      $("#users").prepend(liEscapedContentElement(users[user].name));
    }
  });

  geo = new Geo();
  geo.track_location();
});