var logger = require('../server/log')

process.on('unhandledRejection', (err) => { 
	console.log(err)
})

// disable logging for tests
logger.clear()