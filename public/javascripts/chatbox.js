// namespace
var cloudezero = {};

cloudezero.Chatbox = function (parentDiv, messageCallback) {
  this.parentDiv = parentDiv;
  this.chatContainer = $("<div id='chat-container'></div>");
  this.chatHeader = $("<div id='chat-header' class='chat-bar'></div>");
  this.chatHeader.append('online: ');
  this.usersOnline = $("<span id='chat-users-online'></span>");
  this.chatCloseButton = $("<i id='chat-close-button' class='icon-remove-sign'></i>");
  this.chatContent = $("<div id='chat-content'></div>");
  this.chatInput = $("<textarea id='chat-input'>");

  this.chatContainer.appendTo(this.parentDiv);
  this.chatHeader.appendTo(this.chatContainer);
  this.usersOnline.appendTo(this.chatHeader);
  this.chatCloseButton.appendTo(this.chatHeader);
  this.chatContent.appendTo(this.chatContainer);
  this.chatInput.appendTo(this.chatContainer);
  this.chatInput.keypress(function (event) {
    // 13 is enter key
    if (event.charCode == 13) {
      var message = this.value;
      this.value = '';
      messageCallback(message);
    }
  });

  this.chatCloseButton.click(function () {
    $('#chat-container').hide(1000);
  });

  this.chatContainer.draggable();
  this.chatContainer.resizable({
    alsoResize:"#chat-content",
    minHeight:150,
    minWidth:300
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
  var msgStr = $("<span class='chat-message-message'> <i class='icon-double-angle-right'> " + message + "</span>");

  tsStr.appendTo(newMessage);
  nickStr.appendTo(newMessage);
  msgStr.appendTo(newMessage);
  newMessage.appendTo(this.chatContent);
  $("<br>").appendTo(this.chatContent);
  this.afterMessageAdd(newMessage);
};

cloudezero.Chatbox.prototype.addSystemMessage = function (message) {
  var newMessage = $("<span id='" + ++this.messageCounter + "'></span>");
  var msgStr = $("<span class='chat-message-sysmessage'><i class='icon-circle-blank'> " + message + "</span>");

  msgStr.appendTo(newMessage);
  newMessage.appendTo(this.chatContent);
  $("<br>").appendTo(this.chatContent);
  this.afterMessageAdd(newMessage);
};

cloudezero.Chatbox.prototype.afterMessageAdd = function (message) {
  message.effect("highlight", {color:'#E2D6F7'}, 2500);
  window.setTimeout(function () {
    var chatContent = $('#chat-content');
    chatContent.scrollTop(chatContent[0].scrollHeight);
  }, 500);
};

cloudezero.Chatbox.prototype.hideChat = function () {
  this.chatContainer.hide(1000);
};

cloudezero.Chatbox.prototype.showChat = function () {
  this.chatContainer.show(1000);
};