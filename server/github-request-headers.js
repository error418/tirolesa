var config = require("./config")

/** Constructs GitHub App API http headers
 * 
 * @param {*} apiToken construct header for given api token
 */
function createTokenHeaders(apiToken) {
    return {
        'User-Agent': config.getApplicationSettings().name,
        'Accept': 'application/vnd.github.machine-man-preview+json',
        'Authorization': 'token ' + apiToken
    };
}

/** Constructs http headers for a Bearer jwt token
 * 
 * @param {*} jwtToken JWT token to use
 */
function createBearerHeaders(jwtToken) {
    return {
        'User-Agent': config.getApplicationSettings().name,
        'Accept': 'application/vnd.github.machine-man-preview+json',
        'Authorization': 'Bearer ' + jwtToken
    }
}

module.exports = {
    createTokenHeaders: createTokenHeaders,
    createBearerHeaders: createBearerHeaders
}