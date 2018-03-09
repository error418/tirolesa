var chai = require("chai");

chai.use(require("chai-as-promised"))

var assert = chai.assert;
var expect = chai.expect;

var sinon = require('sinon');
var config = require('../../server/config')
var jwt = require('jsonwebtoken');
var fs = require('fs');

var GithubServiceApi = require("../../server/github-service-api")

describe('Github Tokens', function() {
    var uut = require("../../server/github-tokens")

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
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should comply to public api', function() {
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
            
            uut._createJwtToken()
        })

        it('should use jwt sign algorithm RS256', function(complete) {
            jwt.sign.callsFake(function(payload, cert, settings) {
                expect(settings.algorithm).to.be.equal("RS256")
                complete();
            })
            
            uut._createJwtToken()
        })

        it('should return unmodified jwt token', function() {
            jwt.sign.returns("testtoken")

            expect(uut._createJwtToken()).to.be.equal("testtoken")
        })
    })

    describe('Bearer Tokens', function() {
        var token = "testtoken"
        var tokenError = { body: { message: "error message"} }

        beforeEach(() => {
            sandbox.stub(GithubServiceApi, "requestAccessTokens")
        })

        it('should return token on success', (complete) => {
            GithubServiceApi.requestAccessTokens.resolves(token)

            expect(uut.createBearer(0)).to.eventually
                .have.property("token").to.be.equal(token)
                .and.notify(complete)
        })
        
        it('should return Bearer headers on success', (complete) => {
            GithubServiceApi.requestAccessTokens.resolves(token)
            
            expect(uut.createBearer(0)).to.eventually
                .have.property("headers").to.be.not.undefined
                .and.notify(complete)
        })
        
        it('should return error on failure', (complete) => {
            GithubServiceApi.requestAccessTokens.rejects(tokenError)
            
            expect(uut.createBearer(0)).to
                .be.rejected
                .and.notify(complete)
        })
    })

    describe('OAuth', function() {
        var mockInstallations
        var mockInstallationsError

        beforeEach(function() {
            sandbox.stub(GithubServiceApi, "requestInstallations")
            
            mockInstallationsError = { body: { message: "error message"} }

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
        })

        it('should retrieve user organizations and place them in collection', (complete) => {
            GithubServiceApi.requestInstallations.resolves(mockInstallations)

            expect(uut.getOAuthResources(token)).to.eventually
                .have.property("orgs").to.be.an('array')
                    .that.deep.include({
                        login: "orgname",
                        type: "type",
                        avatar: "avatar"
                    })
                .and.notify(complete)
        })

        it('should retrieve user organizations and build github app installation map', (complete) => {
            GithubServiceApi.requestInstallations.resolves(mockInstallations)

            expect(uut.getOAuthResources(token)).to.eventually
                .have.nested.property("installations.orgname").to.be.not.undefined
                .and.notify(complete)
        })

        it('should return error on organization fetch failure', (complete) => {
            GithubServiceApi.requestInstallations.rejects(mockInstallationsError)

            expect(uut.getOAuthResources(token)).to
                .be.rejected
                .and.notify(complete)
        })

    })
});