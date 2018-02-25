var unirest = require("unirest");
var config = require("./config")
var ghRequestHeaders = require("./github-request-headers")
var logger = require("./log")

/** Configures a branch using the GitHub API
 * 
 * @param {*} bearer bearer token
 * @param {*} orgName organization name
 * @param {*} repoName repository name
 * @param {*} branchName target branch name
 * @param {*} templateConfig template to use (this is the API request sent to GitHub)
 * @param {*} end done callback
 */
function configureBranch(bearer, orgName, repoName, branchName, templateConfig, end) {
    unirest.put(config.github.base + "/repos/"+orgName+"/"+repoName+"/branches/"+branchName+"/protection")
        .headers(bearer.headers)
        .type('json')
        .send(templateConfig)
        .end(end);
}

/** Creates a repository using the GitHub API
 * 
 * @param {*} bearer bearer token
 * @param {*} orgName organization name
 * @param {*} repositoryConfig repository configuration (this is the API request sent to GitHub)
 * @param {*} end done callback
 */
function createRepository(bearer, orgName, repositoryConfig, end) {
    unirest.post(config.github.base + "/orgs/"+orgName+"/repos")
        .headers(bearer.headers)
        .type('json')
        .send(repositoryConfig)
        .end(end);
}

/** Adds an Issue Label to a repository using the GitHub API
 * 
 * @param {*} bearer bearer token
 * @param {*} orgName organization name
 * @param {*} repoName repository name
 * @param {*} label label configuration (this is the API request sent to GitHub)
 * @param {*} end done callback
 */
function addIssueLabel(bearer, orgName, repoName, label, end) {
    unirest.post(config.github.base + "/repos/"+orgName+"/"+repoName+"/labels")
        .headers(bearer.headers)
        .type('json')
        .send(label)
        .end((res) => {
            if(res.ok) {
                end(res.body)
            } else {
                logger.log("error", "error creating issue label: " + res.body.message)
                end(null, res);
            }
        })
}

/** Requests access tokens for a given GitHub App installation from GitHub
 * 
 * @param {*} installationId GitHub App installation id to retrieve the tokens for
 * @param {*} jwt vaild jwt token for the installation
 * @param {*} end done callback
 */
function requestAccessTokens(installationId, jwt, end) {
    unirest.post(config.github.base + "/installations/" + installationId + "/access_tokens")
        .headers(ghRequestHeaders.createBearerHeaders(jwt))
        .end((response) => {
            if(response.ok) {
                end(response.body.token)
            } else {
                logger.log("error", "error retrieving api token: " + response.body.message)
                end(null, response);
            }
        })
}

/** Retrieve GitHub App installations for the current user from GitHub
 * 
 * @param {*} accessToken access token of the user
 * @param {*} end done callback
 */
function requestInstallations(accessToken, end) {
    unirest.get(config.github.base + "/user/installations")
        .headers(ghRequestHeaders.createTokenHeaders(accessToken))
        .end(function (response) {
            if (response.ok) {
                end(response.body.installations)
            } else {
                logger.log("error", "could not retrieve oauth resources: " + response.body.message)
                end(null, response)
            }
        });
}

module.exports = {
    configureBranch: configureBranch,
    createRepository: createRepository,
    addIssueLabel: addIssueLabel,
    requestAccessTokens: requestAccessTokens,
    requestInstallations: requestInstallations
}