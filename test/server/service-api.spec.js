var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var ghServiceApi = require("../../server/github-service-api")
var config = require('../../server/config')

describe('Tirolesa Service API', function() {
    var uut = require("../../server/service-api");

    var sandbox = sinon.createSandbox();

    var mockRequest, mockResponse, mockTemplate
    
    beforeEach(function() {
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
                    pattern: "[a-z]+"
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
            sinon.assert.calledWith(mockResponse.send, sinon.match("repository name does not match template pattern"))
        })

        it('should deny organization access for unknown organizations', () => {
            mockRequest.body.orgName = "no access"
            config.getTemplates.returns(mockTemplate)
            uut.createRepositoryByTemplate(mockRequest, mockResponse);

            sinon.assert.calledWith(mockResponse.status, 400);
            sinon.assert.calledWith(mockResponse.send, sinon.match("repository is not accessible"))
        })

        it('should deny organization access for undefined organizations', () => {
            mockRequest.body.orgName = undefined
            config.getTemplates.returns(mockTemplate)
            uut.createRepositoryByTemplate(mockRequest, mockResponse);

            sinon.assert.calledWith(mockResponse.status, 400);
            sinon.assert.calledWith(mockResponse.send, sinon.match("repository is not accessible"))
        })
    })

});