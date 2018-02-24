var unirest = require("unirest");
var config = require("./config")

function configureBranch(bearer, orgName, repoName, branchName, templateConfig, end) {
    unirest.put(config.github.base + "/repos/"+orgName+"/"+repoName+"/branches/"+branchName+"/protection")
        .headers(bearer.headers)
        .type('json')
        .send(templateConfig)
        .end(end);
}

function createRepository(bearer, orgName, repositoryConfig, end) {
    unirest.post(config.github.base + "/orgs/"+orgName+"/repos")
        .headers(bearer.headers)
        .type('json')
        .send(repositoryConfig)
        .end(end);
}

function addIssueLabel(bearer, orgName, repoName, label, end) {
    unirest.post(config.github.base + "/repos/"+orgName+"/"+repoName+"/labels")
        .headers(bearer.headers)
        .type('json')
        .send(label)
        .end(end)
}

function requestAccessTokens(installationId, jwt, end) {
    unirest.post(config.github.base + "/installations/" + installationId + "/access_tokens")
        .headers({
            'User-Agent': config.application.name,
            'Accept': 'application/vnd.github.machine-man-preview+json',
            'Authorization': 'Bearer ' + jwt
        })
        .end((res) => {
            if(res.ok) {
                end(res.body.token)
            } else {
                logger.log("error", "error retrieving api token: " + res.body.message)
                end(null, res);
            }
        })
}

function requestInstallations(accessToken, end) {
    unirest.get(config.github.base + "/user/installations")
        .headers(getTokenHeaders(accessToken))
        .end(function (response) {
            var resources = {
                orgs: [],
                installations: {}
            };

            if (response.ok) {
                end(response.body.installations)
            } else {
                logger.log("error", "could not retrieve oauth resources: " + res.body.message)
            }

            end(resources);
        });
}

module.exports = {
    configureBranch: configureBranch,
    createRepository: createRepository,
    addIssueLabel: addIssueLabel,
    requestAccessTokens: requestAccessTokens,
    requestInstallations: requestInstallations
}