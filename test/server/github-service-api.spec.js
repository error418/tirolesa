var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

var expect = chai.expect

var sinon = require('sinon')
var config = require('../../server/config')
var unirest = require('unirest')

describe('Github Service API', function() {
	var uut

	var sandbox = sinon.createSandbox()
	var token = 'tokentestcontent'
	var unirestMock, mockResponse, mockBearer, mockConfig

	beforeEach(function() {
		mockConfig = {
			base: 'GITHUB BASE'
		}

		mockBearer = {
			headers: {
				'test': 'test'
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

		sandbox.stub(config, 'getGithubSettings').returns(mockConfig)
        
		sandbox.stub(unirest, 'get').returns(unirestMock)
		sandbox.stub(unirest, 'post').returns(unirestMock)
		sandbox.stub(unirest, 'put').returns(unirestMock)
        
		uut = require('../../server/github-service-api')
	})

	afterEach(function() {
		sandbox.restore()
	})

	it('should comply to public api', function() {
		expect(uut.configureBranch).to.be.not.undefined
		expect(uut.createRepository).to.be.not.undefined
		expect(uut.addIssueLabel).to.be.not.undefined
		expect(uut.requestAccessTokens).to.be.not.undefined
	})

	it('should use GitHub base for request installation endpoint', (complete) => {
		uut.requestInstallations(mockBearer)
			.then(() => {
				sinon.assert.calledWith(unirest.get, sinon.match(/^GITHUB BASE.*/))
				complete()
			})
	})

	it('should use GitHub base for request access token endpoint', (complete) => {
		uut.requestAccessTokens(0, 0)
			.then(() => {
				sinon.assert.calledWith(unirest.post, sinon.match(/^GITHUB BASE.*/))
				complete()
			})
	})

	it('should use GitHub base for create label endpoint', (complete) => {
		uut.addIssueLabel(mockBearer, 'testOrg', 'testRepo', {})
			.then(() => {
				sinon.assert.calledWith(unirest.post, sinon.match(/^GITHUB BASE.*/))
				complete()
			})
	})

	it('should use GitHub base for create repository endpoint', (complete) => {
		uut.createRepository(mockBearer, 'testOrg', {})
			.then(() => {
				sinon.assert.calledWith(unirest.post, sinon.match(/^GITHUB BASE.*/))
				complete()
			})
	})

	it('should use GitHub base for branch protection endpoint', (complete) => {
		uut.configureBranch(mockBearer, 'testOrg', 'testRepo', 'testBranch', {})
			.then(() => {
				sinon.assert.calledWith(unirest.put, sinon.match(/^GITHUB BASE.*/))
				complete()
			})
	})

	describe('Error handling', () => {
		beforeEach(() => {
			mockResponse.ok = false
			mockResponse.body.message = 'error message'
		})

		it('should reject branch configuration on error', (complete) => {
			expect(uut.configureBranch(mockBearer, 'testOrg', 'testRepo', 'testBranch', {})).to.eventually
				.be.rejectedWith(mockResponse.body.message)
				.and.notify(complete)
		})

		it('should reject repository create on error', (complete) => {
			expect(uut.createRepository(mockBearer, 'testOrg', {})).to.eventually
				.be.rejectedWith(mockResponse.body.message)
				.and.notify(complete)
		})

		it('should reject issue label create on error', (complete) => {
			expect(uut.addIssueLabel(mockBearer, 'testOrg', 'testRepo', {})).to.eventually
				.be.rejectedWith(mockResponse.body.message)
				.and.notify(complete)
		})

		it('should reject installation id request on error', (complete) => {
			expect(uut.requestInstallations(mockBearer)).to.eventually
				.be.rejectedWith(mockResponse.body.message)
				.and.notify(complete)
		})

		it('should handle malformed responses for installation request rejection', (complete) => {
			mockResponse.ok = false
			mockResponse.body = undefined

			expect(uut.requestInstallations(mockBearer)).to.eventually
				.be.rejectedWith('GitHub rejected the request')
				.and.notify(complete)
		})

		it('should reject access token request on error', (complete) => {
			expect(uut.requestAccessTokens(0, 0)).to.eventually
				.be.rejectedWith(mockResponse.body.message)
				.and.notify(complete)
		})
	})

})