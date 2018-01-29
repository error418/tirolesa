var jwt = require('jsonwebtoken');
var fs = require('fs'); 

module.exports = function (config) {
    var cert = fs.readFileSync(__dirname + "/" + config.github.keyFile);  // get private key
    
    function createJWT() {
        var payload = {
            iss: config.github.appId
        };

        var token = jwt.sign(payload, cert, { expiresIn: "1m", algorithm: 'RS256'});

        return token;
    }

    return {
        createJWT: createJWT
    };
};