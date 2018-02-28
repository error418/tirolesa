var yaml = require("yamljs")

var loadedConfig
function _loadPropertyFile() {
    if(!loadedConfig) {
        loadedConfig = yaml.load('config.yml')
        loadedConfig = _applyEnvironmentVariables(loadedConfig)
    }
    return loadedConfig
}

function _applyEnvironmentVariables(configSource) {
    let config = Object.assign({}, configSource);
    // override configuration with environment variables, if available
    config.github.oauth.id = process.env.GITHUB_OAUTH_ID || config.github.oauth.id
    config.github.oauth.secret = process.env.GITHUB_OAUTH_SECRET || config.github.oauth.secret
    config.github.appId = process.env.GITHUB_APPID || config.github.appId
    config.github.base = process.env.GITHUB_BASE || config.github.base
    
    config.application.port = process.env.APP_PORT || config.application.port
    config.session.secret = process.env.SESSION_SECRET || config.session.secret
    
    if (process.env.REDIS_HOST) {
        config.session.redis = {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            ttl: process.env.REDIS_TTL,
            logErrors: process.env.REDIS_LOG_ERRORS
        }
    }

    return config
}

function getTemplates() {
    return this._loadPropertyFile().template
}

function getGithubSettings() {
    return this._loadPropertyFile().github
}

function getSessionConfiguration() {
    return this._loadPropertyFile().session
}

function getApplicationSettings() {
    return this._loadPropertyFile().application
}

module.exports = {
    getTemplates: getTemplates,
    getGithubSettings: getGithubSettings,
    getSessionConfiguration: getSessionConfiguration,
    getApplicationSettings: getApplicationSettings,
    _applyEnvironmentVariables: _applyEnvironmentVariables,
    _loadPropertyFile: _loadPropertyFile
};