var assert = require('chai').assert;
var expect = require('chai').expect;

var config = require("../../server/config")
var uut = require("../../server/github-request-headers")

describe('Github Request Headers', function() {
    var testToken = "testToken"

    it('should comply to public api', function() {
        expect(uut.createTokenHeaders).to.be.not.undefined
        expect(uut.createBearerHeaders).to.be.not.undefined
    })

    describe('API token HTTP headers', () => {
        it('should construct token contents', function() {
            var result = uut.createTokenHeaders(testToken)
            
            expect(result['User-Agent']).to.be.equal(config.application.name)
            expect(result['Authorization']).to.be.equal('token ' + testToken)
        })
        
        it('should use GitHub Apps HTTP Accept mime-type', function() {
            var result = uut.createTokenHeaders(testToken)
            
            expect(result['Accept']).to.be.equal('application/vnd.github.machine-man-preview+json')
        })
    })

    describe('Bearer token HTTP headers', () => {
        it('should construct token contents', function() {
            var result = uut.createBearerHeaders(testToken)
            
            expect(result['User-Agent']).to.be.equal(config.application.name)
            expect(result['Authorization']).to.be.equal('Bearer ' + testToken)
        })
        
        it('should use GitHub Apps HTTP Accept mime-type', function() {
            var result = uut.createBearerHeaders(testToken)
            
            expect(result['Accept']).to.be.equal('application/vnd.github.machine-man-preview+json')
        })
    })
})