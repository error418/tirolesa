var logger = require('../server/log')

process.on('unhandledRejection', (err) => {
	/* eslint-disable no-console */
	console.log(err)
	/* eslint-enable no-console */
})

// disable logging for tests
logger.clear()