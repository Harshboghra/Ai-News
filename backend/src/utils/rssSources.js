module.exports = [
    // 🌍 World News - High Priority
    {
        source: "BBC World",
        url: "https://feeds.bbci.co.uk/news/rss.xml",
        language: "en",
        category: "world",
        priority: 1.0,
        aiProcessing: {
            summaryLength: 150, // characters
            contentLength: 800, // words
            model: "llama-3.3-70b-versatile",
            promptTemplate: "world-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "CNN World",
        url: "http://rss.cnn.com/rss/edition.rss",
        language: "en",
        category: "world",
        priority: 1.0,
        aiProcessing: {
            summaryLength: 150,
            contentLength: 800,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "world-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Al Jazeera",
        url: "https://www.aljazeera.com/xml/rss/all.xml",
        language: "en",
        category: "world",
        priority: 0.9,
        aiProcessing: {
            summaryLength: 150,
            contentLength: 700,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "world-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },

    // 🇮🇳 India News - High Priority
    {
        source: "The Hindu",
        url: "https://www.thehindu.com/news/feeder/default.rss",
        language: "en",
        category: "india",
        priority: 1.0,
        aiProcessing: {
            summaryLength: 180,
            contentLength: 1000,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "india-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Times of India",
        url: "https://timesofindia.indiatimes.com/rssfeedsdefault.cms",
        language: "en",
        category: "india",
        priority: 0.9,
        aiProcessing: {
            summaryLength: 150,
            contentLength: 800,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "india-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Indian Express",
        url: "https://indianexpress.com/feed/",
        language: "en",
        category: "india",
        priority: 0.9,
        aiProcessing: {
            summaryLength: 160,
            contentLength: 900,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "india-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "NDTV India",
        url: "https://feeds.feedburner.com/ndtvnews-top-stories",
        language: "en",
        category: "india",
        priority: 0.8,
        aiProcessing: {
            summaryLength: 140,
            contentLength: 700,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "india-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },

    // 💼 Business - Medium Priority
    {
        source: "Economic Times",
        url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
        language: "en",
        category: "business",
        priority: 0.8,
        aiProcessing: {
            summaryLength: 200,
            contentLength: 1200,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "business-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Bloomberg",
        url: "https://feeds.bloomberg.com/markets/news.rss",
        language: "en",
        category: "business",
        priority: 0.9,
        aiProcessing: {
            summaryLength: 180,
            contentLength: 1000,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "business-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Financial Times",
        url: "https://www.ft.com/?format=rss",
        language: "en",
        category: "business",
        priority: 0.7,
        aiProcessing: {
            summaryLength: 180,
            contentLength: 1000,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "business-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },

    // ⚽ Sports - Medium Priority
    {
        source: "ESPN",
        url: "https://www.espn.com/espn/rss/news",
        language: "en",
        category: "sports",
        priority: 0.8,
        aiProcessing: {
            summaryLength: 120,
            contentLength: 600,
            model: "llama-3.1-8b-instant",
            promptTemplate: "sports-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Cricbuzz",
        url: "https://rss.app/feeds/KeeLtJVnpmZLC698.xml",
        language: "en",
        category: "sports",
        priority: 0.9,
        aiProcessing: {
            summaryLength: 140,
            contentLength: 700,
            model: "llama-3.1-8b-instant",
            promptTemplate: "sports-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "BBC Sport",
        url: "http://feeds.bbci.co.uk/sport/rss.xml",
        language: "en",
        category: "sports",
        priority: 0.7,
        aiProcessing: {
            summaryLength: 130,
            contentLength: 650,
            model: "llama-3.1-8b-instant",
            promptTemplate: "sports-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },

    // 🧪 Technology - High Priority
    {
        source: "TechCrunch",
        url: "https://techcrunch.com/feed/",
        language: "en",
        category: "technology",
        priority: 1.0,
        aiProcessing: {
            summaryLength: 160,
            contentLength: 900,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "tech-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "The Verge",
        url: "https://www.theverge.com/rss/index.xml",
        language: "en",
        category: "technology",
        priority: 1.0,
        aiProcessing: {
            summaryLength: 170,
            contentLength: 950,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "tech-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Wired",
        url: "https://www.wired.com/feed/rss",
        language: "en",
        category: "technology",
        priority: 0.8,
        aiProcessing: {
            summaryLength: 150,
            contentLength: 850,
            model: "llama-3.3-70b-versatile",
            promptTemplate: "tech-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },

    // 🏥 Health - Medium Priority
    {
        source: "Mayo Clinic",
        url: "https://feeds.npr.org/1007/rss.xml",
        language: "en",
        category: "health",
        priority: 0.7,
        aiProcessing: {
            summaryLength: 180,
            contentLength: 1000,
            model: "llama-3.1-8b-instant",
            promptTemplate: "health-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "CDC Newsroom",
        url: "https://medicalxpress.com/rss-feed/",
        language: "en",
        category: "health",
        priority: 0.6,
        aiProcessing: {
            summaryLength: 220,
            contentLength: 1200,
            model: "llama-3.1-8b-instant",
            promptTemplate: "health-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },

    // 🔬 Science - Medium Priority
    {
        source: "Science Daily",
        url: "https://www.sciencedaily.com/rss/all.xml",
        language: "en",
        category: "science",
        priority: 0.7,
        aiProcessing: {
            summaryLength: 180,
            contentLength: 1000,
            model: "llama-3.1-8b-instant",
            promptTemplate: "science-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Scientific American",
        url: "http://rss.sciam.com/ScientificAmerican-Global",
        language: "en",
        category: "science",
        priority: 0.6,
        aiProcessing: {
            summaryLength: 200,
            contentLength: 1100,
            model: "llama-3.1-8b-instant",
            promptTemplate: "science-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },

    // 🎨 Entertainment - Low Priority
    {
        source: "Variety",
        url: "https://variety.com/feed/",
        language: "en",
        category: "entertainment",
        priority: 0.5,
        aiProcessing: {
            summaryLength: 140,
            contentLength: 700,
            model: "llama-3.1-8b-instant",
            promptTemplate: "entertainment-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },
    {
        source: "Hollywood Reporter",
        url: "https://www.hollywoodreporter.com/feed/",
        language: "en",
        category: "entertainment",
        priority: 0.5,
        aiProcessing: {
            summaryLength: 130,
            contentLength: 650,
            model: "llama-3.1-8b-instant",
            promptTemplate: "entertainment-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    },

    // 🚀 Startup & Innovation - Medium Priority
    {
        source: "Crunchbase News",
        url: "https://news.crunchbase.com/feed/",
        language: "en",
        category: "startup",
        priority: 0.6,
        aiProcessing: {
            summaryLength: 180,
            contentLength: 900,
            model: "llama-3.1-8b-instant",
            promptTemplate: "startup-news"
        },
        transformationRules: {
            removeAds: true,
            summarize: true,
            translateTo: null
        }
    }
];
