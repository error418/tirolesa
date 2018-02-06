var passport = require("passport")
var GitHubStrategy = require("passport-github2")

module.exports = function (config) {

    var githubApp = require("./github-app")(config);

    // OAuth configuration *******************************************************
    passport.use(new GitHubStrategy({
            clientID: config.github.oauth.id,
            clientSecret: config.github.oauth.secret
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