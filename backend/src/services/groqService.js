/**
 * Groq AI Service
 * Handles AI content generation using Groq SDK with multiple model support
 */

const BaseService = require("./base.service");
const News = require("../models/News");
const { Groq } = require("groq-sdk");
const rssSources = require("../utils/rssSources");

class GroqService extends BaseService {
  constructor() {
    super(News);
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.processingQueue = [];
    this.isProcessing = false;
    this.promptTemplates = this.loadPromptTemplates();
    this.modelConfig = this.loadModelConfig();
    this.requestLog = [];
    this.rpmLimit = parseInt(process.env.GROQ_RPM_LIMIT || "30");
    this.jitter = () => Math.floor(200 + Math.random() * 400);
  }

  /**
   * Load prompt templates for different content types
   */
  loadPromptTemplates() {
    return {
      "world-news": `Transform this world news article into an engaging, SEO-optimized summary. 
      Focus on: Global impact, key players, consequences. 
      Output format: 3-4 short paragraphs, 150-200 words total.`,

      "india-news": `Transform this India news article into a comprehensive, SEO-optimized summary.
      Focus on: Local impact, government response, public reaction.
      Output format: 4-5 paragraphs, 200-300 words total.`,

      "business-news": `Transform this business news into an analytical, SEO-optimized summary.
      Focus on: Market impact, financial implications, future outlook.
      Output format: 4-5 paragraphs, 250-350 words total.`,

      "sports-news": `Transform this sports news into an exciting, SEO-optimized summary.
      Focus on: Key moments, player performance, tournament implications.
      Output format: 3-4 short paragraphs, 150-250 words total.`,

      "tech-news": `Transform this technology news into an informative, SEO-optimized summary.
      Focus on: Technical details, industry impact, future applications.
      Output format: 4-5 paragraphs, 200-300 words total.`,

      "health-news": `Transform this health news into an informative, SEO-optimized summary.
      Focus on: Medical significance, public health impact, expert opinions.
      Output format: 4-5 paragraphs, 250-350 words total.`,

      "science-news": `Transform this science news into an educational, SEO-optimized summary.
      Focus on: Scientific significance, research methodology, real-world applications.
      Output format: 4-5 paragraphs, 250-350 words total.`,

      "entertainment-news": `Transform this entertainment news into an engaging, SEO-optimized summary.
      Focus on: Key developments, industry impact, fan reaction.
      Output format: 3-4 short paragraphs, 150-250 words total.`,

      "startup-news": `Transform this startup news into an analytical, SEO-optimized summary.
      Focus on: Business model, funding details, market potential.
      Output format: 4-5 paragraphs, 250-350 words total.`
    };
  }

  /**
   * Load model configuration for different content types
   */
  loadModelConfig() {
    return {
      // High priority content - use best models
      "world-news": "llama-3.3-70b-versatile",
      "india-news": "llama-3.3-70b-versatile",
      "business-news": "llama-3.3-70b-versatile",
      "tech-news": "llama-3.3-70b-versatile",
      
      // Medium priority - use balanced models
      "health-news": "llama-3.1-8b-instant",
      "science-news": "llama-3.1-8b-instant",
      "sports-news": "llama-3.1-8b-instant",
      
      // Lower priority - use faster, cheaper models
      "entertainment-news": "llama-3.1-8b-instant",
      "startup-news": "llama-3.1-8b-instant",
      
      // Default fallback
      "general": "llama-3.1-8b-instant"
    };
  }

  /**
   * Process pending AI content generation
   */
  async processPendingAIContent(limit = 10) {
    if (this.isProcessing) {
      this.logger.info("AI processing already in progress");
      return;
    }

    this.isProcessing = true;
    this.logger.info(`Starting Groq AI processing for up to ${limit} items`);

    try {
      const pendingNews = await News.getPendingAiProcessing(limit);
      this.logger.info(`Found ${pendingNews.length} items for AI processing`);

      for (const news of pendingNews) {
        await this.processSingleNews(news);
      }

      this.logger.info("Groq AI processing completed");
    } catch (error) {
      this.logger.error("Groq AI processing failed:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single news item with Groq AI
   */
  async processSingleNews(news) {
    try {
      // Update status to processing
      await News.findByIdAndUpdate(news._id, { 
        aiStatus: 'processing',
        updatedAt: new Date()
      });

      // Get RSS source configuration
      const sourceConfig = this.getSourceConfig(news.source);
      const prompt = this.buildPrompt(news, sourceConfig);
      
      // Generate AI content
      const aiResult = await this.generateAIContent(prompt, sourceConfig);
      
      // Update news with AI content
      const updateData = {
        aiStatus: 'completed',
        aiContent: aiResult.content,
        aiSummary: aiResult.summary,
        aiMetadata: {
          model: aiResult.model,
          promptTokens: aiResult.usage.prompt_tokens,
          completionTokens: aiResult.usage.completion_tokens,
          processingTime: Date.now() - aiResult.startTime,
          confidence: aiResult.confidence,
          createdAt: new Date()
        },
        priority: sourceConfig.priority,
        readingTime: this.calculateReadingTime(aiResult.content),
        aiProcessedAt: new Date(),
        updatedAt: new Date()
      };

      await News.findByIdAndUpdate(news._id, updateData);
      this.logger.info(`Groq AI processing completed for: ${news.title}`);

    } catch (error) {
      this.logger.error(`Groq AI processing failed for ${news.title}:`, error);
      await News.findByIdAndUpdate(news._id, { 
        aiStatus: 'failed',
        updatedAt: new Date()
      });
    }
  }

  /**
   * Get RSS source configuration
   */
  getSourceConfig(sourceName) {
    return rssSources.find(source => source.source === sourceName) || {
      priority: 1,
      aiProcessing: {
        summaryLength: 150,
        contentLength: 800,
        model: "llama-3.1-8b-instant",
        promptTemplate: "general"
      },
      transformationRules: {
        removeAds: true,
        summarize: true,
        translateTo: null
      }
    };
  }

  /**
   * Build AI prompt for content generation
   */
  buildPrompt(news, sourceConfig) {
    const template = this.promptTemplates[sourceConfig.aiProcessing.promptTemplate] || 
                    this.promptTemplates["general"];
    
    const content = news.content || news.description || "";
    const title = news.title || news.originalTitle || "";
    const category = news.category || "";

    return `
${template}

Original Title: ${title}
Original Content: ${content.substring(0, 2000)}...

Please generate:
1. A concise, engaging title (under 70 characters)
2. A compelling summary (under ${sourceConfig.aiProcessing.summaryLength} characters)
3. A comprehensive article body (${sourceConfig.aiProcessing.contentLength} words)

Ensure the content is original, SEO-friendly, and suitable for ${category} category.
Focus on providing value to readers while maintaining journalistic integrity.
      `;
  }

  /**
   * Generate AI content using Groq API
   */
  async generateAIContent(prompt, sourceConfig) {
    const startTime = Date.now();

    const fullPrompt = `
You are a professional news content writer.
Convert RSS news into SEO-friendly, original news articles.

${prompt}
`;

    // Determine model based on content type and priority
    const model = this.selectModel(sourceConfig);
    this.logger.info(`Using model: ${model} for ${sourceConfig.aiProcessing.promptTemplate}`);

    const isInstant = model.includes("8b-instant");
    let maxTokens = isInstant ? 900 : 1200;
    const minTokens = 500;

    const waitFromError = (error) => {
      const msg = String(error?.message || "");
      const match = msg.match(/Please try again in\s+(\d+(\.\d+)?)s/i);
      if (match) {
        return Math.ceil(parseFloat(match[1]) * 1000);
      }
      return 2000;
    };

    const isRateLimit = (error) => {
      const msg = String(error?.message || "");
      return msg.includes("rate limit") || msg.includes("rate_limit_exceeded");
    };

    const adjustTokensOnTPM = (error) => {
      const msg = String(error?.message || "");
      if (msg.includes("tokens per minute")) {
        maxTokens = Math.max(minTokens, Math.floor(maxTokens * 0.8));
      }
    };

    const waitForRPM = async () => {
      const now = Date.now();
      this.requestLog = this.requestLog.filter(t => now - t < 60000);
      if (this.requestLog.length >= this.rpmLimit) {
        const oldest = this.requestLog[0];
        const waitMs = 60000 - (now - oldest) + this.jitter();
        await new Promise(res => setTimeout(res, waitMs));
      }
      this.requestLog.push(Date.now());
    };

    try {
      let primaryResult = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await waitForRPM();
          const chatCompletion = await this.groq.chat.completions.create({
            messages: [
              {
                role: "user",
                content: fullPrompt,
              },
            ],
            model: model,
            temperature: 0.7,
            max_tokens: maxTokens,
            top_p: 0.95,
          });
          primaryResult = chatCompletion;
          break;
        } catch (primaryError) {
          if (isRateLimit(primaryError)) {
            const waitMs = waitFromError(primaryError);
            adjustTokensOnTPM(primaryError);
            this.logger.warn(`Rate limited on ${model}, waiting ${waitMs}ms, max_tokens=${maxTokens}`);
            await new Promise(res => setTimeout(res, waitMs));
            continue;
          }
          throw primaryError;
        }
      }

      if (!primaryResult) {
        throw new Error("Primary model attempts exhausted");
      }

      const content = primaryResult.choices[0]?.message?.content || "";
      const usage = primaryResult.usage || {};
      
      const processedContent = this.processAIContent(content);

      return {
        content: processedContent.body,
        summary: processedContent.summary,
        model: model,
        confidence: this.calculateConfidence(usage),
        usage: {
          prompt_tokens: usage.prompt_tokens || 0,
          completion_tokens: usage.completion_tokens || 0,
          total_tokens: usage.total_tokens || 0
        },
        startTime
      };

    } catch (error) {
      this.logger.error("Groq API error:", error.message);
      
      // Try fallback models if primary fails
      const fallbackModels = this.getFallbackModels(model);
      
      for (const fallbackModel of fallbackModels) {
        try {
          this.logger.info(`Trying fallback model: ${fallbackModel}`);
          const isFallbackInstant = fallbackModel.includes("8b-instant");
          maxTokens = isFallbackInstant ? 900 : 1200;
          let fallbackResult = null;
          for (let attempt = 0; attempt < 5; attempt++) {
            try {
              await waitForRPM();
              const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                  {
                    role: "user",
                    content: fullPrompt,
                  },
                ],
                model: fallbackModel,
                temperature: 0.7,
                max_tokens: maxTokens,
                top_p: 0.95,
              });
              fallbackResult = chatCompletion;
              break;
            } catch (fallbackError) {
              if (isRateLimit(fallbackError)) {
                const waitMs = waitFromError(fallbackError);
                adjustTokensOnTPM(fallbackError);
                this.logger.warn(`Rate limited on ${fallbackModel}, waiting ${waitMs}ms, max_tokens=${maxTokens}`);
                await new Promise(res => setTimeout(res, waitMs));
                continue;
              }
              throw fallbackError;
            }
          }

          if (!fallbackResult) {
            throw new Error("Fallback model attempts exhausted");
          }

          const content = fallbackResult.choices[0]?.message?.content || "";
          const usage = fallbackResult.usage || {};
          
          const processedContent = this.processAIContent(content);

          this.logger.info(`Successfully used fallback model: ${fallbackModel}`);
          return {
            content: processedContent.body,
            summary: processedContent.summary,
            model: fallbackModel,
            confidence: this.calculateConfidence(usage),
            usage: {
              prompt_tokens: usage.prompt_tokens || 0,
              completion_tokens: usage.completion_tokens || 0,
              total_tokens: usage.total_tokens || 0
            },
            startTime
          };

        } catch (fallbackError) {
          this.logger.error(`Fallback model ${fallbackModel} also failed:`, fallbackError.message);
          continue;
        }
      }

      throw new Error(`All Groq models failed. Original error: ${error.message}`);
    }
  }

  /**
   * Select appropriate model based on content type and priority
   */
  selectModel(sourceConfig) {
    const category = sourceConfig.aiProcessing.promptTemplate;
    const priority = sourceConfig.priority || 1;
    
    // Use configured model if available
    if (sourceConfig.aiProcessing.model && sourceConfig.aiProcessing.model !== "llama-3.1-8b-instant") {
      return sourceConfig.aiProcessing.model;
    }
    
    // Use category-based model selection
    const model = this.modelConfig[category] || this.modelConfig["general"];
    
    // For high priority content, prefer better models
    if (priority >= 0.9 && model === "llama-3.1-8b-instant") {
      return "llama-3.3-70b-versatile";
    }
    
    return model;
  }

  /**
   * Get fallback models for a given model
   */
  getFallbackModels(primaryModel) {
    const fallbacks = {
      "llama-3.3-70b-versatile": ["llama-3.1-8b-instant"],
      "llama-3.1-8b-instant": ["llama-3.3-70b-versatile"]
    };
    
    return fallbacks[primaryModel] || ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];
  }

  /**
   * Process and structure AI-generated content
   */
  processAIContent(content) {
    // Simple parsing - in production, use more sophisticated parsing
    const lines = content.split('\n').filter(line => line.trim());
    const summary = lines.slice(0, 2).join(' ').substring(0, 300);
    const body = content;

    return {
      summary,
      body
    };
  }

  /**
   * Calculate confidence score for AI generation
   */
  calculateConfidence(usage) {
    // Simple confidence calculation based on response quality
    const tokens = usage.total_tokens || 0;
    
    // Higher confidence for longer, more detailed responses
    return Math.min(1.0, (tokens / 1000) * 0.8 + 0.2);
  }

  /**
   * Calculate reading time for content
   */
  calculateReadingTime(content) {
    if (!content) return 1;
    const words = content.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    return Math.max(1, Math.min(readingTime, 120)); // Clamp between 1-120 minutes
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats() {
    const total = await News.countDocuments();
    const pending = await News.countDocuments({ aiStatus: 'pending' });
    const processing = await News.countDocuments({ aiStatus: 'processing' });
    const completed = await News.countDocuments({ aiStatus: 'completed' });
    const failed = await News.countDocuments({ aiStatus: 'failed' });

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      completionRate: total > 0 ? (completed / total * 100).toFixed(2) : 0
    };
  }

  /**
   * Retry failed AI processing
   */
  async retryFailedProcessing() {
    const failedNews = await News.find({ aiStatus: 'failed' });
    this.logger.info(`Retrying Groq AI processing for ${failedNews.length} failed items`);

    for (const news of failedNews) {
      await News.findByIdAndUpdate(news._id, { aiStatus: 'pending' });
    }

    return this.processPendingAIContent(failedNews.length);
  }
}

// Export singleton instance
const groqService = new GroqService();
module.exports = groqService;
