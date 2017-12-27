var Sequence = require('sequence').Sequence;
var seq = Sequence.create();
var unirest = require("unirest");


module.exports = function (config) {
    
    function createRepositoryByTemplate(req, res) {
        var err = false;
        
        var orgName = req.body.orgName;
        var repoTemplateName = req.body.template;
        var branchTemplateName = req.body.branchTemplate;    
        var repoName = req.body.repository;

        var repoTemplate = config.template.repo[templateName]
        var branchTemplate = config.template.branch[branchTemplateName]
        
        repoTemplate.config.name = repoName
        
        if (!repoName.match(new RegExp(template.pattern))) {
            res.status(400)
            res.send("repository name does not match template pattern")
            return;
        }

        sequence
            .then(function (next) {
                createRepository(orgName, repoTemplate.config, function (response) {
                    if(response.status === 201) {
                        next();
                    } else {
                        res.status(400)
                        res.send("failed to create repository")
                    }
                })
            })
            .then(function (next) {
                configureBranch(orgName, repoName, branchName, branchTemplate.config, function (response) {
                    if(response.status === 200) {
                        next();
                    } else {
                        res.status(400)
                        res.send("failed to create repository")
                    }
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

    return {
        createRepositoryByTemplate: createRepositoryByTemplate,
        listOrganizations: listOrganizations,
        listTemplates: listTemplates
    };
};