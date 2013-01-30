/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

exports.index = function (req, res) {
  res.render('index', {
    userId:req.session.user_id,
    userNickname:req.session.user_nickname,
    layout:false});
};
