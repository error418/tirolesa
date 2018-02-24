var jwt = require('jsonwebtoken');
var fs = require('fs');

var logger = require('./log.js'); 
var config = require("./config");

var ghServiceApi = require("./github-service-api")

module.exports = function () {
    var cert = fs.readFileSync(config.github.keyFile);  // get private key
    
    function getTokenHeaders(apiToken) {
        return {
            'User-Agent': config.application.name,
            'Accept': 'application/vnd.github.machine-man-preview+json',
            'Authorization': 'token ' + apiToken
        };
    }

    function createJWT() {
        var payload = {
            iss: config.github.appId
        };

        var token = jwt.sign(payload, cert, { expiresIn: "1m", algorithm: 'RS256'});

        return token;
    }

    function createBearer(installationId, done) {
        ghServiceApi.requestAccessTokens(installationId, createJWT(), (token, err) => {
                if(!err) {
                    done({
                        token: token,
                        headers: getTokenHeaders(token)
                     }, null);
                } else {
                    logger.log("error", "error retrieving api token: " + err.body.message)
                    done(null, err);
                }
            }
        );
    }

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

    return {
        createJWT: createJWT,
        createBearer: createBearer,
        getTokenHeaders: getTokenHeaders,
        getOAuthResources: getOAuthResources
    };
};