/*
 * methods for main index page... this should definitely be cleaned up
 * (maybe switch to closure?)
 *
 * @author brianstarke
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var currentTitle = "#external festivus";

// are we in 'alert' state?
var notifyIsOn = false;

// alertBar and it's handler.  newPostings array holds the posting ids that
// have arrived after the initial load
var alertBar = new AlertBar('alert-bar', showNewAlerts);
var newPostings = [];

// wire up postings and chatbox components
var postings;
var chatbox;

// onload handler
$(document).ready(function () {
  // fill in current user link in header bar
  // todo : there's probably a better way to do this, just send it to the page or something
  getCurrentUser(function (user) {
    $('#current_user').html(Handlebars.templates.user({userId:user._id, userName:user.nickname}));
  });

  postings = new cloudezero.Postings($('#postings-container'));

  // start loading posts
  $.get('/posting/getLatestPostings', function (docs) {
    for (var i = 0; i < docs.length; i++) {
      postings.addNewPosting(docs[i]);
    }
  });

  // open socket for live updates
  var socket = io.connect();

  socket.emit('user_connect', USER_NICKNAME);

  // set up socket handlers
  socket.on('updates', function (data) {
    // posting-updates channel sends posting ids to update
    if (data.channel === 'posting-updates') {
      postings.updatePosting(data.message);
    }

    // new-postings sends ids of new postings
    if (data.channel === 'new-postings') {
      updateNewPostings(data.message);
    }

    // new chat message
    if (data.channel === 'chat') {
      receiveChatMessage(JSON.parse(data.message), false);
    }

    // new system message
    if (data.channel === 'system-messages') {
      chatbox.addSystemMessage(data.message);
    }
  });

  // initialize submit modal
  $('#submitInvite').click(function () {
    $.post('send_invite', {email:$('#emailAddressToInvite').val()}, function (data) {
      $('#inviteStatus').html(data);
    });
  });

  chatbox = new cloudezero.Chatbox($('#header-wrap'), function (message) {
    $.post('/chat/addMessage', {message:message});
  });

  socket.on('current_users', function (data) {
    chatbox.updateUsers(data);
  });

  $('#chat-container').mouseover(function () {
    newMessageAck();
  });

  $.get('/chat/getMessages', function (docs) {
    for (var i = 0; i < docs.length; i++) {
      receiveChatMessage(docs[i], true);
    }
  });
});


// update the alert bar when new postings come in
function updateNewPostings(postingId) {
  newPostings.push(postingId);
  alertBar.increment();

  currentTitle = ('#external festivus (' + newPostings.length + ')');
  document.title = currentTitle;
}

// add a comment to a post
function addComment(postingId, inputBox, event) {
  if (event.which == 13) {
    $.post('/posting/addComment', {postingId:postingId, text:inputBox.value}, function () {
      hideCommentInput(postingId);
    });
  }
  else {
    return true;
  }
}

// TODO: make these 2 a jq toggle
function showCommentInput(postingId) {
  $('#comment-input-' + postingId).show();
  var input = $('#comment-input-box-' + postingId);
  input[0].selectionStart = input[0].selectionEnd = input.val().length;
  $('#add-comment-' + postingId).hide();
}

function hideCommentInput(postingId) {
  $('#comment-input-' + postingId).hide();
  $('#add-comment-' + postingId).show();
}

// show the user modal
function showUser(userId) {
  getUser(userId, function (user) {
    var modalContent = Handlebars.templates.usermodal({
      name:user.nickname,
      email:user.email,
      posts:user.posts,
      reposts:user.reposts,
      inviter:(user.can_invite ? "CAN INVITE" : "")
    });
    $('#usermodal_content').html(modalContent);
    $('#userModal').reveal();
  });
}

// open image in new tab, fullscreen
function showImage(imageUrl) {
  window.open(imageUrl, '_blank');
}

// gets the current users data
function getCurrentUser(callback) {
  $.get('user/current', function (data) {
    callback(data);
  });
}

// gets data by user id
function getUser(userId, callback) {
  $.get('user/get/' + userId, function (data) {
    callback(data);
  });
}

function receiveChatMessage(message, isInitial) {
  var ts = $.format.date(new Date(message.createdAt), 'h:mma')
  chatbox.addUserMessage(ts, message.nickname, message.message);

  if (!isInitial && message.nickname != USER_NICKNAME) {
    newMessageNotify(message.nickname);
  }
}

var titleTimer;

function newMessageNotify(nickname) {
  notifyIsOn = true;

  clearInterval(titleTimer);
  titleTimer = setInterval(function () {
    if (document.title === currentTitle) {
      document.title = nickname + ' said stuff';
    } else {
      document.title = currentTitle;
    }
  }, 2000);
}

function newMessageAck() {
  if (notifyIsOn) {
    notifyIsOn = false;
    clearInterval(titleTimer);
    document.title = currentTitle;
  }
}

function showNewAlerts() {
  for (var i = 0; i < newPostings.length; i++) {
    $.get('/posting/getPosting/' + newPostings[i], function (post) {
      postings.addNewPosting(post);
    });
  }
  newPostings = [];
  currentTitle = '#external festivus';
  document.title = currentTitle;
}