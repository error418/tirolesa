var GitHubStrategy = require("passport-github2")
var config = require("./config");
var githubApp = require("./github-tokens")();

module.exports = function (passport) {


    // OAuth configuration *******************************************************
    passport.use(new GitHubStrategy({
            clientID: config.getGithubSettings().oauth.id,
            clientSecret: config.getGithubSettings().oauth.secret
        },
        function(accessToken, refreshToken, profile, done) {
            var user = {
                displayName: profile.displayName,
                username: profile.username,
                photos: profile.photos,
                orgs: [],
                installations: {}
            };

            githubApp.getOAuthResources(accessToken, function (resources) {
                user.orgs = resources.orgs;
                user.installations = resources.installations;

                return done(null, user);
            });  
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    return passport;
}