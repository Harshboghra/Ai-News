const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        content: {
            type: String
        },

        language: {
            type: String,
            required: true,
            index: true // for fast language filter
        },

        category: {
            type: String,
            index: true
        },

        tags: {
            type: [String],
            default: []
        },

        source: {
            type: String
        },

        sourceUrl: {
            type: String,
            unique: true // avoid duplicate news
        },

        publishedAt: {
            type: Date,
            index: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { versionKey: false }
);

module.exports = mongoose.model("News", NewsSchema);
