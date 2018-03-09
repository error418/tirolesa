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
 */
function configureBranch(bearer, orgName, repoName, branchName, templateConfig) {
    return new Promise((resolve, reject) => {
        unirest.put(config.getGithubSettings().base + "/repos/"+orgName+"/"+repoName+"/branches/"+branchName+"/protection")
            .headers(bearer.headers)
            .type('json')
            .send(templateConfig)
            .end((response) => {
                if(response.ok) {
                    resolve(response.body)
                } else {
                    reject(response.body.message)
                }
            })
    })
}

/** Creates a repository using the GitHub API
 * 
 * @param {*} bearer bearer token
 * @param {*} orgName organization name
 * @param {*} repositoryConfig repository configuration (this is the API request sent to GitHub)
 */
function createRepository(bearer, orgName, repositoryConfig) {
    return new Promise((resolve, reject) => {
        unirest.post(config.getGithubSettings().base + "/orgs/"+orgName+"/repos")
            .headers(bearer.headers)
            .type('json')
            .send(repositoryConfig)
            .end((response) => {
                if(response.ok) {
                    resolve(response.body)
                } else {
                    reject(response.body.message)
                }
            })
    })
}
    
/** Adds an Issue Label to a repository using the GitHub API
 * 
 * @param {*} bearer bearer token
 * @param {*} orgName organization name
 * @param {*} repoName repository name
 * @param {*} label label configuration (this is the API request sent to GitHub)
 */
function addIssueLabel(bearer, orgName, repoName, label) {
    return new Promise((resolve, reject) => {

        unirest.post(config.getGithubSettings().base + "/repos/"+orgName+"/"+repoName+"/labels")
            .headers(bearer.headers)
            .type('json')
            .send(label)
            .end((response) => {
                if(response.ok) {
                    resolve(response.body)
                } else {
                    reject(response.body.message)
                }
            })
    })
}

/** Requests access tokens for a given GitHub App installation from GitHub
 * 
 * @param {*} installationId GitHub App installation id to retrieve the tokens for
 * @param {*} jwt vaild jwt token for the installation
 */
function requestAccessTokens(installationId, jwt) {
    return new Promise((resolve, reject) => {
        unirest.post(config.getGithubSettings().base + "/installations/" + installationId + "/access_tokens")
        .headers(ghRequestHeaders.createBearerHeaders(jwt))
        .end((response) => {
            if(response.ok) {
                resolve(response.body.token)
            } else {
                reject(response.body.message)
            }
        })
    })
}

/** Retrieve GitHub App installations for the current user from GitHub
 * 
 * @param {*} accessToken access token of the user
 */
function requestInstallations(accessToken) {
    return new Promise((resolve, reject) => {
        unirest.get(config.getGithubSettings().base + "/user/installations")
        .headers(ghRequestHeaders.createTokenHeaders(accessToken))
        .end((response) => {
            if (response.ok) {
                resolve(response.body.installations)
            } else {
                try {
                    reject(response.body.message)
                } catch(err) {
                    logger.log("error", response)
                    reject("GitHub rejected the request")
                }
            }
        });
    })
}
    
module.exports = {
    configureBranch: configureBranch,
    createRepository: createRepository,
    addIssueLabel: addIssueLabel,
    requestAccessTokens: requestAccessTokens,
    requestInstallations: requestInstallations
}