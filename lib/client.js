var request       = require('request');
var util          = require('util');
var Q             = require('q');
var errors        = require('./errors');
var Hoek          = require('hoek');


var ROOT_API_URL  = "https://pi.pardot.com/api";


function Client(options) {
  options.format = 'json';
  this.options = options;
}

Client.prototype.execute = function(path, params) {
  var self = this;

  params = params || {};

  params.format   = 'json';
  params.host = params.host || ROOT_API_URL
  params.access_token = self.accessToken
  params.business_unit_id = self.options.businessUnitId
  
  // Set the authentication credentials for every request
  var headers = {
    'Authorization': self.accessToken ? 'Bearer ' + self.accessToken : undefined,
    'Pardot-Business-Unit-Id': self.options.businessUnitId
  }
  var isValidAuthRequest = !!params.username && !!params.password && !!params.grant_type && !!params.client_id && !!params.client_secret
  var isAuthenticatedRequest = headers['Authorization'] && headers['Pardot-Business-Unit-Id']

  // Check that we have an access_token set if this is not a login attempt.
  Hoek.assert(isAuthenticatedRequest || isValidAuthRequest, 'Client must be authenticated');

  return Q.promise(function(resolve, reject) {

    var apiPath = util.format('%s%s', params.host, path);

    self.log('Sending request to ' + apiPath);
    self.log(params);

    request.post(
      apiPath,
      {
        form: params,
        headers: headers,
      },
      function(err, response, body) {
        if(err) {
          self.log(err);
          return reject(err);
        }

        var payload = body ? JSON.parse(body) : null;

        // Delete methods don't return any content
        if(payload) {
          self.log("Received Response");
          self.log(payload);
          
          var isBadAuthenticationResponse = !payload.access_token
          var isBadPardotResponse = !!payload['@attributes'] && payload['@attributes'].stat !== 'ok' 

          if(isBadAuthenticationResponse && isBadPardotResponse) {
            return reject(errors.byCode[payload['@attributes'].err_code]);
          }

          return resolve(payload);
        }

        return resolve(true);
      }
    );
  });
};


Client.prototype.log = function(message) {
  if(this.options.debug) {
    console.log(message);
  }
};

module.exports = Client;
