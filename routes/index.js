exports.index = function (req, res) {
  res.render('index',{userId:req.session.id});
};
