function AlertBar(divId, callback) {
  this.divId = divId;
  this.callback = callback;

  this.initialize = function () {
    $('#' + this.divId).hide().html(
        "<div id='alert-bar-alert'>" +
            "<i class='icon-info-sign'></i> <span id='num-new-postings'></span> new images..." +
            "</div>");
    this.numUpdates = 0;
  };

  this.increment = function () {
    if (!$('#' + this.divId).is(":visible")) {
      this.showAlertBar();
    }
    var numPostings = $('#num-new-postings');
    numPostings.html(++this.numUpdates);
    numPostings.effect("highlight", {color:'#E2D6F7'}, 2500);
  };

  this.showAlertBar = function () {
    this.initialize();
    var divId = this.divId;
    var callback = this.callback;

    $('#' + this.divId).show(1000).click(function () {
      $('#' + divId).hide(1000);
      callback();
    });
  };
}