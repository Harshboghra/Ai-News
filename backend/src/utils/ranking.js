function getRecencyScore(publishedAt) {
    const hoursOld =
        (Date.now() - new Date(publishedAt)) / (1000 * 60 * 60);

    if (hoursOld < 6) return 5;
    if (hoursOld < 24) return 3;
    if (hoursOld < 72) return 1;
    return 0;
}

function getCategoryScore(query, category) {
    if (!category) return 0;
    return query.toLowerCase().includes(category.toLowerCase()) ? 2 : 0;
}

function getSourceScore(source) {
    const trustedSources = ["BBC", "The Hindu"];
    return trustedSources.includes(source) ? 2 : 0;
}

function getExactMatchScore(query, title) {
    return title.toLowerCase().includes(query.toLowerCase()) ? 3 : 0;
}

module.exports = {
    getRecencyScore,
    getCategoryScore,
    getSourceScore,
    getExactMatchScore
};
