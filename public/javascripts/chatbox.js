// namespace
var cloudezero = {};

cloudezero.Chatbox = function (parentDiv) {
  this.parentDiv = parentDiv;
  this.chatContainer = $("<div id='chat-container'></div>");
  this.chatHeader = $("<div id='chat-header' class='chat-bar'></div>");
  this.chatHeader.append('online: ');
  this.usersOnline = $("<span id='chat-users-online'></span>");
  this.chatContent = $("<div id='chat-content'></div>");
  this.chatInput = $("<div id='chat-input' class='chat-bar'></div>");

  this.chatContainer.appendTo(this.parentDiv);
  this.chatHeader.appendTo(this.chatContainer);
  this.usersOnline.appendTo(this.chatHeader);
  this.chatContent.appendTo(this.chatContainer);
  this.chatInput.appendTo(this.chatContainer);

  this.chatContainer.draggable();
  this.chatContainer.resizable({
    alsoResize:"#chat-content",
    minHeight:150,
    minWidth:150
  });

  this.users = [];
  this.messageCounter = 0;
};

cloudezero.Chatbox.prototype.updateUsers = function (users) {
  this.users = users;
  var usersString = '';

  for (var i in users) {
    usersString += users[i];
    usersString += i == (users.length - 1) ? '' : ', ';
  }

  this.usersOnline.html(usersString);
};

cloudezero.Chatbox.prototype.addUserMessage = function (ts, nickname, message) {
  var newMessage = $("<span id='" + ++this.messageCounter + "'></span>");
  var tsStr = $("<span class='chat-message-ts'>[" + ts + "]</span>");
  var nickStr = $("<span class='chat-message-nick'> " + nickname + "</span>");
  var msgStr = $("<span class='chat-message-message'> &raquo; " + message + "</span>");

  tsStr.appendTo(newMessage);
  nickStr.appendTo(newMessage);
  msgStr.appendTo(newMessage);
  newMessage.appendTo(this.chatContent);
  $("<br>").appendTo(this.chatContent);
  newMessage.effect("highlight", {}, 1500);
};

cloudezero.Chatbox.prototype.addSystemMessage = function (message) {
  var newMessage = $("<span id='" + ++this.messageCounter + "'></span>");
  var msgStr = $("<span class='chat-message-sysmessage'>" + message + "</span>");

  msgStr.appendTo(newMessage);
  newMessage.appendTo(this.chatContent);
  $("<br>").appendTo(this.chatContent);
  newMessage.effect("highlight", {}, 1500);
};

cloudezero.Chatbox.prototype.hideChat = function () {
  this.chatContainer.hide(1000);
};

cloudezero.Chatbox.prototype.showChat = function () {
  this.chatContainer.show(1000);
};