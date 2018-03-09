var session = require('express-session')
var express = require('express')
var unirest = require("unirest")

var logger = require('./log');
var config = require('./config')
var serviceApi = require('./service-api')

var passport = require("passport")
var passportConfigurer = require('./passport-oauth')

// configure passport for GitHub OAuth
passportConfigurer.configureOAuth(passport)

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401)
    res.send("unauthenticated")
}

function authenticationStatusService(req, res) {
    var result = {
        success: req.isAuthenticated()
    };
    
    if (req.isAuthenticated()) {
        result.login = req.user.username;
    }
    
    res.send(result)
}

function configureExpressSession(expressApp) {
    // configure session storage
    var sessionConfig = config.getSessionConfiguration()

    if (sessionConfig.redis) {
        logger.log("info", "configuring to use Redis as session storage")
        var redisStore = require('connect-redis')(session);
        expressApp.use(session({ 
            secret: sessionConfig.secret,
            store: new redisStore(sessionConfig.redis),
            saveUninitialized: false,
            resave: false
        }));
    } else {
        logger.log("info", "configuring to use LOCAL session storage")
        logger.log("warn", "Local session storage should only be used in development")
        expressApp.use(session({ 
            secret: sessionConfig.secret, 
            resave: false, 
            saveUninitialized: false 
        }));
    }
    
    expressApp.use(passport.initialize())
    expressApp.use(passport.session())
}

function configureExpressServices(expressApp) {
    expressApp.use(require('body-parser').urlencoded({ extended: true }));
    expressApp.use(require('body-parser').json());

    expressApp.get('/api/orgs', ensureAuthenticated, serviceApi.listOrganizations)
    expressApp.get('/api/template', ensureAuthenticated, serviceApi.listTemplates)
    expressApp.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email', 'read:org' ] }));
    expressApp.get('/api/auth', authenticationStatusService)
    expressApp.get('/auth/github/callback', 
        passport.authenticate('github', { failureRedirect: '/' }),
        function(req, res) {
            res.redirect('/');
        }
    )
    
    expressApp.post('/api/repo', ensureAuthenticated, serviceApi.createRepositoryByTemplate)
}

function configureExpressResources(expressApp) {
    expressApp.use('/css/', express.static('node_modules/font-awesome/css'))
    expressApp.use('/js/', express.static('node_modules/bootstrap/dist/js'))
    expressApp.use('/lib/', express.static('node_modules/angular-ui-bootstrap/dist'))
    expressApp.use('/js/', express.static('node_modules/jquery/dist'))
    expressApp.use('/js/', express.static('node_modules/angular'))
    expressApp.use('/js/', express.static('node_modules/angular-animate'))
    expressApp.use('/js/', express.static('node_modules/angular-resource'))
    expressApp.use('/js/', express.static('node_modules/angular-route'))
    expressApp.use('/fonts/', express.static('node_modules/font-awesome/fonts'))
    expressApp.use('/', express.static('dist'))
}

function run(expressInstance) {
    var app = expressInstance || express()

    configureExpressSession(app)
    configureExpressResources(app)
    configureExpressServices(app)

    logger.log("info", "Listening on http://localhost:" + config.getApplicationSettings().port);
    app.listen(config.getApplicationSettings().port)

}

module.exports =  {
    run: run,
    _ensureAuthenticated: ensureAuthenticated,
    _configureExpressSession: configureExpressSession,
    _configureExpressResources: configureExpressResources,
    _configureExpressServices: configureExpressServices,
    _authenticationStatusService: authenticationStatusService
}
