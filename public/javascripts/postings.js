cloudezero.Postings = function (parentElem) {
  this.parentElem = parentElem;

  this.numPostingsPerRequest = 10;
  this.earliestPostTs = Date.now();
  this.topPostId = 0;
  this.unseenPostings = [];

  this.addNewPosting = function (p, isOnTop) {
    if (this.topPostId == 0) {
      this.topPostId = p._id;
    }

    var post = "<div id='" + p._id + "' class='posting'>" + buildPosting(p) + "</div>";

    if (isOnTop) {
      // append the post to the current stack
      $('#' + this.topPostId).before(post);
      this.topPostId = p._id;
    } else {
      // prepend the post to the current stack
      $('#more-postings').before(post);
      this.earliestPostTs = p.createdAt;
    }
    $('#' + p._id).effect("highlight", {color:'#E2D6F7'}, 2500);
  };

  this.updatePosting = function (id) {
    $.get('/posting/getPosting/' + id, function (p) {
      $('#' + id).html(buildPosting(p));
    });
  };

  this.showUnseenPostings = function () {
    for (var i in this.unseenPostings) {
      $.get('/posting/getPosting/' + this.unseenPostings[i], function (p) {
        postings.addNewPosting(p, true);
      });
    }
    this.unseenPostings = [];
  };

  this.addNewUnseenPosting = function (id) {
    this.unseenPostings.push(id);
  };

  this.registerPostingVote = function (id, vote) {
    $.post('/posting/registerVote', {id:id, vote:vote});
  };

  this.insertGetMoreDiv = function () {
    this.parentElem.append(Handlebars.templates.morepostings());
  };

  this.loadMorePostings = function () {
    var url = '/posting/getPostings/' + this.numPostingsPerRequest + '/' + this.earliestPostTs;

    $.get(url, function (posts) {
      for (var i in posts) {
        postings.addNewPosting(posts[i], false);
      }
    });
  };
};

// static method to build a posting
function buildPosting(p) {
  var isUpvoter = (p.upvoters.indexOf(USER_ID) > -1);
  var isDownvoter = (p.downvoters.indexOf(USER_ID) > -1);
  var isNovoter = (!isDownvoter && !isUpvoter);

  var rating = '';

  if (p.rating >= 0) {
    for (var i = 0; i < p.rating; ++i) {
      rating += ('<i class="icon-star upvote"></i>');
    }
  } else {
    for (var i = 0; i > p.rating; --i) {
      rating += ('<i class="icon-ban-circle downvote"></i>');
    }
  }

  return Handlebars.templates.posting({
    id:p._id,
    posterName:p.nickname,
    posterId:p.userId,
    date:$.format.date(new Date(p.createdAt), 'MM/dd h:mma'),
    imageUrl:p.imageUrl,
    comments:p.comments,
    rating:new Handlebars.SafeString(rating),
    isUpvoter:isUpvoter,
    isDownvoter:isDownvoter,
    isNovoter:isNovoter
  });
}


