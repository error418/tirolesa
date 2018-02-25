var jwt = require('jsonwebtoken');
var fs = require('fs');

var logger = require('./log.js'); 
var config = require("./config");

var ghServiceApi = require("./github-service-api")

/** Constructs GitHub App API http headers
 * 
 * @param {*} apiToken construct header for given api token
 */
function getTokenHeaders(apiToken) {
    return {
        'User-Agent': config.application.name,
        'Accept': 'application/vnd.github.machine-man-preview+json',
        'Authorization': 'token ' + apiToken
    };
}

/** Factory for JWT token signers
 * 
 * @param {*} certificate private key to sign with
 */
function createJwtTokenFactory(certificate) {
    return {
        create: () => {
            var payload = {
                iss: config.github.appId
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
    return (installationId, done) => {
        ghServiceApi.requestAccessTokens(installationId, jwtTokenFactory.create(), (token, err) => {
            if(!err) {
                done({
                    token: token,
                    headers: getTokenHeaders(token)
                }, null);
            } else {
                logger.log("error", "error retrieving api token: " + err.body.message)
                done(null, err);
            }
        });
    }
}

/** Retrieves resources from initial OAuth request
 * 
 * @param {*} accessToken access token to use for retrieval
 * @param {*} done done function
 */
function getOAuthResources(accessToken, done) {
    ghServiceApi.requestInstallations(accessToken, (installations) => {
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
        
        done(resources)
    })
}

module.exports = function() {
    var certificate = fs.readFileSync(config.github.keyFile);  // get private key
    var jwtTokenFactory = createJwtTokenFactory(certificate);

    return {
        jwtTokenFactory: jwtTokenFactory,
        createBearer: createBearerFactory(jwtTokenFactory),
        getTokenHeaders: getTokenHeaders,
        getOAuthResources: getOAuthResources
    }
}