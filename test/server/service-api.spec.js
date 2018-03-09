var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var assert = chai.assert;
var expect = chai.expect;

var sinon = require('sinon');

var ghTokens = require("../../server/github-tokens")
var ghServiceApi = require("../../server/github-service-api")
var config = require('../../server/config')
var uut

describe('Tirolesa Service API', function() {

    var sandbox = sinon.createSandbox();

    var errorResponse = { body: { message: "test error" } }
    var successResponse = { body: { html_url: "test url" } }
    var mockRequest, mockResponse, mockTemplate
    
    beforeEach(function() {
        uut = require("../../server/service-api")
        
        mockRequest = {
            body: {
                repoName: "abc",
                repoTemplate: "testTemplate",
                branchTemplate: "testTemplate",
                orgName: "testOrg"
            },
            user: {
                orgs: ["testOrg"],
                installations: {
                    testOrg: "test"
                }
            }
        }

        mockTemplate = {
            repo: {
                testTemplate: {
                    pattern: "[a-z]+",
                    config: {}
                }
            },
            branch: {
                testTemplate: {
                    pattern: "[a-z]+",
                    config: {},
                    branch: "master"
                }
            }
        }

        mockResponse = {
            status: sinon.stub(),
            send: sinon.stub()
        }

        sandbox.stub(ghServiceApi, "createRepository")
        sandbox.stub(ghServiceApi, "configureBranch")
        sandbox.stub(ghServiceApi, "addIssueLabel")
        sandbox.stub(ghTokens, "createBearer")

        sandbox.stub(config, "getTemplates")
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should comply to public api', function() {
        expect(uut.createRepositoryByTemplate).to.be.not.undefined
        expect(uut.listOrganizations).to.be.not.undefined
        expect(uut.listTemplates).to.be.not.undefined
    })

    it('should list templates from configuration', () => {
        config.getTemplates.returns(mockTemplate)

        uut.listTemplates(null, mockResponse)

        sinon.assert.calledWith(mockResponse.send, sinon.match.same(mockTemplate))
    })

    it('should list user organizations from session', () => {
        uut.listOrganizations(mockRequest, mockResponse)

        sinon.assert.calledWith(mockResponse.send, sinon.match.same(mockRequest.user.orgs))
    })

    describe('Create repository', () => {

        it('should enforce repository name pattern', () => {
            mockTemplate.repo.testTemplate.pattern = "^[a-z]+$"
            mockRequest.body.repoName = "abc1"

            config.getTemplates.returns(mockTemplate)
            uut.createRepositoryByTemplate(mockRequest, mockResponse);

            sinon.assert.calledWith(mockResponse.status, 400);
            sinon.assert.calledWith(mockResponse.send, sinon.match.has("message", "repository name does not match template pattern"))
        })

        it('should deny organization access for unknown organizations', () => {
            mockRequest.body.orgName = "no access"

            config.getTemplates.returns(mockTemplate)
            uut.createRepositoryByTemplate(mockRequest, mockResponse);

            sinon.assert.calledWith(mockResponse.status, 400);
            sinon.assert.calledWith(mockResponse.send, sinon.match.has("message", "repository is not accessible"))
        })

        it('should deny organization access for undefined organizations', () => {
            mockRequest.body.orgName = undefined

            config.getTemplates.returns(mockTemplate)
            uut.createRepositoryByTemplate(mockRequest, mockResponse);

            sinon.assert.calledWith(mockResponse.status, 400);
            sinon.assert.calledWith(mockResponse.send, sinon.match.has("message", "repository is not accessible"))
        })

        it('should send success response on success', (complete) => {
            config.getTemplates.returns(mockTemplate)

            ghTokens.createBearer.resolves()
            ghServiceApi.createRepository.resolves(successResponse)
            ghServiceApi.configureBranch.resolves()
            ghServiceApi.addIssueLabel.resolves()

            uut.createRepositoryByTemplate(mockRequest, mockResponse);
            
            // dodgy test assertion :(
            setTimeout(() => {
                sinon.assert.calledWith(mockResponse.status, 200);
                complete()
            }, 5)
        })

        it('should handle error on repository configuration', (complete) => {
            config.getTemplates.returns(mockTemplate)

            ghTokens.createBearer.resolves()
            ghServiceApi.createRepository.resolves(successResponse)
            ghServiceApi.configureBranch.rejects(errorResponse)

            uut.createRepositoryByTemplate(mockRequest, mockResponse);
            
            // dodgy test assertion :(
            setTimeout(() => {
                sinon.assert.calledWith(mockResponse.status, 400);
                sinon.assert.calledWith(mockResponse.send, { message: "Was not able to configure repository. " + errorResponse.body.message})
                complete()
            }, 5)

        })

        it('should handle error on create repository', (complete) => {
            config.getTemplates.returns(mockTemplate)

            ghTokens.createBearer.resolves()
            ghServiceApi.createRepository.rejects(errorResponse)

            uut.createRepositoryByTemplate(mockRequest, mockResponse);
            
            // dodgy test assertion :(
            setTimeout(() => {
                sinon.assert.calledWith(mockResponse.status, 400);
                sinon.assert.calledWith(mockResponse.send, { message: "Was not able to create repository. " + errorResponse.body.message})
                complete()
            }, 5)
        })

        it('should handle error on bearer token retrieval', (complete) => {
            config.getTemplates.returns(mockTemplate)

            ghTokens.createBearer.rejects()
            
            uut.createRepositoryByTemplate(mockRequest, mockResponse);
            
            // dodgy test assertion :(
            setTimeout(() => {
                sinon.assert.calledWith(mockResponse.status, 400);
                sinon.assert.calledWith(mockResponse.send, { message: "Was not able to retrieve bearer token."})
                complete()
            }, 5)
        })
    })

    describe('Create Issue Labels', () => {
        var testLabels = ["a", "b", "c"]

        it('should create all requested labels', () => {
            ghServiceApi.addIssueLabel.resolves("bearer")

            uut._createIssueLabelsFromTemplate(0, "", "", testLabels)

            sinon.assert.callCount(ghServiceApi.addIssueLabel, testLabels.length)
        })

        it('should handle errors', (complete) => {
            ghServiceApi.addIssueLabel.rejects()

            expect(uut._createIssueLabelsFromTemplate(0, "", "", testLabels))
                .to.be.rejected
                .and.notify(complete)
        })
    })

});