/*
 * methods for main index page... this can defintely be cleaned up
 *
 * @author brianstarke
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

// Handlebars templates
var templatesList = ['posting', 'user', 'user-modal', 'chat-message'];
var templatesMap = {};

// keep track of these so we can place posts before and after
// (infinite scroll on the bottom, new posts on top)
var mostRecentPostId = 0;
var latestPostId = 0;

// this holds the posting ids that have arrived after the initial load
var newPostings = [];

// are we in 'alert' state?
var newMessageAlert = document.getElementsByTagName("audio")[0];
var notifyIsOn = false;

var currentTitle = "#external festivus";
var currentUserNick = '';

// onload handler
$(document).ready(function () {
  // initialize templates map
  for (var i in templatesList) {
    var t = templatesList[i];
    templatesMap[t] = Handlebars.compile($('#' + t + '-template').html());
  }

  // fill in current user link in header bar
  // todo : there's probably a better way to do this, just send it to the page or something
  getCurrentUser(function (user) {
    $('#current_user').html(templatesMap['user']({userId:user._id, userName:user.nickname}));
    currentUserNick = user.nickname;
  });

  // start loading posts
  $.get('/posting/getLatestPostings', function (docs) {
    for (var i = 0; i < docs.length; i++) {
      addNewPost(docs[i]);
    }
  });

  // open socket for live updates
  var socket = io.connect();

  // set up socket handlers
  socket.on('updates', function (data) {
    // posting-updates channel sends posting ids to update
    if (data.channel === 'posting-updates') {
      updatePost(data.message);
    }

    // new-postings sends ids of new postings
    if (data.channel === 'new-postings') {
      updateNewPostings(data.message);
    }

    // new chat message
    if (data.channel === 'chat') {
      rcvMessage(JSON.parse(data.message), false);
    }
  });

  // initialize submit modal
  $('#submitInvite').click(function () {
    $.post('send_invite', {email:$('#emailAddressToInvite').val()}, function (data) {
      $('#inviteStatus').html(data);
    });
  });

  $.get('/chat/getMessages', function (docs) {
    for (var i = 0; i < docs.length; i++) {
      rcvMessage(docs[i], true);
    }
  });

  $('#chat-container').mouseover(function () {
    newMessageAck();
  });
});

// update the alert bar when new postings come in
function updateNewPostings(postingId) {
  newPostings.push(postingId);

  $('#num-new-postings').text(newPostings.length);
  currentTitle = ('#external festivus (' + newPostings.length + ')');
  document.title = currentTitle;
  var alertBar = $('#alert-bar');

  if (!alertBar.is(":visible")) {
    alertBar.show(1000, function () {
      // don't care.
    });

    $('#postings-container').css('margin-top', '48px');
  }
}

// add a new post to the top of the list
function addNewPost(post) {
  var newPost = templatesMap['posting']({
    id:post._id,
    posterName:post.nickname,
    posterId:post.userId,
    date:$.format.date(new Date(post.createdAt), 'MM/dd h:mma'),
    imageUrl:post.imageUrl,
    comments:post.comments
  });

  if (latestPostId === 0) {
    latestPostId = post._id;
  }

  var posting = "<div id='" + post._id + "' class='posting'>" + newPost + "</div>";

  mostRecentPostId === 0 ? $('#postings-container').html(posting) : $('#' + mostRecentPostId).before(posting);
  mostRecentPostId = post._id;
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

// update a post when a socket event tells us to
function updatePost(postingId) {
  $.get('/posting/getPosting/' + postingId, function (post) {
    var newPost = templatesMap['posting']({
      id:post._id,
      posterName:post.nickname,
      posterId:post.userId,
      date:$.format.date(new Date(post.createdAt), 'MM/dd h:mma'),
      imageUrl:post.imageUrl,
      comments:post.comments
    });

    $('#' + postingId).html(newPost);
  });
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
    var modalContent = templatesMap['user-modal']({
      name:user.nickname,
      email:user.email,
      downvotes:user.downvotes,
      upvotes:user.upvotes,
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

function rcvMessage(message, isInitial) {
  var newMessage = templatesMap['chat-message']({
    nickname:message.nickname,
    message:message.message
  });

  var chatContainer = $('#chat-container');

  chatContainer.append(EmoticonParser.parse(newMessage));
  chatContainer.scrollTop(chatContainer[0].scrollHeight + 20);
  if (!isInitial && message.nickname != currentUserNick) {
    newMessageNotify(message.nickname);
  }
}

// send message
function addMessage(inputBox, event) {
  if (event.which == 13) {
    $.post('/chat/addMessage', {message:inputBox.value}, function () {
      inputBox.value = '';
    });
  }
  else {
    return true;
  }
}

var titleTimer;

function newMessageNotify(nickname) {
  newMessageAlert.play();
  notifyIsOn = true;

  clearInterval(titleTimer);
  titleTimer = setInterval(function () {
    if (document.title === currentTitle) {
      document.title = nickname + ' said something';
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

