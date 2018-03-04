var jwt = require('jsonwebtoken');
var fs = require('fs');

var logger = require('./log.js'); 
var config = require("./config");

var ghServiceApi = require("./github-service-api")
var ghRequestHeaders = require("./github-request-headers")

/** Factory for JWT token signers
 * 
 * @param {*} certificate private key to sign with
 */
function createJwtTokenFactory(certificate, appId) {
    return {
        create: () => {
            var payload = {
                iss: appId
            };
            
            var token = jwt.sign(payload, certificate, { expiresIn: "1m", algorithm: 'RS256'});
            
            return token;
        }
    }
}

/** Builds Bearer token retrieval function.
 * 
 *  The retrieval function retrieves the bearer from the GitHub API and prepares contents for usage
 */
function createBearerFactory(jwtTokenFactory) {
    return async (installationId) => {
        return new Promise((resolve, reject) => {
            ghServiceApi.requestAccessTokens(installationId, jwtTokenFactory.create())
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
}

/** Retrieves resources from initial OAuth request
 * 
 * @param {*} accessToken access token to use for retrieval
 * @param {*} done done function
 */
function getOAuthResources(accessToken) {
    return new Promise((resolve, reject) => {
        try {
            var installations = await (ghServiceApi.requestInstallations(accessToken))
            
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
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = () => {
    var githubConfig = config.getGithubSettings()
    var certificate = fs.readFileSync(githubConfig.keyFile);  // get private key
    var jwtTokenFactory = createJwtTokenFactory(certificate, githubConfig.appId);

    return {
        jwtTokenFactory: jwtTokenFactory,
        createBearer: createBearerFactory(jwtTokenFactory),
        getOAuthResources: getOAuthResources
    }
}