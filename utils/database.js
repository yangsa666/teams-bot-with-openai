const { MongoClient } = require('mongodb');
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || '27017';
const dbName = process.env.DB_NAME || 'kustobuddy';
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbConnectionString =
    process.env.TAG === 'dev'
        ? `mongodb://localhost:${dbPort}`
        : `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}`;

const client = new MongoClient(dbConnectionString);
const db = client.db(dbName);
const conversationReferenceCollection = db.collection(process.env.DB_CONVERSATIONREFERENCE_COLLECTION_NAME);

/**
 * A function to get conversation reference from the database
 * @param {object} coversationReference - The conversation id
 * @return {Promise<WithId<Document> | null>} - The conversation reference
 */
async function updateConversationReferenceInDb(coversationReference) {
    const filter = { 'conversation.id': coversationReference.conversation.id };
    const update = {
        $set: coversationReference,
    };
    const options = { upsert: true };
    await client.connect();
    const result = await conversationReferenceCollection.updateOne(filter, update, options);
    await client.close();
    return result;
}

/**
 * A function to get conversation reference from the database
 * @param {string} conversationId - The conversation id
 * @return {Promise<WithId<Document> | null>} - The conversation reference
 */
async function getConversationReferenceById(conversationId) {
    const filter = { 'conversation.id': conversationId };
    await client.connect();
    const result = await conversationReferenceCollection.findOne(filter);
    await client.close();
    return result;
}

/**
 * A function to get conversation reference from the database
 * @param {string} aadObjectId - The AAD Id
 * @return {Promise<WithId<Document> | null>} - The conversation reference
 */
async function getConversationReferenceByAadId(aadObjectId) {
    const filter = {
        'user.aadObjectId': aadObjectId,
        'conversation.conversationType': 'personal',
    };
    await client.connect();
    const result = await conversationReferenceCollection.findOne(filter);
    await client.close();
    return result;
}

/**
 * A function to get conversation reference from the database
 * @param {string} conversationName - The AAD Id
 * @return {Promise<WithId<Document> | null>} - The conversation reference
 */
async function getConversationReferenceByConversationName(conversationName) {
    const filterConversationName = {
        'conversation.name': conversationName,
        'conversation.conversationType': 'personal',
    };

    const filterUserName = {
        'user.name': conversationName,
    };

    await client.connect();
    const result =
        (await conversationReferenceCollection.findOne(filterConversationName)) ??
        (await conversationReferenceCollection.findOne(filterUserName));
    await client.close();
    return result;
}

/**
 * A function to remove conversation reference from the database
 * @param {string} conversationId - The conversation id
 * @return {Promise<WithId<Document> | null>} - The conversation reference
 */
async function removeConversationReferenceById(conversationId) {
    const filter = { 'conversation.id': conversationId };
    await client.connect();
    const result = await conversationReferenceCollection.deleteOne(filter);
    await client.close();
    return result;
}

module.exports = {
    updateConversationReferenceInDb,
    getConversationReferenceById,
    getConversationReferenceByAadId,
    getConversationReferenceByConversationName,
    removeConversationReferenceById,
};
