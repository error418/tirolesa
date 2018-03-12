var GitHubStrategy = require('passport-github2')
var config = require('./config')
var githubTokens = require('./github-tokens')
var logger = require('./log')


function _deserializeUser(user, done) {
	done(null, user)
}

function _serializeUser(user, done) {
	done(null, user)
}

function _oauthResources(accessToken, refreshToken, profile, done) {
	var user = {
		displayName: profile.displayName,
		username: profile.username,
		photos: profile.photos,
		orgs: [],
		installations: {}
	}

	githubTokens.getOAuthResources(accessToken)
		.then((resources) => {
			user.orgs = resources.orgs
			user.installations = resources.installations
            
			done(null, user)
		})  
}

function configure(passport) {
	var clientID = config.getGithubSettings().oauth.id,
		clientSecret = config.getGithubSettings().oauth.secret

	if(!(clientID && clientSecret)) {
		logger.log('error', 'it seems you have not configured the properties github.oauth.id and/or github.oauth.secret')
		throw new Error('Missing configuration for properties github.oauth.id and/or github.oauth.secret. Please check your tirolesa configuration file.')
	}

	try {
		// OAuth configuration *******************************************************
		passport.use(new GitHubStrategy({
			clientID: clientID,
			clientSecret: clientSecret
		},
		_oauthResources
		))
	} catch (err) {
		logger.log('error', 'failed to initialize GitHub OAuth handler.')
		throw err
	}

	passport.serializeUser(_serializeUser)
	passport.deserializeUser(_deserializeUser)
}

module.exports = {
	configureOAuth: configure,
	_deserializeUser: _deserializeUser,
	_serializeUser: _serializeUser,
	_oauthResources: _oauthResources
}