var yaml = require("yamljs")
var session = require('express-session')
var express = require('express')
var app = express()

var unirest = require("unirest")

var config = yaml.load('config.yml')

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());


app.use('/css/', express.static('node_modules/bootstrap/dist/css'));
app.use('/css/', express.static('node_modules/font-awesome/css'));
app.use('/js/', express.static('node_modules/bootstrap/dist/js'));

app.use('/lib/', express.static('node_modules/angular-ui-bootstrap/dist'));

app.use('/js/', express.static('node_modules/jquery/dist'));
app.use('/js/', express.static('node_modules/angular'));
app.use('/js/', express.static('node_modules/angular-animate'));
app.use('/js/', express.static('node_modules/angular-resource'));
app.use('/js/', express.static('node_modules/angular-route'));

app.use('/fonts/', express.static('node_modules/bootstrap/dist/fonts'));
app.use('/fonts/', express.static('node_modules/font-awesome/fonts'));

app.use('/', express.static('dist'));



app.get('/api/auth', function (req, res) {
    var result = {
        success: true,
        login: "john"
    };

    res.send(result)
});


function ensureAuthenticated(req, res, next) {
    return next();
}

app.get('/api/orgs', ensureAuthenticated, function (req, res) {
    res.send([
        {
            "login": "interesting-org",
            "url": "https://api.github.com/orgs/github",
            "description": "A great organization"
        },
        {
            "login": "boring-org",
            "url": "https://api.github.com/orgs/github",
            "description": "A plain organization"
        },
        {
            "login": "unicorn-org",
            "url": "https://api.github.com/orgs/github",
            "description": "An unusual organization"
        },
    ])
});

app.get('/api/template', ensureAuthenticated, function (req, res) {
    res.send(config.template)
});

app.post('/api/repo', ensureAuthenticated, function (req, res) {
    res.status(200)
    res.send()
});


app.post('/api/repo/branch', ensureAuthenticated, function (req, res) {
    res.status(200)
    res.send()
});

console.log("Listening on http://localhost:" + config.endpoint.port);
app.listen(config.endpoint.port)