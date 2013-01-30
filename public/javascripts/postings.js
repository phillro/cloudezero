cloudezero.Postings = function (parentElem) {
  this.parentElem = parentElem;

  this.firstPostId = 0;
  this.lastPostId = 0;

  this.addNewPosting = function (p) {
    if (this.lastPostId === 0) {
      this.lastPostId = p._id;
    }

    var post = "<div id='" + p._id + "' class='posting'>" + buildPosting(p) + "</div>";

    // prepend the post to the current stack
    this.firstPostId === 0 ? this.parentElem.html(post) : $('#' + this.firstPostId).before(post);
    this.firstPostId = p._id;
  };

  this.updatePosting = function (id) {
    $.get('/posting/getPosting/' + id, function (p) {
      $('#' + id).html(buildPosting(p));
    });
  };

  this.registerPostingVote = function (id, vote) {
    $.post('/posting/registerVote', {id:id, vote:vote});
  };
};

// static method to build a posting
function buildPosting(p) {
  var isUpvoter = (p.upvoters.indexOf(USER_ID) > -1);
  var isDownvoter = (p.downvoters.indexOf(USER_ID) > -1);
  var isNovoter = (!isDownvoter && !isUpvoter);

  var stars = '';

  for (var i=0; i < p.rating; ++i) {
    stars += ('<i class="icon-star"></i>');
  }

  return Handlebars.templates.posting({
    id:p._id,
    posterName:p.nickname,
    posterId:p.userId,
    date:$.format.date(new Date(p.createdAt), 'MM/dd h:mma'),
    imageUrl:p.imageUrl,
    comments:p.comments,
    rating:new Handlebars.SafeString(stars),
    isUpvoter:isUpvoter,
    isDownvoter:isDownvoter,
    isNovoter:isNovoter
  });
}


