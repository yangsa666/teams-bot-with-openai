// @ts-check
const { ActivityHandler, ActivityTypes, CardFactory, MessageFactory, TurnContext } = require('botbuilder');
const { updateConversationReferenceInDb } = require('../utils/database');
const { OpenAIClient } = require('../utils/openaiClient');
const { StreamType, ChannelData } = require('../models/streaming');

// You may customize this Welcome message to your liking.
const WELCOME_TEXT = 'Welcome to this Teams bot!';

// Create the bot class that extends the ActivityHandler class.
class MyTeamsBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            // send bot typing indicator before replying message
            await context.sendActivities([
                { type: ActivityTypes.Typing },
                // {type: 'delay', value: 1000},
            ]);

            // Check if recipent is the Bot, do not reply if not
            const botName = process.env.BOT_NAME;
            const recipientName = context.activity.recipient.name;

            // IMPORTANT: In group chat or channel, the recipient name is the bot name
            // Please keep the bot name defined in .env consistent with the name shown in Teams
            if (recipientName !== botName) {
                console.log('Not sent to bot in the message');
                return;
            }

            // If you need to do access control for the bot user, you can do it here

            // Update conversation reference in the database
            const conversationRefrence = TurnContext.getConversationReference(context.activity);
            await updateConversationReferenceInDb(conversationRefrence);

            const removedMentionText = TurnContext.removeRecipientMention(context.activity);
            if (removedMentionText) {
                // Remove the line break for command parsing
                const loweredText = removedMentionText.toLowerCase().replace(/\n|\r/g, '').trim();
                if (loweredText === '/command1') {
                    await context.sendActivity('You have triggered command 1!');
                    return;
                }

                // To handle the raw message, you can use removedMentionText
                if (loweredText === '/cardtest') {
                    const card = CardFactory.adaptiveCard({
                        type: 'AdaptiveCard',
                        body: [
                            {
                                type: 'TextBlock',
                                size: 'Medium',
                                weight: 'Bolder',
                                text: 'This is a card title',
                            },
                            {
                                type: 'TextBlock',
                                text: 'This is a card content body',
                                wrap: true,
                            },
                        ],
                        actions: [
                            {
                                type: 'Action.OpenUrl',
                                title: 'Action button',
                                url: '${viewUrl}',
                            },
                        ],
                        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                        version: '1.6',
                    });
                    const cardMessage = MessageFactory.attachment(card);
                    await context.sendActivity(cardMessage);
                    return;
                }

                // Create an instance of OpenAIClient
                const openaiClient = new OpenAIClient({
                    apiKey: process.env.OPENAI_API_KEY || '',
                    model: process.env.OPENAI_MODEL,
                    azureBaseUrl: process.env.OPENAI_AZURE_BASE_URL,
                });

                // Check if streaming is enabled in environment variables
                const streamingEnabled = process.env.ENABLE_STREAMING === 'true';

                try {
                    if (streamingEnabled) {
                        // Generate response with streaming

                        let contentBuilder = ''; // Initialize content that will be streamed back to the user
                        let streamSequence = 1; // Sequence for streaming events
                        const rps = 1000; // 1 RPS (Requests per second) - controls streaming rate

                        // Prepare the initial informative message
                        // @ts-ignore
                        let channelData = new ChannelData({
                            streamType: StreamType.Informative, // Indicating this is the start of the stream
                            streamSequence: streamSequence,
                        });

                        // Build and send an initial streaming activity
                        let streamId = await this.buildAndSendStreamingActivity(
                            context,
                            'Getting the information...',
                            channelData
                        );

                        // Make the OpenAI API request and enable streaming
                        const events = await openaiClient.generateResponse(removedMentionText, {
                            stream: true,
                        });

                        // Initialize a stopwatch to manage requests per second
                        const stopwatch = new Date();

                        // Iterate over the streamed events from OpenAI
                        // @ts-ignore
                        for await (const event of events) {
                            streamSequence++; // Increment the sequence for each new chunk of data

                            // Loop through the choices in each event
                            for (const choice of event.choices) {
                                // If streaming is finished, send the final response and break out of the loop
                                if (choice.finish_reason !== null) {
                                    channelData.streamType = StreamType.Final; // Mark the stream as finished
                                    channelData.streamSequence = streamSequence;
                                    channelData.streamId = streamId;

                                    await this.buildAndSendStreamingActivity(context, contentBuilder, channelData);
                                    break;
                                }

                                // Append the streamed content to the builder
                                if (choice.delta && choice.delta.content) {
                                    contentBuilder += choice.delta.content;
                                }

                                // If RPS rate reached, send the current content chunk
                                // @ts-ignore
                                if (contentBuilder.length > 0 && new Date() - stopwatch > rps) {
                                    channelData.streamType = StreamType.Streaming; // Indicating this is a streaming update
                                    channelData.streamSequence = streamSequence;
                                    channelData.streamId = streamId;

                                    await this.buildAndSendStreamingActivity(context, contentBuilder, channelData);
                                    stopwatch.setTime(new Date().getTime()); // Reset the stopwatch after sending a chunk
                                }
                            }
                        }
                    } else {
                        // Generate non-streaming response
                        const response = await openaiClient.generateResponse(removedMentionText);
                        await context.sendActivity(response);
                    }
                } catch (error) {
                    console.error('Error generating response:', error);
                    await context.sendActivity(
                        'I apologize, but I encountered an error while processing your request. Please try again later.'
                    );
                }
            }

            // Check value if it's submitted by a message card
            if (context.activity.value) {
                const from = context.activity.from;
                // eslint-disable-next-line no-unused-vars
                const messageId = context.activity.replyToId;
                const value = context.activity.value;
                console.log('Message is from: ' + from.name + ' Value:', value);
                console.log('replyToId: ', context.activity.replyToId);
                // Here you can add your logic to handle different card submissions
            }
            await next();
        });

        // Handle members being added to the conversation.
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded ?? [];
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    // await context.sendActivity(WELCOME_TEXT);
                    // const conversationRefrence = TurnContext.getConversationReference(context.activity);
                    // await updateConversationReferenceInDb(conversationRefrence);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // Handle installation update event
        this.onInstallationUpdate(async (context, next) => {
            // When the bot is installed to a team or personal scope, send a welcome message
            // TODO: Ensure to handle uninstall event if needed
            await context.sendActivity(WELCOME_TEXT);
            const conversationRefrence = TurnContext.getConversationReference(context.activity);
            await updateConversationReferenceInDb(conversationRefrence);
            await next();
        });
    }
    // Build and send a streaming activity (either ongoing or final)
    /**
     *
     * @param {TurnContext} turnContext
     * @param {string} text
     * @param {ChannelData} channelData
     * @returns
     */
    async buildAndSendStreamingActivity(turnContext, text, channelData) {
        const isStreamFinal = channelData.streamType === StreamType.Final; // Check if this is the final part of the stream

        // Set up the basic streaming activity (either typing or a message)
        const streamingActivity = {
            type: isStreamFinal ? 'message' : 'typing', // 'typing' indicates the bot is working, 'message' when final
            id: channelData.streamId,
        };

        // Add the streaming information as an entity
        // @ts-ignore
        streamingActivity.entities = [
            {
                type: 'streaminfo',
                streamId: channelData.streamId,
                streamType: channelData.streamType.toString(),
                streamSequence: channelData.streamSequence,
            },
        ];

        // If it's the final stream, attach an AdaptiveCard with the result
        if (isStreamFinal) {
            // @ts-ignore
            streamingActivity.text = text;
        } else if (text) {
            // Set text only for non-final (intermediate) messages if needed
            // @ts-ignore
            streamingActivity.text = text;
        }

        // Send the streaming activity (either ongoing or final)
        return await this.sendStreamingActivity(turnContext, streamingActivity);
    }

    // Send the streaming activity to the user
    /**
     *
     * @param {TurnContext} turnContext
     * @param {*} streamingActivity
     * @returns
     */
    async sendStreamingActivity(turnContext, streamingActivity) {
        try {
            const response = await turnContext.sendActivity(streamingActivity);
            // @ts-ignore
            return response.id; // Return the activity ID for tracking
        } catch (error) {
            // If an error occurs during sending, inform the user
            await turnContext.sendActivity(
                // @ts-ignore
                MessageFactory.text('Error while sending streaming activity: ' + error.message)
            );
            // @ts-ignore
            throw new Error('Error sending activity: ' + error.message); // Propagate error
        }
    }
}

module.exports.MyTeamsBot = MyTeamsBot;
