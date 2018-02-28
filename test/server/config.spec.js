var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');

var yaml = require("yamljs")


describe('Application configuration', function() {
    var uut = require("../../server/config")
    var sandbox = sinon.createSandbox();
    
    var mockConfig;
    var envBackup = Object.assign({}, process.env);

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
        
        sandbox.stub(uut, "_loadPropertyFile").returns(mockConfig);
    });

    afterEach(function() {
        sandbox.restore();
        process.env = envBackup
    })

    it('should comply to public api', () => {
        expect(uut.getTemplates).to.exist
        expect(uut.getGithubSettings).to.exist
        expect(uut.getSessionConfiguration).to.exist
        expect(uut.getApplicationSettings).to.exist
    })

    describe('Environment variables', () => {
        it('should not return same object', () => {
            expect(uut._applyEnvironmentVariables(mockConfig)).to.be.not.equal(mockConfig)
        })

        it('should set session storage parameters from environment', () => {
            process.env.REDIS_HOST = "HOST"
            process.env.REDIS_PORT = "PORT"
            process.env.REDIS_TTL = 123
            process.env.REDIS_LOG_ERRORS = true

            var testConfig = uut._applyEnvironmentVariables(mockConfig)

            expect(testConfig.session.redis).to.be.not.undefined
            expect(testConfig.session.redis.host).to.be.equal(process.env.REDIS_HOST)
            expect(testConfig.session.redis.port).to.be.equal(process.env.REDIS_PORT)
            expect(testConfig.session.redis.ttl).to.be.equal(process.env.REDIS_TTL)
            expect(testConfig.session.redis.logErrors).to.be.equal(process.env.REDIS_LOG_ERRORS)
        })

        it('should set github config from environment', () => {
            process.env.GITHUB_OAUTH_ID = "ID"
            process.env.GITHUB_OAUTH_SECRET = "SECRET"
            process.env.GITHUB_APPID = 123
            process.env.GITHUB_BASE = "BASE"

            var testConfig = uut._applyEnvironmentVariables(mockConfig)

            expect(testConfig.github.oauth.id).to.be.equal(process.env.GITHUB_OAUTH_ID)
            expect(testConfig.github.oauth.secret).to.be.equal(process.env.GITHUB_OAUTH_SECRET)
            expect(testConfig.github.appId).to.be.equal(process.env.GITHUB_APPID)
            expect(testConfig.github.base).to.be.equal(process.env.GITHUB_BASE)
        })

        it('should set session secret from environment', () => {
            process.env.SESSION_SECRET = "SECRET"

            var testConfig = uut._applyEnvironmentVariables(mockConfig)

            expect(testConfig.session.secret).to.be.equal(process.env.SESSION_SECRET)
        })


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