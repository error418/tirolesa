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
            .then(function () {
                res.status(200);
                res.send();
            });
    }

    function listOrganizations(req, res) {
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
    }

    function listTemplates(req, res) {
        res.send(config.template)
    }
    

    function createRepository(orgName, repositoryConfig, end) {
        unirest.post(config.github.base + "/orgs/"+orgName+"/repos")
            .headers({'User-Agent': 'tirolesa'})
            .type('json')
            .auth("", config.github.api.token)
            .send(repositoryConfig)
            .end(end);
    }


    function configureBranch(orgName, repoName, branchName, templateConfig, end) {
        unirest.put(config.github.base + "/repos/"+orgName+"/"+repoName+"/branches/"+branchName+"/protection")
            .headers({'User-Agent': 'tirolesa'})
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