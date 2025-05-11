// First, install axios: npm install axios
const axios = require('axios');

exports.handler = async function(event, context) {
    // Check if the request is a POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        // Parse the incoming JSON
        const data = JSON.parse(event.body);
        const { message } = data;
        
        // Get the real IP address from request headers
        const ip = event.headers['x-forwarded-for'] || 
                   event.headers['client-ip'] || 
                   'Unknown IP';

        // Telegram configuration (from environment variables for security)
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        if (!telegramBotToken || !chatId) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Telegram configuration missing' })
            };
        }

        // Send to Telegram
        const telegramResponse = await axios.post(
            `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
            {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            }
        );

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true,
                message: 'Information sent to Telegram successfully'
            })
        };
    } catch (error) {
        console.error('Error:', error);
        
        // Return error response
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false,
                error: error.message || 'Unknown error occurred'
            })
        };
    }
};
