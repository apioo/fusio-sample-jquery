
$(document).ready(function(){
  var token = getToken();
  if (token) {
    $('#logout').removeAttr('disabled');
    requestProtectedPayload(token);
  }
});

$('#auth').on('submit', function(){
  requestToken($('#username').val(), $('#password').val(), requestProtectedPayload);
  return false;
});

$('#logout').on('click', function(){
  localStorage.removeItem('token');
  location.reload();
});

function requestToken(username, password, callback){
  $.ajax({
    type: 'POST',
    url: fusio_url + 'consumer/login',
    data: JSON.stringify({username: username, password: password, scopes: ['authorization']}),
    contentType: 'application/json',
    success: function(data){
      storeToken(data);
      callback(data.token);
    },
    error: handleError
  });
}

function requestProtectedPayload(token){
  $.ajax({
    type: 'GET',
    url: fusio_url + 'authorization/whoami',
    beforeSend: function(xhr){
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    },
    success: function(data){
      $('#response')
        .removeClass('alert-info')
        .removeClass('alert-danger')
        .addClass('alert-success')
        .html(JSON.stringify(data, null, 2));
    },
    error: handleError
  });
}

function storeToken(data){
  $('#logout').removeAttr('disabled');
  $('#username').val('');
  $('#password').val('');
  localStorage.setItem('token', JSON.stringify(data));
}

function getToken(){
  var token = localStorage.getItem('token');
  if (token) {
    var data = JSON.parse(token);
    return data.token;
  }
  return null;
}

function handleError(xhr){
  var data = xhr.responseJSON;
  var message;
  if (data && data.message) {
    message = data.message;
  } else {
    message = 'An unknown error occurred';
  }
  $('#response')
    .removeClass('alert-info')
    .removeClass('alert-success')
    .addClass('alert-danger')
    .html(message);
}
