var Code    = require('code');
var expect  = Code.expect;
var Lab     = require('lab');
var lab     = exports.lab = Lab.script();

var pardot = require('../lib/pardot');

lab.test('authenticate fails when userKey is not specified',  async () => {

  await pardot({
    email: 'test@gmail.com',
    password: 'easy'
  }).fail(function (err) {
    expect(err.toString()).to.contain('userKey must be specified');
  });

});

lab.test('authenticate fails when userKey is blank', async () => {

  pardot({
    userKey: '',
    email: 'test@gmail.com',
    password: 'easy'
  }).fail(function(err) {
    expect(err.toString()).to.contain('userKey must be specified');
  });

});

lab.test('authenticate fails when email is not specified', async () => {

  pardot({
    userKey: 'abc123',
    password: 'easy'
  }).fail(function (err) {
    expect(err.toString()).to.contain('email must be specified');
  });

});

lab.test('authenticate fails when email is blank', async () => {

  pardot({
    userKey: 'abc123',
    email: '',
    password: 'easy'
  }).fail(function(err) {
    expect(err.toString()).to.contain('email must be specified');
  });

});

lab.test('authenticate fails when password is not specified', async () => {

  pardot({
    userKey: 'abc123',
    email: 'test@gmail.com',
  }).fail(function (err) {
    expect(err.toString()).to.contain('password must be specified');
  });

});

lab.test('authenticate fails when password is not specified', async () => {

  pardot({
    userKey: 'abc123',
    email: 'test@gmail.com'
  }).fail(function (err) {
    expect(err.toString()).to.contain('password must be specified');
  });

});


lab.test('authenticate fails when password is blank', async () => {

  pardot({
    userKey: 'abc123',
    email: 'test@gmail.com',
    password: ''
  }).fail(function (err) {
    expect(err.toString()).to.contain('password must be specified');
  });

});

