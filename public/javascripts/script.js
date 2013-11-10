var socket = io.connect();

function liEscapedContentElement(message, classes) {
  if(typeof(classes) === 'undefined')
    classes = '';

  return $('<li class="' + classes + '"></li>').text(message);
}

function enableChat(){
  $("body").removeClass("no-location").addClass("location").off("touchstart");
  $("#message-box").focus();
}

function disableChat(){
  $("body").removeClass("location").addClass("no-location").on("touchstart", function(e){
    e.preventDefault();
  });
}

$(document).ready(function() {
  var chatApp = new Chat(socket);

  socket.on("message", function(message) {
    $("#messages").prepend(liEscapedContentElement(message.text, 'message-item'));
  });

  //show the connection ID - just for debugging?
  socket.on("connect", function(){
    $('#connection-box').val(socket.socket.sessionid);
  });

  //disable touch scrolling initially - removed when chat is enabled
  disableChat();

  $("#message-box").focus();

  $("#message-form").submit(function() {
    var message = $("#message-box").val();

    chatApp.sendMessage(message);
    $("#messages").prepend(liEscapedContentElement('You: ' + message, 'message-item current-user-message-item'));
    $("#messages-container").scrollTop($("#messages-container").prop("scrollHeight"));
    $("#message-box").val("");

    return false;
  });

  $("#name-form").submit(function() {
    chatApp.changeName($("#name-box").val());
    $("#name-box").val("");

    return false;
  });

  socket.on("userListChanged", function(users) {
    $('#users li').remove();
    for (var socketId in users) {
      var userName = (socket.socket.sessionid === socketId ? users[socketId].name + " (You)" : users[socketId].name);
      $("#users").prepend(liEscapedContentElement(userName, 'user-item'));
    }
  });

  geo = new Geo();
  geo.track_location();
});