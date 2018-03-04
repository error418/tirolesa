var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var assert = chai.assert;
var expect = chai.expect;

var sinon = require('sinon');
var config = require('../../server/config')
var jwt = require('jsonwebtoken');
var fs = require('fs');

var GithubServiceApi = require("../../server/github-service-api")
var GithubApp = require("../../server/github-tokens")

describe('Github Tokens', function() {
    var uut;

    var sandbox = sinon.createSandbox();
    var token = "tokentestcontent"
    var mockSettings

    beforeEach(function() {
        mockSettings = {
            keyFile: "none",
            appId: "testId"
        }

        // mock private key
        sandbox.stub(fs, "readFileSync")

        // mock jwt signing
        sandbox.stub(jwt, "sign")

        sandbox.stub(config, "getGithubSettings").returns(mockSettings)

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
                expect(payload.iss).to.be.equal(mockSettings.appId)
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
        var tokenError = { body: { message: "error message"} }

        beforeEach(() => {
            sandbox.stub(GithubServiceApi, "requestAccessTokens")
        })

        it('should return token on success', async () => {
            GithubServiceApi.requestAccessTokens.resolves(token)
            
            var bearer = await (uut.createBearer(0))


            expect(bearer.token).to.be.equal(token)
        })
        
        it('should return Bearer headers on success', async () => {
            GithubServiceApi.requestAccessTokens.resolves(token)
            
            var bearer = await (uut.createBearer(0))
        
            expect(bearer.headers).to.be.not.undefined
        })
        
        it('should return error on failure', () => {
            GithubServiceApi.requestAccessTokens.rejects(tokenError)
            
            expect(uut.createBearer(0)).to.eventually
                .be.rejectedWith(tokenError.body.message)
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

        it('should retrieve user organizations', () => {
            expect(uut.getOAuthResources(token)).to.eventually
                .have.property("orgs").to.be.an('array')
                .and.deep.include({
                    login: "orgname",
                    type: "type",
                    avatar: "avatar"
                })
                .and.have.nested.property("installations.orgname").to.be.not.undefined
        })
    })
});