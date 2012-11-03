function getCurrentUser(callback) {
  $.get('user/current', function (data) {
    callback(data);
  });
}

function getUser(userId, callback) {
  $.get('user/get/' + userId, function (data) {
    callback(data);
  });
}