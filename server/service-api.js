var Sequence = require('sequence').Sequence;
var unirest = require("unirest");

var logger = require('./log.js'); 
var ghServiceApi = require("./github-service-api")

function createRepositoryByTemplate(req, res) {
    var err = false;
    
    var orgName = req.body.orgName;
    var repoName = req.body.repoName;
    var repoTemplateName = req.body.repoTemplate;
    var branchTemplateName = req.body.branchTemplate;    
    
    var repoTemplate = config.template.repo[repoTemplateName]
    var branchTemplate = config.template.branch[branchTemplateName]
    
    repoTemplate.config.name = repoName
    
    if (!repoName.match(new RegExp(repoTemplate.pattern))) {
        res.status(400)
        res.send("repository name does not match template pattern")
        return;
    }

    if (!req.user.installations[orgName]) {
        res.status(400)
        res.send("repository is not accessible")
        return;
    }

    var installationId = req.user.installations[orgName];
    
    githubApp.createBearer(installationId, function(bearer, err) {
        if (err) {
            logger.log("error", "failed to retrieve api token.")
            res.status(400)
            res.send("could not authenticate to github")
            return;
        }

        var serviceResponse = {};

        var sequence = Sequence.create();
        sequence
            .then(function (next) {
                ghServiceApi.createRepository(bearer, orgName, repoTemplate.config, function (response) {
                    if(response.ok) {
                        serviceResponse.html_url = response.body.html_url;
                        next();
                    } else {
                        logger.log("error", "failed to create repository")
                        res.status(400)
                        res.send({
                            message: "failed to create repository"
                        })
                    }
                })
            })
            .then(function (next) {
                if (!branchTemplate.config || !branchTemplate.branch) {
                    next();
                } else {
                    ghServiceApi.configureBranch(bearer, orgName, repoName, branchTemplate.branch, branchTemplate.config, function (response) {
                        if(response.ok) {
                            next();
                        } else {
                            logger.log("error", "failed to apply branch protection")
                            res.status(400)
                            res.send({
                                message: "failed to apply branch protection to repository"
                            })
                        }
                    })
                }
            })
            .then(function(next) {
                ghServiceApi.addIssueLabels(bearer, orgName, repoName, repoTemplate.label, function () {
                    next(); // TODO: error handling
                })
            })
            .then(function () {
                res.status(200);
                res.send(serviceResponse);
            });
        }
    );
}

function listOrganizations(req, res) {
    res.send(req.user.orgs)
}

function listTemplates(req, res) {
    res.send(config.template)
}


function addIssueLabels(bearer, orgName, repoName, labels, end) {

    if(!labels) {
        end();
        return;
    }

    var sequence = Sequence.create();
    
    for(var i = 0; i < labels.length; i++) {
        sequence.then(function(next) {
            ghServiceApi.addIssueLabel(bearer, orgName, repoName, label[i], () => {
                next()
            })
        });
    }
    
    sequence.then(function() {
        end();
    })
}

module.exports = function (config) {
    var githubApp = require("./github-app")(config);
    
    return {
        createRepositoryByTemplate: createRepositoryByTemplate,
        listOrganizations: listOrganizations,
        listTemplates: listTemplates
    };
};