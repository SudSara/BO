const jwt = require('jsonwebtoken');

function decodeBearerToken(bearerToken) {
    try {
        // Remove 'Bearer ' prefix if present
        const token = bearerToken.replace(/^Bearer\s+/, '');

        // Decode the token payload
        const decoded = jwt.decode(token);

        return decoded.token_info.token_code;
    } catch (error) {
        console.error('Error decoding token:', error);
        throw error; // Handle decoding error as needed
    }
}

module.exports = decodeBearerToken;