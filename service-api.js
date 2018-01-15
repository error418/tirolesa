var Sequence = require('sequence').Sequence;
var unirest = require("unirest");


module.exports = function (config) {
    
    function createRepositoryByTemplate(req, res) {
        var err = false;
        
        var orgName = req.body.orgName;
        var repoName = req.body.repoName;
        var repoTemplateName = req.body.repoTemplate;
        var branchTemplateName = req.body.branchTemplate;    
        
        var repoTemplate = config.template.repo[repoTemplateName]
        var branchTemplate = config.template.branch["default"] // TODO: make configurable
        
        repoTemplate.config.name = repoName
        
        if (!repoName.match(new RegExp(repoTemplate.pattern))) {
            res.status(400)
            res.send("repository name does not match template pattern")
            return;
        }
        
        var sequence = Sequence.create();
        sequence
            .then(function (next) {
                createRepository(orgName, repoTemplate.config, function (response) {
                    if(response.ok) {
                        next();
                    } else {
                        res.status(400)
                        res.send("failed to create repository")
                    }
                })
            })
            .then(function (next) {
                configureBranch(orgName, repoName, branchTemplate.branch, branchTemplate.config, function (response) {
                    if(response.ok) {
                        next();
                    } else {
                        res.status(400)
                        res.send("failed to create repository")
                    }
                })
            })
            .then(function(next) {
                addIssueLabels(orgName, repoName, repoTemplate.config, function () {
                    next(); // TODO: error handling
                })
            })
            .then(function () {
                res.status(200);
                res.send();
            });
    }

    function listOrganizations(req, res) {
        res.send(req.user.orgs)
    }

    function listTemplates(req, res) {
        res.send(config.template)
    }
    

    function createRepository(orgName, repositoryConfig, end) {
        unirest.post(config.github.base + "/orgs/"+orgName+"/repos")
            .headers({'User-Agent': 'thelemic'})
            .type('json')
            .auth("", config.github.api.token)
            .send(repositoryConfig)
            .end(end);
    }


    function configureBranch(orgName, repoName, branchName, templateConfig, end) {
        unirest.put(config.github.base + "/repos/"+orgName+"/"+repoName+"/branches/"+branchName+"/protection")
            .headers({'User-Agent': 'thelemic'})
            .type('json')
            .auth("", config.github.api.token)
            .send(templateConfig)
            .end(end);
    }

    function addIssueLabels(orgName, repoName, templateConfig, end) {
        var labels = templateConfig.label;

        if(!labels) {
            end();
            return;
        }

        var sequence = Sequence.create();
        
        for(var i = 0; i < labels.length(); i++) {
            sequence.then(function(next) {
                unirest.post(config.github.base + "/repos/"+orgName+"/"+repoName+"/labels")
                    .headers({'User-Agent': 'thelemic'})
                    .type('json')
                    .auth("", config.github.api.token)
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