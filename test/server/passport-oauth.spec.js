var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var config = require('../../server/config')

var GitHubStrategy = require("passport-github2")
var passport = require("passport")

var uut = require("../../server/passport-oauth")

describe('Passport OAuth configuration', function() {
    var sandbox = sinon.createSandbox();
    var mockSettings

    beforeEach(function() {
        // required for GitHubStrategy
        mockSettings = {
            oauth: {
                id: "oauthId",
                secret: "meow!"
            }
        }
        
        sandbox.stub(config, "getGithubSettings").returns(mockSettings)
        
        sandbox.stub(passport, "use")
        sandbox.stub(passport, "serializeUser")
        sandbox.stub(passport, "deserializeUser")
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should configure passport instance', function() {
        uut.configureOAuth(passport)

        sinon.assert.calledOnce(passport.use)
        sinon.assert.calledOnce(passport.serializeUser)
        sinon.assert.calledOnce(passport.deserializeUser)
    })

    it('should deserialize users correctly', (complete) => {
        var testUser = { test: "test" }

        uut._serializeUser(testUser, (none, serializedUser) => {
            uut._deserializeUser(serializedUser, (none, deserializedUser) => {
                expect(serializedUser).to.be.deep.equal(testUser)
                complete()
            })
        })
    })

    it('should construct oauth user resources', (complete) => {
        var mockProfile = {
            displayName: "displayName",
            username: "waldo",
            photos: "pics or didn't happen"
        }

        var mockResources = {
            orgs: ["A"],
            installations: ["B"]
        }

        var that = {
            githubTokens: {
                getOAuthResources: sinon.stub()
            }
        }

        
        uut._oauthResources.apply(that, ["", "", mockProfile, (none, user) => {
            expect(user.displayName).to.be.equal(mockProfile.displayName)
            expect(user.username).to.be.equal(mockProfile.username)
            expect(user.photos).to.be.equal(mockProfile.photos)

            expect(user.orgs).to.be.equal(mockResources.orgs)
            expect(user.installations).to.be.equal(mockResources.installations)
            complete()
        }])

        that.githubTokens.getOAuthResources.callArgWith(1, mockResources)
    })

});