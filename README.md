# Microsoft Teams Bot Template (Node.js)

This is a template project for developing Microsoft Teams bots using Node.js. It provides a complete infrastructure and common functionalities to help you quickly get started with Teams bot development.

## Features

- Basic message handling and response
- Command processing system (e.g., `/command1`, `/cardtest`)
- Adaptive Cards support
- Conversation reference storage and management
- Proactive messaging functionality
- Error handling and logging
- Health check endpoint
- MongoDB data persistence
- Docker containerization deployment support
- Streaming conversation with OpenAI or Azure OpenAI

## Tech Stack

- **Node.js** - Runtime environment
- **Bot Framework SDK v4** - Bot development framework
- **MongoDB** - Data storage
- **Restify** - Web server
- **Docker** - Containerization deployment
- **OpenAI/Azure OpenAI** - AI conversation capabilities

## Installation and Configuration

### Prerequisites

- Node.js 22+
- npm
- MongoDB (local or remote)
- Microsoft Teams developer account
- (Optional) Docker and Docker Compose

### Local Development Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd teams-bot-template-nodejs
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file and fill in the necessary configuration information:
   - `BOT_APP_ID`: The Microsoft App ID of the bot
   - `BOT_APP_PASSWORD`: The Microsoft App password of the bot
   - `BOT_TENANT_ID`: Tenant ID
   - `DB_USER`: Database username
   - `DB_PASSWORD`: Database password
   - Adjust other configuration items as needed

5. Start the application
   ```bash
   npm start
   ```

## Docker Deployment

### Using Docker Compose (Recommended)

1. Ensure the `.env` file is configured (as mentioned above)

2. Edit `docker-compose.yml` to ensure the initial MongoDB username and password match the `DB_USER` and `DB_PASSWORD` in the `.env` file

3. Build and start containers
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. The application will run on port 3978, and MongoDB will run on port 27017

### Manual Docker Deployment

1. Build the Docker image
   ```bash
   docker build -t teams-bot-template .
   ```

2. Run the container
   ```bash
   docker run -p 3978:3978 --env-file .env teams-bot-template
   ```

## Environment Variables

| Environment Variable | Description | Default Value |
|----------------------|-------------|---------------|
| TAG | Deployment environment (dev/prod) | prod |
| BOT_NAME | Bot name (must match the name displayed in Teams) | MyTeamsBot |
| BOT_APP_ID | Bot's Microsoft App ID | - |
| BOT_APP_PASSWORD | Bot's Microsoft App password | - |
| BOT_TENANT_ID | Microsoft 365 tenant ID | - |
| DB_HOST | MongoDB host address | mongodb |
| DB_PORT | MongoDB port | 27017 |
| DB_NAME | Database name | myteamsbot |
| DB_USER | Database username | - |
| DB_PASSWORD | Database password | - |
| DB_CONVERSATIONREFERENCE_COLLECTION_NAME | Conversation reference collection name | conversationReference |
| OPENAI_API_KEY | OpenAI or Azure OpenAI API key | - |
| OPENAI_MODEL | OpenAI model name | gpt-3.5-turbo |
| OPENAI_AZURE_BASE_URL | Azure OpenAI base URL (leave empty for standard OpenAI) | - |
| ENABLE_STREAMING | Enable streaming responses from AI | true |

## Project Structure

```
├── bots/
│   ├── adapter.js      # Bot Framework adapter configuration
│   ├── bot.js          # Main bot logic
│   └── sendMessage.js  # Proactive messaging functionality
├── models/
│   └── streaming.js    # Streaming functionality models and utilities
├── utils/
│   ├── database.js     # Database operation related functions
│   └── openaiClient.js # OpenAI client for AI conversations
├── index.js            # Application entry point
├── package.json        # Project dependencies and scripts
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Docker build file
└── .env.example        # Environment variable example file
```

## Usage Examples

### Basic Messages and Commands

The bot supports the following predefined commands:

- `/command1`: Triggers command 1 response
- `/cardtest`: Sends an adaptive card example

### AI Conversation

By default, any message not recognized as a command will be processed by the AI conversation engine.
- The bot supports both standard OpenAI and Azure OpenAI endpoints
- Streaming responses are enabled by default (`ENABLE_STREAMING=true`)
- The streaming feature provides real-time typing indicators and progressive response delivery

### Extending Bot Functionality

1. In `bots/bot.js`, you can:
   - Add more command handlers
   - Customize card content
   - Implement more message processing logic

2. Using the proactive messaging feature:
   ```javascript
   const { sendMessage } = require('./bots/sendMessage');
   
   // Send text message
   await sendMessage(null, conversationId, 'text', 'Hello from Teams bot!');
   
   // Send adaptive card
   const cardContent = {
     type: 'AdaptiveCard',
     body: [
       { type: 'TextBlock', text: 'Hello Card' }
     ],
     $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
     version: '1.6'
   };
   await sendMessage(null, conversationId, 'card', cardContent);
   ```

## Debugging

1. Use Bot Framework Emulator for local debugging
2. Check console output for log information
3. Examine conversation reference data in MongoDB

## Health Check

The application provides a health check endpoint:
```
GET /api/health
```

## Contributing

Pull requests and issues are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://opensource.org/licenses/MIT)