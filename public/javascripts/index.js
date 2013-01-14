var postingSource = $('#posting-template').html();
var postingTemplate = Handlebars.compile(postingSource);

var mostRecentPostId = 0;
var latestPostId = 0;

$(document).ready(function () {
  $.get('/posting/getLatestPostings', function (docs) {
    for (var i = 0; i < docs.length; i++) {
      addNewPost(docs[i]);
    }
  });
});

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
      updatePost(postingId);
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

function showCommentInput(postingId) {
  $('#comment-input-' + postingId).show();
  var input = $('#comment-input-box-' + postingId);
  input[0].selectionStart = input[0].selectionEnd = input.val().length;
  $('#add-comment-' + postingId).hide();
}