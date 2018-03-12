var logger = require('./log.js') 
var ghServiceApi = require('./github-service-api')

var config = require('./config')
var ghTokens = require('./github-tokens')

/** Creates a repository from a template
 * 
 * @param {*} req http request
 * @param {*} res http response
 */
function createRepositoryByTemplate(req, res) {    
	var orgName = req.body.orgName
	var repoName = req.body.repoName
	var repoTemplateName = req.body.repoTemplate
	var branchTemplateName = req.body.branchTemplate    
    
	var repoTemplate = config.getTemplates().repo[repoTemplateName]
	var branchTemplate = config.getTemplates().branch[branchTemplateName]
    
	repoTemplate.config.name = repoName
    
	if (!repoName.match(new RegExp(repoTemplate.pattern))) {
		res.status(400)
		res.send({
			message: 'repository name does not match template pattern'
		})
		return
	}

	if (!orgName || !req.user.installations[orgName]) {
		res.status(400)
		res.send({
			message: 'repository is not accessible'
		})
		return
	}

	var installationId = req.user.installations[orgName]
    
	ghTokens.createBearer(installationId)
		.then((bearer) => {
			// create repository
			ghServiceApi.createRepository(bearer, orgName, repoTemplate.config)
				.then((createRepoResponse) => {
					var promises = []

					if (branchTemplate.config && branchTemplate.branch) {
						// configure branches by using chosen template
						promises.push(ghServiceApi.configureBranch(bearer, orgName, repoName, branchTemplate.branch, branchTemplate.config))
					}
                    
					// create additional issue labels by template
					promises.push(createIssueLabelsFromTemplate(bearer, orgName, repoName, repoTemplate.label))
                    
					Promise
						.all(promises)
						.then(() => {
							res.status(200)
							res.send({
								html_url: createRepoResponse.html_url
							})
						})
						.catch((err) => {
							logger.log('info', 'failed to configure repository: ' + err)
							res.status(400)
							res.send({
								message: 'Was not able to configure repository. ' + err.body.message
							})
						})
				})
				.catch((err) => {
					logger.log('info', 'failed to create repository: ' + err)
					res.status(400)
					res.send({
						message: 'Was not able to create repository. ' + err.body.message
					})
				})
		})
		.catch((err) => {
			logger.log('info', 'failed to retrieve bearer token ' + err)
			res.status(400)
			res.send({
				message: 'Was not able to retrieve bearer token.'
			})
		})
}

/** Lists organizations for the current user
 * 
 * @param {*} req http request
 * @param {*} res http response
 */
function listOrganizations(req, res) {
	res.send(req.user.orgs)
}

/** Lists the available templates from configuration
 * 
 * @param {*} req http request
 * @param {*} res http response
 */
function listTemplates(req, res) {
	res.send(config.getTemplates())
}

/** Adds issue labels from a template for a given repository
 * 
 * @param {*} bearer bearer token
 * @param {*} orgName organization name
 * @param {*} repoName repository name
 * @param {*} labels labels to add
 * @param {*} end done callback
 */
function createIssueLabelsFromTemplate(bearer, orgName, repoName, labels) {
	return new Promise((resolve, reject) => {

		if(!labels) {
			resolve()
			return
		}
        
		var promises = []

		for(var i = 0; i < labels.length; i++) {
			((item) => {
				promises.push(ghServiceApi.addIssueLabel(bearer, orgName, repoName, labels[item]))
			})(i)
		}

		Promise
			.all(promises)
			.then(() => {
				resolve()
			})
			.catch((err) => {
				logger.log('info', 'failed to create issue label: ' + err)
				reject(err)
			})  
	})
}

module.exports = {
	createRepositoryByTemplate: createRepositoryByTemplate,
	listOrganizations: listOrganizations,
	listTemplates: listTemplates,
	_createIssueLabelsFromTemplate: createIssueLabelsFromTemplate
}