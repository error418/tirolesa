var GitHubStrategy = require("passport-github2")
var config = require("./config");
var githubTokens = require("./github-tokens")


function _deserializeUser(user, done) {
    done(null, user);
}

function _serializeUser(user, done) {
    done(null, user);
}

function _oauthResources(accessToken, refreshToken, profile, done) {
    var user = {
        displayName: profile.displayName,
        username: profile.username,
        photos: profile.photos,
        orgs: [],
        installations: {}
    };

    this.githubTokens.getOAuthResources(accessToken, function (resources) {
        user.orgs = resources.orgs;
        user.installations = resources.installations;

        return done(null, user);
    });  
}

function configure(passport) {
    // OAuth configuration *******************************************************
    passport.use(new GitHubStrategy({
            clientID: config.getGithubSettings().oauth.id,
            clientSecret: config.getGithubSettings().oauth.secret
        },
        _oauthResources
    ));

    passport.serializeUser(_serializeUser)
    passport.deserializeUser(_deserializeUser)
}

module.exports = {
    configureOAuth: configure,
    _deserializeUser: _deserializeUser,
    _serializeUser: _serializeUser,
    _oauthResources: _oauthResources
}