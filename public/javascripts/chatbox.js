// namespace
var cloudezero = {};

cloudezero.Chatbox = function (parentDiv, messageCallback) {
  this.parentDiv = parentDiv;
  this.chatContainer = $("<div id='chat-container'></div>");
  this.chatHeader = $("<div id='chat-header' class='chat-bar'></div>");
  this.chatHeader.append("<i class='icon-group'></i> ");
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
      var message = this.value.replace(/(\r\n|\n|\r)/gm, "");
      this.value = '';
      if (cloudezero.CommandParser.isCommand(message)) {
        var msg = cloudezero.CommandParser.parseCommand(message);
        chatbox.addCommandMessage(msg);
      } else {
        messageCallback(message);
      }
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
  var msgStr = $("<span class='chat-message-message'> <i class='icon-double-angle-right'> " + linkify(cloudezero.EmoticonParser.parse(message)) + "</span>");

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

cloudezero.Chatbox.prototype.addCommandMessage = function (message) {
  var newMessage = $("<span id='" + ++this.messageCounter + "'></span>");
  var msgStr = $("<span class='chat-message-sysmessage'><em>" + message + "</em></span>");

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

cloudezero.EmoticonParser = {
  emoticonMap:{
    bear:'bear.gif',
    beer:'beer.gif',
    flex:'flex.gif',
    n:'no.gif',
    party:'party.gif',
    penis:'penis.gif',
    poolparty:'poolparty.gif',
    rock:'rock.gif',
    y:'yes.gif'
  },

  parse:function (text) {
    while (this.getEmoticonTag(text)) {
      var a = this.getEmoticonTag(text);

      text = text.substring(0, a.s) + "<img src='/images/emoticons/" + a.tag + "'/>" + a.e;
    }

    return text;
  },

  getEmoticonTag:function (text) {
    var startIdx = text.indexOf('(');
    var endIdx = text.indexOf(')', startIdx);
    var tag = text.substring(startIdx + 1, endIdx);

    if (startIdx === -1 || this.emoticonMap[tag] === undefined) {
      return false;
    } else {
      return {tag:this.emoticonMap[tag], s:startIdx, e:text.substring(endIdx + 1)};
    }
  }
};

cloudezero.CommandParser = {
  commandsMap:{
    help:function () {
      var commandsStr = '';
      var keys = Object.keys(this);

      for (var i in keys) {
        commandsStr += "- ";
        commandsStr += keys[i];
        commandsStr += "<br>";
      }

      return 'Available commands :<br>' + commandsStr;
    },
    emoticons:function () {
      var emoticonsStr = '';
      var keys = Object.keys(cloudezero.EmoticonParser.emoticonMap);

      for (var i in keys) {
        emoticonsStr += keys[i] + " : ";
        emoticonsStr += "<img src='/images/emoticons/" + cloudezero.EmoticonParser.emoticonMap[keys[i]] + "'/>";
        emoticonsStr += "<br>";
      }

      return emoticonsStr;
    },
    boobs:function () {
      window.location = "http://www.youporn.com/search/?query=boobs";
    },
    steak:function () {
      window.location = "http://www.exponent.com/files/Uploads/Images/epidemiology/meat.jpg";
    }
  },

  isCommand:function (text) {
    return text.indexOf('/') === 0;
  },

  parseCommand:function (text) {
    var command = text.substr(1, text.length);
    if (this.commandsMap[command]) {
      return this.commandsMap[command]();
    } else {
      return 'unknown command "' + command + '"<br>' + this.commandsMap.help();
    }
  }
};

function linkify(inputText) {
  var replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

  //Change email addresses to mailto:: links.
  replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
  replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

  return replacedText;
}