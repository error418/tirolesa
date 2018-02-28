var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var yaml = require("yamljs")


describe('Application configuration', function() {
    var uut = require("../../server/config")
    var sandbox = sinon.createSandbox();
    
    var mockConfig;

    beforeEach(function() {
        mockConfig = {
            github: {
                oauth: {
                    id: "ID",
                    secret: "SECRET"
                },
                appId: "APP_ID",
                base: "BASE"
            },
            application: {
                port: "PORT"
            },
            session: {
                secret: "SECRET"
            },
            template: {
                TEST: {}
            }
        }
        
        sandbox.stub(yaml, "load").returns(mockConfig);
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should comply to public api', () => {
        expect(uut.getTemplates).to.exist
        expect(uut.getGithubSettings).to.exist
        expect(uut.getSessionConfiguration).to.exist
        expect(uut.getApplicationSettings).to.exist
    })

    it('should return correct template object', () => {
        expect(uut.getTemplates()).to.be.equal(mockConfig.template)
    })

    it('should return correct github settings object', () => {
        expect(uut.getGithubSettings()).to.be.equal(mockConfig.github)
    })

    it('should return correct application settings object', () => {
        expect(uut.getApplicationSettings()).to.be.equal(mockConfig.application)
    })

    it('should return correct session configuration object', () => {
        expect(uut.getSessionConfiguration()).to.be.equal(mockConfig.session)
    })
})