var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var config = require('../../server/config')
var jwt = require('jsonwebtoken');
var fs = require('fs');

var GithubServiceApi = require("../../server/github-service-api")
var GithubApp = require("../../server/github-tokens")

describe('Github Apps', function() {
    var uut;

    var sandbox = sinon.createSandbox();
    var token = "tokentestcontent"

    beforeEach(function() {
        // mock private key
        sandbox.stub(fs, "readFileSync")

        // mock jwt signing
        sandbox.stub(jwt, "sign")
        
        uut = GithubApp()
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should comply to public api', function() {
        expect(uut.jwtTokenFactory).to.be.not.undefined
        expect(uut.createBearer).to.be.not.undefined
        expect(uut.getOAuthResources).to.be.not.undefined
    })

    describe('JWT signature token', function() {
        it('should set issuer with appid', function(complete) {
            jwt.sign.callsFake(function(payload, cert, settings) {
                expect(payload.iss).to.be.not.undefined
                expect(payload.iss).to.be.equal(config.github.appId)
                complete();
            })
            
            uut.jwtTokenFactory.create()
        })

        it('should use jwt sign algorithm RS256', function(complete) {
            jwt.sign.callsFake(function(payload, cert, settings) {
                expect(settings.algorithm).to.be.equal("RS256")
                complete();
            })
            
            uut.jwtTokenFactory.create()
        })

        it('should return unmodified jwt token', function() {
            jwt.sign.returns("testtoken")

            expect(uut.jwtTokenFactory.create()).to.be.equal("testtoken")
        })
    })

    describe('Bearer Tokens', function() {
        var token = "testtoken"

        it('should return token on success', function(complete) {
            sandbox.stub(GithubServiceApi, "requestAccessTokens").callsFake((id, jwt, fn) => {
                fn(token)
            })

            uut.createBearer(0, function(bearer, err) {
                expect(bearer.token).to.be.equal(token)
                expect(err).to.be.null
                complete()
            })
        })
        
        it('should return Bearer headers on success', function(complete) {
            sandbox.stub(GithubServiceApi, "requestAccessTokens").callsFake((id, jwt, fn) => {
                fn(token)
            })

            uut.createBearer(0, function(bearer, err) {
                expect(bearer.headers).to.be.not.undefined
                expect(err).to.be.null
                complete()
            })
        })
        
        it('should return error on failure', function(complete) {
            sandbox.stub(GithubServiceApi, "requestAccessTokens").callsFake((id, jwt, fn) => {
                fn(null, {body: {message: "error message"}})
            })

            uut.createBearer(0, function(bearer, err) {
                expect(err).to.be.not.undefined
                complete()
            })
        })
    })

    describe('OAuth', function() {
        var mockInstallations

        beforeEach(function() {
            mockInstallations = [
                {
                    id: 1337,
                    account: {
                        login: "orgname",
                        type: "type",
                        avatar_url: "avatar"
                    }
                }
            ]

            sandbox.stub(GithubServiceApi, "requestInstallations").callsFake((accessToken, fn) => {
                fn(mockInstallations)
            })
        })

        it('should retrieve user organizations', function(complete) {
            uut.getOAuthResources(token, function(resources) {
                expect(resources.installations).to.be.not.undefined
                expect(resources.orgs).to.be.an('array')
                expect(resources.orgs).to.deep.include({
                    login: "orgname",
                    type: "type",
                    avatar: "avatar"
                })

                expect(resources.installations["orgname"]).to.be.not.undefined
                complete()
            })
        })
    })
});