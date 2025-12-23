const mongoose = require("mongoose");

const SearchTrendSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    count: {
        type: Number,
        default: 1
    },
    lastSearchedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model("SearchTrend", SearchTrendSchema);
