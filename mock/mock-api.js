var logger = require('../server/log')
var config = require('../server/config')


function createRepositoryByTemplate(req, res) {    
	var repoName = req.body.repoName
	var repoTemplateName = req.body.repoTemplate
    
	var repoTemplate = config.getTemplates().repo[repoTemplateName]
    
	repoTemplate.config.name = repoName
    
	if (!repoName.match(new RegExp(repoTemplate.pattern))) {
		res.status(400)
		res.send('repository name does not match template pattern')
		return
	}
    
	logger.log('info', 'received create repo request')
	setTimeout(function() {
		//res.send({ html_url: "none" });
		res.send({ message: 'failed on something' })
	}, 1500)
}

function listOrganizations(req, res) {
	res.send([
		{
			'login': 'interesting-org',
			'url': 'https://api.github.com/orgs/github',
			'description': 'A great organization'
		},
		{
			'login': 'boring-org',
			'url': 'https://api.github.com/orgs/github',
			'description': 'A plain organization'
		},
		{
			'login': 'unicorn-org',
			'url': 'https://api.github.com/orgs/github',
			'description': 'An unusual organization'
		},
	])
}

function listTemplates(req, res) {
	res.send(config.getTemplates())
}


module.exports = {
	createRepositoryByTemplate: createRepositoryByTemplate,
	listOrganizations: listOrganizations,
	listTemplates: listTemplates
}