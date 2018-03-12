var logger = require('./server/log')
var tirolesaServer = require('./server/tirolesa-server.js')

process.on('unhandledRejection', (err) => { 
	logger.log('error', err)
})

tirolesaServer.run()