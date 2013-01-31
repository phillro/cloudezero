cloudezero.Navbar = function (parentElem) {
  this.parentElem = parentElem;
  this.parentElem.html(Handlebars.templates.navbar());

  this.changeView = function (newView) {
    $('#menu-dropdown').hide();
    var currentView = $('#navbar-view-current-view');

    switch (newView) {
      case 'view-best':
        currentView.html('best');
        break;
      case 'view-worst':
        currentView.html('worst');
        break;
      case 'view-recent':
        currentView.html('most recent');
        break;
    }
  };
};