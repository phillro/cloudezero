/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

exports.index = function (req, res) {
  res.render('index', {userId:req.session.id, layout:false});
};
