var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var config = require('../../server/config')

var PassportOAuth = require("../../server/passport-oauth")
var GitHubStrategy = require("passport-github2")
var passport = require("passport")


describe('Passport OAuth configuration', function() {
    var sandbox = sinon.createSandbox();

    beforeEach(function() {
        // required for GitHubStrategy
        config.github.oauth.id = "test"
        config.github.oauth.secret = "test"

        sandbox.stub(passport, "use")
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should return passport instance', function() {
        expect(PassportOAuth(passport)).to.be.equal(passport)
    })

});