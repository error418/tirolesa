var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var ghServiceApi = require("../../server/github-service-api")

describe('Tirolesa Service API', function() {
    var uut = require("../../server/service-api");

    var sandbox = sinon.createSandbox();
    
    beforeEach(function() {
        sandbox.stub(ghServiceApi, "createRepository")
        sandbox.stub(ghServiceApi, "configureBranch")
        sandbox.stub(ghServiceApi, "addIssueLabel")
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should comply to public api', function() {
        expect(uut.createRepositoryByTemplate).to.be.not.undefined
        expect(uut.listOrganizations).to.be.not.undefined
        expect(uut.listTemplates).to.be.not.undefined
    })

});