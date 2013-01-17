var postingSource = $('#posting-template').html();
var postingTemplate = Handlebars.compile(postingSource);

var mostRecentPostId = 0;
var latestPostId = 0;

// this holds the posting ids that have arrived after the initial load
var newPostings = [];

$(document).ready(function () {
  $.get('/posting/getLatestPostings', function (docs) {
    for (var i = 0; i < docs.length; i++) {
      addNewPost(docs[i]);
    }
  });

  // open socket for live updates
  var socket = io.connect();

  socket.on('updates', function (data) {
    // posting-updates channel sends posting ids to update
    if (data.channel === 'posting-updates') {
      updatePost(data.message);
    }

    // new-postings sends ids of new postings
    if (data.channel === 'new-postings') {
      updateNewPostings(data.message);
    }
  });
});

function updateNewPostings(postingId) {
  newPostings.push(postingId);

  $('#num-new-postings').innerHTML(newPostings.length);
  var alertBar = $('#alert-bar');

  if (!alertBar.is(":visible")) {
    alertBar.show(1000, function () {
      // don't care.
    });
  }
}

function addNewPost(post) {
  var newPost = postingTemplate({
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

function updatePost(postingId) {
  $.get('/posting/getPosting/' + postingId, function (post) {
    var newPost = postingTemplate({
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

// TODO: make this a jq toggle
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

function showUser(userId) {
  getUser(userId, function (user) {
    var modalContent = userModalTemplate({
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

function showImage(imageUrl) {
  window.open(imageUrl, '_blank');
}

getCurrentUser(function (user) {
  $('#current_user').html(userTemplate({userId:user._id, userName:user.nickname}));
});

$('#submitInvite').click(function () {
  $.post('send_invite', {email:$('#emailAddressToInvite').val()}, function (data) {
    $('#inviteStatus').html(data);
  });
});