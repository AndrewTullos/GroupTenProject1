var client_id = 'd51485137b604ba59fc715cd4eafea7e';
var client_secret = 'a82eb5eff50241d9880a5a4df3e61cea';

var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    var token = body.access_token;
  }
});
