var logger=require('./log.js'); 

var jwt = require('jsonwebtoken');
var fs = require('fs');
var unirest = require("unirest");

module.exports = function (config) {
    var cert = fs.readFileSync(__dirname + "/" + config.github.keyFile);  // get private key
    
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
        unirest.post(config.github.base + "/installations/" + installationId + "/access_tokens")
            .headers({
                'User-Agent': config.application.name,
                'Accept': 'application/vnd.github.machine-man-preview+json',
                'Authorization': 'Bearer ' + createJWT()
            })
            .end(function (res) {
                if(res.ok) {
                    done({
                        token: res.body.token,
                        headers: getTokenHeaders(res.body.token)
                     }, null);
                } else {
                    logger.log("error", "error retrieving api token: " + res.body.message)
                    done(null, res);
                }
            }
        );
    }

    function getOAuthResources(accessToken, done) {
        unirest.get(config.github.base + "/user/installations")
            .headers(getTokenHeaders(accessToken))
            .end(function (response) {
                var resources = {
                    orgs: [],
                    installations: {}
                };

                if (response.ok) {
                    response.body.installations.forEach(function(org) {
                        var item = {
                            login: org.account.login,
                            type: org.account.type,
                            avatar: org.account.avatar_url
                        };
                
                        resources.orgs.push(item);
                        resources.installations[item.login] = org.id;
                    });
                } else {
                    logger.log("error", "could not retrieve oauth resources: " + res.body.message)
                }

                done(resources);
            });
    }

    return {
        createJWT: createJWT,
        createBearer: createBearer,
        getTokenHeaders: getTokenHeaders,
        getOAuthResources: getOAuthResources
    };
};