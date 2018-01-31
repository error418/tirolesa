var jwt = require('jsonwebtoken');
var fs = require('fs'); 

module.exports = function (config) {
    var cert = fs.readFileSync(__dirname + "/" + config.github.keyFile);  // get private key
    
    function getDefaultHeaders(apiToken) {
        return {
            'User-Agent': 'thelemic',
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

    function createApiToken(installationId, done) {
        unirest.post(config.github.base + "/installations/" + installationId + "/access_tokens")
            .headers({
                'User-Agent': 'thelemic',
                'Accept': 'application/vnd.github.machine-man-preview+json',
                'Authorization': 'Bearer ' + createJWT()
            })
            .end(function (res) {
                if(res.ok) {
                    done({
                        token: res.body.token,
                        headers: getDefaultHeaders(res.body.token)
                     }, null);
                } else {
                    console.log("error retrieving api token")
                    done(null, res);
                }
            }
        );
    }

    return {
        createJWT: createJWT,
        createApiToken: createApiToken
    };
};