const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
    {
        // 📰 Original Source Data (Reference Only - Not for Display)
        originalTitle: {
            type: String,
            trim: true,
            index: true
        },
        originalDescription: {
            type: String,
            trim: true
        },
        sourceUrl: {
            type: String,
            unique: true,
            index: true
        },
        source: {
            type: String,
            index: true
        },
        publishedAt: {
            type: Date,
            index: true
        },

        // 🤖 AI-Generated Content (For Display & SEO)
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        aiSummary: {
            type: String,
            trim: true,
            maxlength: 300 // Perfect for meta descriptions
        },
        aiContent: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            index: true,
            sparse: true
        },
        readingTime: {
            type: Number,
            min: 1,
            max: 120
        },
        tags: {
            type: [String],
            default: []
        },
        category: {
            type: String,
            index: true
        },
        language: {
            type: String,
            required: true,
            index: true
        },

        // 🏷️ AI Processing Metadata
        aiStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
            index: true
        },
        aiMetadata: {
            model: String,
            promptTokens: Number,
            completionTokens: Number,
            processingTime: Number,
            confidence: Number,
            createdAt: Date
        },
        priority: {
            type: Number,
            default: 1,
            index: true
        },

        // 📊 Content Analytics
        views: {
            type: Number,
            default: 0
        },
        engagement: {
            type: Number,
            default: 0
        },

        // 📅 Timestamps
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        aiProcessedAt: {
            type: Date
        }
    },
    { 
        versionKey: false,
        timestamps: true
    }
);

// 🏷️ Indexes for Performance
NewsSchema.index({ language: 1, category: 1, publishedAt: -1 });
NewsSchema.index({ aiStatus: 1, priority: -1, publishedAt: -1 });
NewsSchema.index({ slug: 1 });
NewsSchema.index({ tags: 1, language: 1 });

// 🧹 Pre-save Middleware for Slug Generation
NewsSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.generateSlug();
    }
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});

// 🏷️ Instance Method: Generate SEO-friendly slug
NewsSchema.methods.generateSlug = function() {
    const title = this.title || this.originalTitle || 'news';
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
    return `${slug}-${Date.now().toString(36)}`;
};

// 📏 Instance Method: Calculate reading time
NewsSchema.methods.calculateReadingTime = function() {
    if (!this.aiContent) return 1;
    const words = this.aiContent.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    return Math.max(1, Math.min(readingTime, 120)); // Clamp between 1-120 minutes
};

// 🏷️ Static Method: Get AI-processed news only
NewsSchema.statics.getAiProcessedNews = function(filters = {}) {
    return this.find({
        ...filters,
        aiStatus: 'completed',
        aiContent: { $exists: true, $ne: null }
    }).sort({ publishedAt: -1 });
};

// 🏷️ Static Method: Get pending AI processing
NewsSchema.statics.getPendingAiProcessing = function(limit = 100) {
    return this.find({
        $or: [
            { aiStatus: 'pending' },
            { aiStatus: 'failed' }
        ]
    }).sort({ priority: -1, publishedAt: -1 }).limit(limit);
};

module.exports = mongoose.model("News", NewsSchema);
