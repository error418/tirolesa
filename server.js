var session = require('express-session')
var express = require('express')
var app = express()
var unirest = require("unirest")

var logger = require('./server/log');
var config = require('./server/config')
var serviceApi = require('./server/service-api')

var passport = require("passport")
var passportConfigurer = require('./server/passport-oauth')


process.on('unhandledRejection', (err) => { 
    logger.log("error", err)
})

// configure passport for GitHub OAuth
passportConfigurer(passport)

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());

// configure session storage
var sessionConfig = config.getSessionConfiguration()
if (sessionConfig.redis) {
    logger.log("info", "configuring to use Redis as session storage")
    var redisStore = require('connect-redis')(session);
    app.use(session({ 
        secret: sessionConfig.secret,
        store: new redisStore(sessionConfig.redis),
        saveUninitialized: false,
        resave: false
    }));
} else {
    logger.log("info", "configuring to use LOCAL session storage")
    logger.log("warn", "Local session storage should only be used in development")
    app.use(session({ 
        secret: sessionConfig.secret, 
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

logger.log("info", "Listening on http://localhost:" + config.getApplicationSettings().port);
app.listen(config.getApplicationSettings().port)