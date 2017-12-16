var yaml = require("yamljs")
var session = require('express-session')
var express = require('express')
var app = express()

var unirest = require("unirest")

var passport = require("passport")
var GitHubStrategy = require("passport-github2")

var config = yaml.load('config.yml')

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/css/', express.static('node_modules/bootstrap/dist/css'));
app.use('/js/', express.static('node_modules/bootstrap/dist/js'));

app.use('/lib/', express.static('node_modules/angular-ui-bootstrap/dist'));

app.use('/js/', express.static('node_modules/jquery/dist'));
app.use('/js/', express.static('node_modules/angular'));
app.use('/js/', express.static('node_modules/angular-animate'));
app.use('/js/', express.static('node_modules/angular-resource'));
app.use('/js/', express.static('node_modules/angular-route'));
app.use('/fonts/', express.static('node_modules/bootstrap/dist/fonts'));

app.use('/', express.static('dist'));


// OAuth configuration *******************************************************
passport.use(new GitHubStrategy({
    clientID: config.github.client.id,
    clientSecret: config.github.client.secret,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    
    unirest.get("http://localhost:4000/user/orgs")
    .headers({
        'User-Agent': 'thelemic',
        "Authorization": "Bearer " + accessToken
    })
    .end(function (orgs) {
        profile.orgs = orgs.body;
        return done(null, profile);
    })
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
    passport.authenticate('github', { failureRedirect: '/login' }),
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

app.get('/api/orgs', ensureAuthenticated, function (req, res) {
    res.send(req.user.orgs)
});

console.log("Listening on http://localhost:" + config.endpoint.port);
app.listen(config.endpoint.port)