var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var assert = chai.assert;
var expect = chai.expect;

var sinon = require('sinon');

var session = require('express-session')
var express = require('express')
var unirest = require("unirest")
var passport = require("passport")

var config = require('../../server/config')
var serviceApi = require('../../server/service-api')
var passportConfigurer = require('../../server/passport-oauth')

var uut

describe('Tirolesa Server', function() {

    var mockRequest = {
        isAuthenticated: () => {}
    }

    var mockResponse = {
        send: () => {},
        status: () => {}
    }

    var mockExpress = {
        use: () => {},
        listen: () => {},
        post: () => {},
        get: () => {}
    }

    var sandbox = sinon.createSandbox();
    
    beforeEach(function() {
        uut = require("../../server/tirolesa-server")
    
        sandbox.stub(mockRequest, "isAuthenticated")

        sandbox.stub(mockExpress, "use")
        sandbox.stub(mockExpress, "listen")

        sandbox.stub(mockResponse, "send")
        sandbox.stub(mockResponse, "status")

        sandbox.stub(config, "getSessionConfiguration")

        sandbox.stub(passport, "initialize")
        sandbox.stub(passport, "session")
        sandbox.stub(passport, "authenticate")

        sandbox.stub(serviceApi, "listOrganizations")
        sandbox.stub(serviceApi, "listTemplates")
        sandbox.stub(serviceApi, "createRepositoryByTemplate")

        config.getSessionConfiguration.returns({
            secret: "whoopsie!"
        })
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should reject invalid user authentication', () => {
        mockRequest.isAuthenticated.returns(false)
        
        uut._ensureAuthenticated(mockRequest, mockResponse, sinon.stub())
        
        sinon.assert.calledWith(mockResponse.send, "unauthenticated")
        sinon.assert.calledWith(mockResponse.status, 401)
    })

    it('should accept valid user authentication', () => {
        mockRequest.isAuthenticated.returns(true)
        var mockNext = sinon.stub()
        
        uut._ensureAuthenticated(mockRequest, mockResponse, mockNext)
        
        sinon.assert.calledOnce(mockNext)
    })

    it('should configure express resources', () => {
        uut._configureExpressResources(mockExpress)

        sinon.assert.called(mockExpress.use)
    })

    it('should configure express services', () => {
        uut._configureExpressServices(mockExpress)
        
        sinon.assert.called(mockExpress.use)
    })
    
    it('should configure express session', () => {
        uut._configureExpressSession(mockExpress)
        
        sinon.assert.called(mockExpress.use)
    })

    it('should start express server on run', () => {
        uut.run(mockExpress)
        
        sinon.assert.called(mockExpress.listen)
    })

    describe('AuthenticationStatusService', () => {

        beforeEach(() => {
            mockRequest.user = { username: "testuser" }
        })
        
        it('should send negative authentication status when unauthenticated', () => {
            mockRequest.isAuthenticated.returns(false)
            uut._authenticationStatusService(mockRequest, mockResponse)

            sinon.assert.calledWith(mockResponse.send, sinon.match({
                success: false
            }))
        })

        it('should send positive authentication status with username when authenticated', () => {
            mockRequest.isAuthenticated.returns(true)
            uut._authenticationStatusService(mockRequest, mockResponse)

            sinon.assert.calledWith(mockResponse.send, sinon.match({
                success: true,
                login: mockRequest.user.username
            }))
        })
    })
});