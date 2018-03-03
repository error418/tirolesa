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
async function createRepositoryByTemplate(req, res) {
    var err = false;
    
    var orgName = req.body.orgName;
    var repoName = req.body.repoName;
    var repoTemplateName = req.body.repoTemplate;
    var branchTemplateName = req.body.branchTemplate;    
    
    var repoTemplate = config.getTemplates().repo[repoTemplateName]
    var branchTemplate = config.getTemplates().branch[branchTemplateName]
    
    repoTemplate.config.name = repoName
    
    if (!repoName.match(new RegExp(repoTemplate.pattern))) {
        res.status(400)
        res.send("repository name does not match template pattern")
        return;
    }

    if (!orgName || !req.user.installations[orgName]) {
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
        try {
            // create repository
            var repoResonse = await ghServiceApi.createRepository(bearer, orgName, repoTemplate.config)
            
            serviceResponse.html_url = repoResonse.body.html_url;
            
            if (branchTemplate.config && branchTemplate.branch) {
                // configure branches by using chosen template
                await ghServiceApi.configureBranch(bearer, orgName, repoName, branchTemplate.branch, branchTemplate.config)
            }
            
            // create additional issue labels by template
            await createIssueLabelsFromTemplate(bearer, orgName, repoName, repoTemplate.label)
            
        } catch (err) {
            logger.log("info", "failed to create and configure repository: " + err)
            res.status(400)
            res.send({
                message: "Was not able to create and configure repository. " + result.body.message
            })
            return;
        }

        res.status(200);
        res.send(serviceResponse);
    })
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
    res.send(config.getTemplates())
}

/** Adds issue labels from a template for a given repository
 * 
 * @param {*} bearer bearer token
 * @param {*} orgName organization name
 * @param {*} repoName repository name
 * @param {*} labels labels to add
 * @param {*} end done callback
 */
async function createIssueLabelsFromTemplate(bearer, orgName, repoName, labels) {
    return new Promise((resolve, reject) => {

        if(!labels) {
            resolve()
            return
        }
        
        for(var i = 0; i < labels.length; i++) {
            ((item) => {
                try {
                    await ghServiceApi.addIssueLabel(bearer, orgName, repoName, labels[item])
                } catch (err) {
                    logger.log("info", "failed to create issue label: " + err)
                    reject(err)
                }
            })(i)
        }

        resolve()
    })
}

module.exports = {
    createRepositoryByTemplate: createRepositoryByTemplate,
    listOrganizations: listOrganizations,
    listTemplates: listTemplates
};