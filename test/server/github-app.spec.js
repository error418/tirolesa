var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var config = require('../../server/config')
var unirest = require('unirest')

var uut = require("../../server/github-app")()

describe('Github Apps', function() {
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

        sandbox.stub(unirest, "post").returns(unirestMock);
        sandbox.stub(unirest, "get").returns(unirestMock)
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should comply to public api', function() {
        expect(uut.createJWT).to.be.defined
        expect(uut.createBearer).to.be.defined
        expect(uut.getTokenHeaders).to.be.defined
        expect(uut.getOAuthResources).to.be.defined
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
                expect(err).to.be.defined
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
                        account: {
                            login: "orgname",
                            type: "type",
                            avatar_url: "avatar"
                        }
                    }
                ]}
            }
        })

        it('should retrieve user organizations', function(complete) {
            uut.getOAuthResources(token, function(resources) {
                expect(resources.installations).to.be.defined
                expect(resources.orgs).to.be.an('array')
                expect(resources.orgs).to.deep.include({
                    login: "orgname",
                    type: "type",
                    avatar: "avatar"
                })
                expect(resources.installations["orgname"]).to.be.defined
                complete()
            })
        })
    })
});