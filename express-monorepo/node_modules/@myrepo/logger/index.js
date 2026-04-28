module.exports = function logMessage(message) {
    console.log(`[SHARED LOGGER] ${new Date().toISOString()}: ${message}`);
};