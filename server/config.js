var yaml = require("yamljs")
var config = yaml.load('config.yml')

// override configuration with environment variables, if available
config.github.oauth.id = process.env.GITHUB_OAUTH_ID || config.github.oauth.id
config.github.oauth.secret = process.env.GITHUB_OAUTH_SECRET || config.github.oauth.secret
config.github.appId = process.env.GITHUB_APPID || config.github.appId
config.github.base = process.env.GITHUB_BASE || config.github.base

config.application.port = process.env.APP_PORT || config.application.port
config.session.secret = process.env.SESSION_SECRET || config.session.secret

module.exports = config;