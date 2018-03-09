var express = require('express')
var app = express()
var unirest = require("unirest")
var yaml = require("yamljs")
var config = require("../server/config")
var serviceApi = require('./mock-api')
var logger = require('../server/log')


app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());

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
        success: true,
        login: "john"
    };

    res.send(result)
});


function ensureAuthenticated(req, res, next) {
    return next();
}

app.get('/api/orgs', ensureAuthenticated, serviceApi.listOrganizations);
app.get('/api/template', ensureAuthenticated, serviceApi.listTemplates);
app.post('/api/repo', ensureAuthenticated, serviceApi.createRepositoryByTemplate);

logger.log("info", "Mock server listening on http://localhost:" + config.getApplicationSettings().port);
app.listen(config.getApplicationSettings().port)