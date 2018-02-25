var Sequence = require('sequence').Sequence;
var unirest = require("unirest");

var logger = require('./log.js'); 
var ghServiceApi = require("./github-service-api")

var config = require("./config")
var ghTokens = require("./github-tokens")()

/** Creates a repository from a template
 * 
 * @param {*} req http request
 * @param {*} res http response
 */
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
    
    ghTokens.createBearer(installationId, function(bearer, err) {
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
                ghServiceApi.createRepository(bearer, orgName, repoTemplate.config, function (result) {
                    if(result.ok) {
                        serviceResponse.html_url = result.body.html_url;
                        next();
                    } else {
                        logger.log("error", "failed to create repository")
                        res.status(400)
                        res.send({
                            message: "Was not able to create repository: " + result.body.message
                        })
                    }
                })
            })
            .then(function (next) {
                if (!branchTemplate.config || !branchTemplate.branch) {
                    next();
                } else {
                    ghServiceApi.configureBranch(bearer, orgName, repoName, branchTemplate.branch, branchTemplate.config, function (result) {
                        if(result.ok) {
                            next();
                        } else {
                            logger.log("error", "failed to apply branch protection")
                            res.status(400)
                            res.send({
                                message: "Was not able to apply branch protection to repository: " + result.body.message
                            })
                        }
                    })
                }
            })
            .then(function(next) {
                createIssueLabelsFromTemplate(bearer, orgName, repoName, repoTemplate.label, function () {
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

/** Lists organizations for the current user
 * 
 * @param {*} req http request
 * @param {*} res http response
 */
function listOrganizations(req, res) {
    res.send(req.user.orgs)
}

/** Lists the available templates from configuration
 * 
 * @param {*} req http request
 * @param {*} res http response
 */
function listTemplates(req, res) {
    res.send(config.template)
}

/** Adds issue labels from a template for a given repository
 * 
 * @param {*} bearer bearer token
 * @param {*} orgName organization name
 * @param {*} repoName repository name
 * @param {*} labels labels to add
 * @param {*} end done callback
 */
function createIssueLabelsFromTemplate(bearer, orgName, repoName, labels, end) {

    if(!labels) {
        end();
        return;
    }

    var sequence = Sequence.create();
    
    labels.for
    for(var i = 0; i < labels.length; i++) {
        ((item) => {
            sequence.then(function(next) {
                ghServiceApi.addIssueLabel(bearer, orgName, repoName, labels[item], (res, err) => {
                    if(err) {
                        logger.log("info", "failed to create issue label: " + err)
                    }
                    next()
                })
            });
        })(i)
    }
    
    sequence.then(function() {
        end();
    })
}

module.exports = {
    createRepositoryByTemplate: createRepositoryByTemplate,
    listOrganizations: listOrganizations,
    listTemplates: listTemplates
};