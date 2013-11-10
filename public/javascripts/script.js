var socket = io.connect();

function liEscapedContentElement(user, message, classes) {
  if(typeof(classes) === "undefined")
    classes = "";

  return $("<li class='" + classes + "'></li>").text(message).prepend("<strong>" + user + "</strong>");
}

function liNonEscapedContentElement(user, message, classes) {
  if(typeof(classes) === "undefined")
    classes = "";

  return $("<li class='" + classes + "'></li>").html(message).prepend("<strong>" + user + "</strong>");
}

function enableChat(){
  $("body").removeClass("no-location").addClass("location").off("touchstart");
}

function disableChat(){
  $("body").removeClass("location").addClass("no-location").on("touchstart", function(e){
    e.preventDefault();
  });
}

$(document).ready(function() {
  var chatApp = new Chat(socket);

  socket.on("message", function(message) {
    var css_class = "message-item";
    if(message.system) {
      css_class += " system-message";
      $("#messages").prepend(liNonEscapedContentElement(message.user, message.text, css_class));
    }
    else {
      $("#messages").prepend(liEscapedContentElement(message.user, message.text, css_class));
    }

    $("#messages-and-users-container").scrollTop(0);
  });

  //disable touch scrolling initially - removed when chat is enabled
  disableChat();

  $("#message-box").focus();

  $("#message-form").submit(function() {
    var message = $("#message-box").val();

    chatApp.sendMessage(message);
    $("#messages").prepend(liEscapedContentElement("You", ": " + message, "message-item current-user-message-item"));
    $("#messages-and-users-container").scrollTop(0);
    $("#message-box").val("");

    return false;
  });

  $("#name-form").submit(function() {
    chatApp.changeName($("#name-box").val());
    $("#name-box").val("");

    return false;
  });

  socket.on("userListChanged", function(users) {
    $("#users li").remove();
    for (var socketId in users) {
      var userName = (socket.socket.sessionid === socketId ? users[socketId].name + " (You)" : users[socketId].name);
      $("#users").prepend(liEscapedContentElement(userName, "", "user-item"));
    }
  });

  socket.on("nameResult", function(name) {
    if (name.success === true)
      $("#user-name").html("Connected as: <strong>" + name.name + "</strong>");
  });

  geo = new Geo();
  geo.track_location();
});