var Q       = require('q');

var AUTH_ROOT_API_URL  = "https://login.salesforce.com";

module.exports = function(client) {

  return {
    authenticate: function() {
      return client.execute('/services/oauth2/token', {
        host: AUTH_ROOT_API_URL,
        username: client.options.username,
        password: client.options.password,
        client_id:  client.options.clientId,
        client_secret: client.options.clientSecret,
        grant_type: client.options.grantType || 'password',
      }).then(function(results) {        
        // Set the accessToken directly on the client for all
        // future calls
        client.accessToken = results.access_token;

        return Q.fcall(function() { return results; });
      });
    }
  };
};
