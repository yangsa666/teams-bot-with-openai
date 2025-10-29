// @ts-check
const path = require('path');
const restify = require('restify');

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const { adapter } = require('./bots/adpater');
const { MyTeamsBot } = require('./bots/bot');

// Create the Bot instance.
const bot = new MyTeamsBot();

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Listen for incoming requests.
server.post('/api/messages', async (req, res) => {
    // Log the request headers and body for debugging purposes
    if (process.env.TAG === 'dev') {
        console.log('Recevied request headers', req.headers.authorization);
        console.log('Received request body:', req.body);
    }
    // Route received a request to adapter for processing
    await adapter.process(req, res, (context) => bot.run(context));
});

// Listen for health check requests.
server.get('/api/health', async (req, res) => {
    res.send(200, 'OK');
    console.log('Health check OK');
});

// You can add more endpoints for your bot here, for example, to send proactive messages.
