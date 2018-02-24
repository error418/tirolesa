var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var config = require('../../server/config')
var unirest = require('unirest')
var jwt = require('jsonwebtoken');
var fs = require('fs');

describe('Github Service API', function() {
    var uut = require("../../server/github-service-api");

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
        expect(uut.configureBranch).to.be.not.undefined
        expect(uut.createRepository).to.be.not.undefined
        expect(uut.addIssueLabel).to.be.not.undefined
        expect(uut.requestAccessTokens).to.be.not.undefined
    })

});