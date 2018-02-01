var session = require('express-session')
var express = require('express')
var app = express()


var unirest = require("unirest")

var passport = require("passport")
var GitHubStrategy = require("passport-github2")

var yaml = require("yamljs")
var config = yaml.load('config.yml')

var serviceApi = require('./service-api')(config)
var githubApp = require("./github-app")(config);


app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());

// configure session storage
if (config.session.redis) {
    console.log("configuring to use Redis as session storage")
    var redisStore = require('connect-redis')(session);
    app.use(session({ 
        secret: config.session.secret,
        store: new redisStore(config.session.redis),
        saveUninitialized: false,
        resave: false
    }));
} else {
    console.log("configuring to use LOCAL storage")
    app.use(session({ 
        secret: config.session.secret, 
        resave: false, 
        saveUninitialized: false 
    }));
}

app.use(passport.initialize());
app.use(passport.session());

app.use('/css/', express.static('node_modules/font-awesome/css'));
app.use('/js/', express.static('node_modules/bootstrap/dist/js'));

app.use('/lib/', express.static('node_modules/angular-ui-bootstrap/dist'));

app.use('/js/', express.static('node_modules/jquery/dist'));
app.use('/js/', express.static('node_modules/angular'));
app.use('/js/', express.static('node_modules/angular-animate'));
app.use('/js/', express.static('node_modules/angular-resource'));
app.use('/js/', express.static('node_modules/angular-route'));

app.use('/fonts/', express.static('node_modules/font-awesome/fonts'));

app.use('/', express.static('dist'));


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

app.get('/api/auth', function (req, res) {
    var result = {
        success: req.isAuthenticated()
    };

    if (req.isAuthenticated()) {
        result.login = req.user.username;
    }
    
    res.send(result)
});

app.get('/auth/github', passport.authenticate('github', {
    scope: [ 'user:email', 'read:org' ]
}));

app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/');
    }
);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401)
    res.send("unauthenticated")
}

app.get('/api/orgs', ensureAuthenticated, serviceApi.listOrganizations);
app.get('/api/template', ensureAuthenticated, serviceApi.listTemplates);
app.post('/api/repo', ensureAuthenticated, serviceApi.createRepositoryByTemplate);

console.log("Listening on http://localhost:" + config.application.port);
app.listen(config.application.port)