const { franc } = require("franc");

function detectLanguage(text) {
    if (!text || text.length < 4) return "en";

    const langCode = franc(text);

    // Map franc → our language codes
    const map = {
        eng: "en",
        hin: "hi",
        guj: "gu"
    };

    return map[langCode] || "en";
}

module.exports = detectLanguage;
