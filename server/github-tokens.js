var jwt = require('jsonwebtoken');
var fs = require('fs');

var logger = require('./log.js'); 
var config = require("./config");

var ghServiceApi = require("./github-service-api")
var ghRequestHeaders = require("./github-request-headers")

var certificate

/** Factory for JWT token signers
 * 
 * @param {*} certificate private key to sign with
 */
function createJwtToken() {
    if(!certificate) {
        certificate = fs.readFileSync(config.getGithubSettings().keyFile);  // get private key
    }
    
    var payload = {
        iss: config.getGithubSettings().appId
    };
    
    var token = jwt.sign(payload, certificate, { expiresIn: "1m", algorithm: 'RS256'});
    
    return token;
}

/** Builds Bearer token retrieval function.
 * 
 *  The retrieval function retrieves the bearer from the GitHub API and prepares contents for usage
 */
function createBearer(installationId) {
    return new Promise((resolve, reject) => {
        ghServiceApi.requestAccessTokens(installationId, createJwtToken())
            .then((token) => {
                resolve({
                    token: token,
                    headers: ghRequestHeaders.createTokenHeaders(token)
                })
            })
            .catch((err) => {
                reject(err);
            })
    })
}

/** Retrieves resources from initial OAuth request
 * 
 * @param {*} accessToken access token to use for retrieval
 * @param {*} done done function
 */
function getOAuthResources(accessToken) {
    return new Promise((resolve, reject) => {
        ghServiceApi.requestInstallations(accessToken)
            .then((installations) => {
                var resources = {
                    orgs: [],
                    installations: {}
                }
                
                installations.forEach(function(org) {
                    var item = {
                        login: org.account.login,
                        type: org.account.type,
                        avatar: org.account.avatar_url
                    };
                    
                    resources.orgs.push(item);
                    resources.installations[item.login] = org.id;
                });
                
                resolve(resources)
            })
            .catch((err) => {
                reject(err)
            })
    })
}


module.exports = {
    createBearer: createBearer,
    getOAuthResources: getOAuthResources,
    _createJwtToken: createJwtToken
}