var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var config = require('../../server/config')
var unirest = require('unirest')
var jwt = require('jsonwebtoken');
var fs = require('fs');

var GithubApp = require("../../server/github-app")

describe('Github Apps', function() {
    var uut;

    var sandbox = sinon.createSandbox();
    var token = "tokentestcontent"
    var unirestMock, mockResponse

    beforeEach(function() {
        mockResponse = {
            ok: true,
            body: {
                token: token
            }
        }
        
        unirestMock = {
            headers: sinon.stub().returns(unirestMock),
            end: function(cb) {
                cb(mockResponse)
            }
        }

        // mock private key
        sandbox.stub(fs, "readFileSync")

        // mock jwt signing
        sandbox.stub(jwt, "sign")

        sandbox.stub(unirest, "post").returns(unirestMock);
        sandbox.stub(unirest, "get").returns(unirestMock)
        
        uut = GithubApp()
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should comply to public api', function() {
        expect(uut.createJWT).to.be.not.undefined
        expect(uut.createBearer).to.be.not.undefined
        expect(uut.getTokenHeaders).to.be.not.undefined
        expect(uut.getOAuthResources).to.be.not.undefined
    })

    describe('HTTP Headers', function() {
        it('should construct token contents', function() {
            var result = uut.getTokenHeaders(token)
            
            expect(result['User-Agent']).to.be.equal(config.application.name)
            expect(result['Authorization']).to.be.equal('token ' + token)
        })
        
        it('should use GitHub Apps HTTP Accept mime-type', function() {
            var result = uut.getTokenHeaders(token)
            
            expect(result['Accept']).to.be.equal('application/vnd.github.machine-man-preview+json')
        })
    })

    describe('JWT signature', function() {
        it('should set issuer with appid', function(complete) {
            jwt.sign.callsFake(function(payload, cert, settings) {
                expect(payload.iss).to.be.not.undefined
                expect(payload.iss).to.be.equal(config.github.appId)
                complete();
            })
            
            uut.createJWT()
        })

        it('should use jwt sign algorithm RS256', function(complete) {
            jwt.sign.callsFake(function(payload, cert, settings) {
                expect(settings.algorithm).to.be.equal("RS256")
                complete();
            })
            
            uut.createJWT()
        })

        it('should return unmodified jwt token', function() {
            jwt.sign.returns("testtoken")

            expect(uut.createJWT()).to.be.equal("testtoken")
        })
    })

    describe('Bearer Tokens', function() {

        it('should return token on success', function(complete) {
            uut.createBearer(0, function(bearer, err) {
                expect(bearer.token).to.be.equal(token)
                expect(err).to.be.null
                complete()
            })
        })
        
        it('should return Bearer headers on success', function(complete) {
            uut.createBearer(0, function(bearer, err) {
                expect(bearer.headers).to.be.not.undefined
                expect(err).to.be.null
                complete()
            })
        })
        
        it('should return error on failure', function(complete) {
            mockResponse.ok = false

            uut.createBearer(0, function(bearer, err) {
                expect(bearer).to.be.null
                expect(err).to.be.not.undefined
                complete()
            })
        })
    })

    describe('OAuth', function() {
        beforeEach(function() {
            mockResponse = {
                ok: true,
                body: {
                    installations: [
                        {
                            id: 1337,
                            account: {
                                login: "orgname",
                                type: "type",
                                avatar_url: "avatar"
                            }
                        }
                    ]
                }
            }
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