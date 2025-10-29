const { OpenAI } = require('openai');

/*
 * OpenAIClient provides a unified interface for interacting with OpenAI or Azure OpenAI endpoints.
 * It supports both single-turn and multi-turn (context-aware) chat completions.
 */
class OpenAIClient {
    /**
     * Creates an instance of OpenAIClient.
     * @param {Object} config - Configuration object.
     * @param {string} config.apiKey - API key for OpenAI or Azure OpenAI.
     * @param {string} [config.model='gpt-5-chat'] - Model name for standard OpenAI.
     * @param {string} [config.azureBaseUrl=''] - Azure OpenAI base URL; if provided, switches to Azure mode.
     */
    constructor(config) {
        // Destructure configuration with defaults
        const { apiKey, model = 'gpt-5-chat', azureBaseUrl = '' } = config;

        // Initialize OpenAI client based on whether it's Azure or standard OpenAI
        if (azureBaseUrl) {
            this.openai = new OpenAI({
                baseURL: azureBaseUrl,
                apiKey: apiKey,
            });
            // For Azure, the model name might be different or we might need to use deployment name
            this.model = model;
            this.isAzure = true;
        } else {
            this.openai = new OpenAI({
                apiKey: apiKey,
            });
            this.model = model;
        }
    }

    /**
     * Generates a chat response for a single user prompt.
     * @param {string} prompt - The user's input prompt.
     * @param {Object} [options={}] - Optional configuration for the response generation.
     * @param {boolean} [options.stream=false] - Whether to enable streaming response.
     * @returns {Promise<string|Object>} The generated response text or a streaming response object if stream is enabled.
     * @throws {Error} If the API call fails.
     */
    async generateResponse(prompt, options = {}) {
        try {
            const { stream = false } = options;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant integrated with Microsoft Teams.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 4000,
                stream: stream,
            });

            // If streaming is enabled, return the stream object
            if (stream) {
                return response;
            }

            // Otherwise return the text content
            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error generating response from OpenAI:', error);
            throw new Error('Failed to generate response from OpenAI API');
        }
    }

    /**
     * Generates a chat response with conversation context.
     * @param {Array<Object>} messages - Array of previous conversation messages, each with `role` and `content`.
     * @param {Object} [options={}] - Optional configuration for the response generation.
     * @param {boolean} [options.stream=false] - Whether to enable streaming response.
     * @returns {Promise<string|Object>} The generated response text or a streaming response object if stream is enabled.
     * @throws {Error} If the API call fails.
     */
    async generateResponseWithContext(messages, options = {}) {
        try {
            const { stream = false } = options;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant integrated with Microsoft Teams.' },
                    ...messages,
                ],
                temperature: 0.7,
                max_tokens: 4000,
                stream: stream,
            });

            // If streaming is enabled, return the stream object
            if (stream) {
                return response;
            }

            // Otherwise return the text content
            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error generating response from OpenAI with context:', error);
            throw new Error('Failed to generate response from OpenAI API');
        }
    }
}

module.exports = { OpenAIClient };
