var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var assert = chai.assert;
var expect = chai.expect;

var sinon = require('sinon');
var config = require('../../server/config')
var unirest = require('unirest')
var jwt = require('jsonwebtoken');
var fs = require('fs');
var config = require('../../server/config')

describe('Github Service API', function() {
    var uut

    var sandbox = sinon.createSandbox();
    var token = "tokentestcontent"
    var unirestMock, mockResponse, mockBearer

    beforeEach(function() {
        mockConfig = {
            base: "GITHUB BASE"
        }

        mockBearer = {
            headers: {
                "test": "test"
            }
        }

        mockResponse = {
            ok: true,
            body: {
                token: token
            }
        }
        
        unirestMock = {
            headers: sinon.stub().returns(unirestMock),
            send: sinon.stub().returns(unirestMock),
            type: sinon.stub().returns(unirestMock),
            end: function(cb) {
                cb(mockResponse)
            }
        }

        sandbox.stub(config, "getGithubSettings").returns(mockConfig)
        
        sandbox.stub(unirest, "get").returns(unirestMock)
        sandbox.stub(unirest, "post").returns(unirestMock)
        sandbox.stub(unirest, "put").returns(unirestMock)
        
        uut = require("../../server/github-service-api")
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should comply to public api', function() {
        expect(uut.configureBranch).to.be.not.undefined
        expect(uut.createRepository).to.be.not.undefined
        expect(uut.addIssueLabel).to.be.not.undefined
        expect(uut.requestAccessTokens).to.be.not.undefined
    })

    it('should use GitHub base for request installation endpoint', async () => {
        await (uut.requestInstallations(mockBearer))
        sinon.assert.calledWith(unirest.get, sinon.match(/^GITHUB BASE.*/));
    })

    it('should use GitHub base for request access token endpoint', async () => {
        await (uut.requestAccessTokens(0, 0))
        sinon.assert.calledWith(unirest.post, sinon.match(/^GITHUB BASE.*/));
    })

    it('should use GitHub base for create label endpoint', async () => {
        await (uut.addIssueLabel(mockBearer, "testOrg", "testRepo", {}))
        sinon.assert.calledWith(unirest.post, sinon.match(/^GITHUB BASE.*/))
    })

    it('should use GitHub base for create repository endpoint', async () => {
        await (uut.createRepository(mockBearer, "testOrg", {}))
        sinon.assert.calledWith(unirest.post, sinon.match(/^GITHUB BASE.*/));
    })

    it('should use GitHub base for branch protection endpoint', async () => {
        await (uut.configureBranch(mockBearer, "testOrg", "testRepo", "testBranch", {}))
        sinon.assert.calledWith(unirest.put, sinon.match(/^GITHUB BASE.*/));
    })

    describe("Error handling", () => {
        beforeEach(() => {
            mockResponse.ok = false
            mockResponse.body.message = "error message"
        })

        it('should reject branch configuration on error', (complete) => {
            expect(uut.configureBranch(mockBearer, "testOrg", "testRepo", "testBranch", {})).to.eventually
                .be.rejectedWith(mockResponse.body.message)
                .and.notify(complete)
        })

        it('should reject repository create on error', (complete) => {
            expect(uut.createRepository(mockBearer, "testOrg", {})).to.eventually
                .be.rejectedWith(mockResponse.body.message)
                .and.notify(complete)
        })

        it('should reject issue label create on error', (complete) => {
            expect(uut.addIssueLabel(mockBearer, "testOrg", "testRepo", {})).to.eventually
                .be.rejectedWith(mockResponse.body.message)
                .and.notify(complete)
        })

        it('should reject installation id request on error', (complete) => {
            expect(uut.requestInstallations(mockBearer)).to.eventually
                .be.rejectedWith(mockResponse.body.message)
                .and.notify(complete)
        })

        it('should reject access token request on error', (complete) => {
            expect(uut.requestAccessTokens(0, 0)).to.eventually
                .be.rejectedWith(mockResponse.body.message)
                .and.notify(complete)
        })
    })

});