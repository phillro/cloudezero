cloudezero.Navbar = function (parentElem) {
  this.parentElem = parentElem;

  this.parentElem.html(Handlebars.templates.navbar());
};