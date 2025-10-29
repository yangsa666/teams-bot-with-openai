const { adapter } = require('./adpater');
const { CardFactory } = require('botbuilder');
const {
    getConversationReferenceById,
    getConversationReferenceByAadId,
    getConversationReferenceByConversationName,
} = require('../utils/database');

/**
 * A function to send message to the bot
 * @param {TurnContext} context - The turn context
 * @param {string} conversationId - The conversation id, or aadObjectId, or username,
 * @param {string} msgType - The message type
 * @param {string} content - The message content
 * @return {Promise<Activity | null>} - The result of sending message
 */
async function sendMessage(context, conversationId, msgType, content) {
    try {
        // Find the conversation reference
        let conversationReference = null;
        if (isConversationId(conversationId)) {
            conversationReference = await getConversationReferenceById(conversationId);
        } else if (isAadObjectId(conversationId)) {
            conversationReference = await getConversationReferenceByAadId(conversationId);
        } else {
            conversationReference = await getConversationReferenceByConversationName(conversationId);
        }
        if (!conversationReference) {
            conversationReference = await getConversationReferenceById(conversationId);
        }

        if (!conversationReference) {
            console.error(`Conversation reference not found: ${conversationId}`);
            return null;
        }

        let sendMsgResult;
        // Send text message
        if (msgType === 'text') {
            await adapter.continueConversationAsync(process.env.BOT_APP_ID, conversationReference, async (context) => {
                sendMsgResult = await context.sendActivity(content);
            });
        }

        // Send message card
        if (msgType === 'card') {
            await adapter.continueConversationAsync(process.env.BOT_APP_ID, conversationReference, async (context) => {
                sendMsgResult = await context.sendActivity({
                    attachments: [CardFactory.adaptiveCard(content)],
                });
            });
        }
        return sendMsgResult;
    } catch (error) {
        console.error(`sendMessage error: ${error}`);
        return null;
    }
}

/**
 * check the conversationId is a valid aadObjectId
 * @param {string} conversationId conversation id
 * @return {boolean}
 */
function isAadObjectId(conversationId) {
    return conversationId.length === 36 && conversationId.indexOf('-') === 8 && conversationId.split('-').length === 5;
}

/**
 * check the conversationId is a valid conversationId
 * @param {string} conversationId conversation id
 * @return {boolean}
 */
function isConversationId(conversationId) {
    return conversationId.length > 36 && conversationId.includes(':');
}

module.exports = { sendMessage };
