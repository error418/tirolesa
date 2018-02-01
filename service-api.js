var logger=require('./log.js'); 

var Sequence = require('sequence').Sequence;
var unirest = require("unirest");


module.exports = function (config) {
    var githubApp = require("./github-app")(config);
    
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

            var sequence = Sequence.create();
            sequence
                .then(function (next) {
                    createRepository(bearer, orgName, repoTemplate.config, function (response) {
                        if(response.ok) {
                            next();
                        } else {
                            logger.log("error", "failed to create repository")
                            res.status(400)
                            res.send("failed to create repository")
                        }
                    })
                })
                .then(function (next) {
                    if (!branchTemplate.config || !branchTemplate.branch) {
                        next();
                    } else {
                        configureBranch(bearer, orgName, repoName, branchTemplate.branch, branchTemplate.config, function (response) {
                            if(response.ok) {
                                next();
                            } else {
                                logger.log("error", "failed to apply branch protection")
                                res.status(400)
                                res.send("failed to create repository")
                            }
                        })
                    }
                })
                .then(function(next) {
                    addIssueLabels(bearer, orgName, repoName, repoTemplate.label, function () {
                        next(); // TODO: error handling
                    })
                })
                .then(function () {
                    res.status(200);
                    res.send();
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
    

    function createRepository(bearer, orgName, repositoryConfig, end) {
        unirest.post(config.github.base + "/orgs/"+orgName+"/repos")
            .headers(bearer.headers)
            .type('json')
            .send(repositoryConfig)
            .end(end);
    }


    function configureBranch(bearer, orgName, repoName, branchName, templateConfig, end) {
        unirest.put(config.github.base + "/repos/"+orgName+"/"+repoName+"/branches/"+branchName+"/protection")
            .headers(bearer.headers)
            .type('json')
            .send(templateConfig)
            .end(end);
    }

    function addIssueLabels(bearer, orgName, repoName, labels, end) {

        if(!labels) {
            end();
            return;
        }

        var sequence = Sequence.create();
        
        for(var i = 0; i < labels.length; i++) {
            sequence.then(function(next) {
                unirest.post(config.github.base + "/repos/"+orgName+"/"+repoName+"/labels")
                    .headers(bearer.headers)
                    .type('json')
                    .send(labels[i])
                    .end(next())
            });
        }
        
        sequence.then(function() {
            end();
        })
    }

    return {
        createRepositoryByTemplate: createRepositoryByTemplate,
        listOrganizations: listOrganizations,
        listTemplates: listTemplates
    };
};