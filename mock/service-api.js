var Sequence = require('sequence').Sequence;
var unirest = require("unirest");
var logger = require('../server/log')

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
                    logger.log("info", "received create repo request")
                    setTimeout(function() {
                        next();
                    }, 1500);
                })
            })
            .then(function (next) {
                configureBranch(orgName, repoName, branchTemplate.branch, branchTemplate.config, function (response) {
                    logger.log("info", "received configure branch request")
                    setTimeout(function() {
                        next();
                    }, 1500);
                })
            })
            .then(function () {
                res.status(500);

                //res.send({ html_url: "none" });
                res.send({ message: "failed on something" })
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
        end()
    }


    function configureBranch(orgName, repoName, branchName, templateConfig, end) {
        end()
    }

    return {
        createRepositoryByTemplate: createRepositoryByTemplate,
        listOrganizations: listOrganizations,
        listTemplates: listTemplates
    };
};