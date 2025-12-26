const LanguageDetect = require('languagedetect');

const lngDetector = new LanguageDetect();

function detectLanguage(text) {
    if (!text || text.length < 4) return "en";

    try {
        const predictions = lngDetector.detect(text, 3); // Get top 3 predictions

        if (predictions && predictions.length > 0) {
            const [detectedLang, confidence] = predictions[0];

            // languagedetect returns language names, not codes
            // Map language names → our language codes
            const map = {
                english: "en",
                hindi: "hi",
                gujarati: "gu"
            };

            // Only use detection if confidence is reasonable (> 0.2)
            if (confidence > 0.2) {
                return map[detectedLang.toLowerCase()] || "en";
            }
        }
    } catch (error) {
        // If detection fails, default to English
        console.warn("Language detection failed:", error.message);
    }

    return "en";
}

module.exports = detectLanguage;
