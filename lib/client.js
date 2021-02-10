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
  params.access_token = self.accessToken
  params.business_unit_id = self.options.businessUnitId
  
  // Set the credentials for every request
  var headers = {
    'Authorization': self.accessToken ? 'Bearer ' + self.accessToken : undefined,
    'Pardot-Business-Unit-Id': self.options.businessUnitId
  }

  var hasAuthHeaders = !!headers['Authorization'] && !!headers['Pardot-Business-Unit-Id']

  // Check that we have an access_token set if this is not a login attempt.
  Hoek.assert(hasAuthHeaders, 'Client must be authenticated');

  return Q.promise(function(resolve, reject) {

    var apiPath = util.format('%s%s', ROOT_API_URL, path);

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
          
          if(payload['@attributes'] && payload['@attributes'].stat !== 'ok' ) {
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

// This has been separated from execute since the new salesforce oauth endpoint responds differently than pardot's.
// More code, but this enforces better separation of concerns.
Client.prototype.authenticate = function(path, params, host) {
  var self = this;

  params = params || {};
  
  var isValidAuthRequest = !!params.username && !!params.password && !!params.grant_type && !!params.client_id && !!params.client_secret

  Hoek.assert(isValidAuthRequest, 'Invalid authentication request');

  return Q.promise(function(resolve, reject) {

    var apiPath = util.format('%s%s', host, path);

    self.log('Sending request to ' + apiPath);
    self.log(params);

    request.post(
      apiPath,
      {
        form: params,
      },
      function(err, response, body) {
        if(err) {
          self.log(err);
          return reject(err);
        }

        var payload = body ? JSON.parse(body) : null;

        if(payload) {
          self.log("Received Response");
          self.log(payload);

          if(payload.error) {
            return reject(payload.error_description);
          }

          return resolve(payload);
        }

        return resolve(true);
      }
    );
  });
}

module.exports = Client;
