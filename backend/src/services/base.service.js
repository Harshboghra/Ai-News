/**
 * Base Service
 * Common patterns and utilities for backend services
 */

const mongoose = require('mongoose');

class BaseService {
  constructor(model) {
    this.model = model;
    this.logger = this.setupLogger();
  }

  /**
   * Setup logging utility
   */
  setupLogger() {
    return {
      info: (message, data = {}) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
      },
      error: (message, error = {}) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
      },
      warn: (message, data = {}) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
      },
      debug: (message, data = {}) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
        }
      }
    };
  }

  /**
   * Handle database operations with error handling
   * @param {Function} operation - Database operation function
   * @param {string} operationName - Name of the operation for logging
   * @returns {Promise} - Database operation result
   */
  async handleDBOperation(operation, operationName) {
    try {
      this.logger.debug(`Starting ${operationName}`);
      const result = await operation();
      this.logger.debug(`Completed ${operationName}`, { resultCount: Array.isArray(result) ? result.length : 1 });
      return result;
    } catch (error) {
      this.logger.error(`Failed ${operationName}`, error);
      throw error;
    }
  }

  /**
   * Find documents with pagination
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options
   * @param {number} options.limit - Limit number of results
   * @param {number} options.skip - Skip number of results
   * @param {Object} options.sort - Sort options
   * @returns {Promise<Object>} - Paginated results
   */
  async findWithPagination(filter = {}, options = {}) {
    const {
      limit = 20,
      skip = 0,
      sort = { createdAt: -1 },
      select = ''
    } = options;

    try {
      const [results, totalCount] = await Promise.all([
        this.model.find(filter)
          .select(select)
          .sort(sort)
          .limit(limit)
          .skip(skip)
          .lean(),
        this.model.countDocuments(filter)
      ]);

      return {
        results,
        totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: skip + limit < totalCount
      };
    } catch (error) {
      this.logger.error('Find with pagination failed', error);
      throw error;
    }
  }

  /**
   * Find single document
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} - Found document or null
   */
  async findOne(filter, options = {}) {
    const { select = '', populate = [] } = options;

    try {
      let query = this.model.findOne(filter);

      if (select) {
        query = query.select(select);
      }

      if (populate.length > 0) {
        populate.forEach(pop => {
          query = query.populate(pop);
        });
      }

      return await query.lean();
    } catch (error) {
      this.logger.error('Find one failed', error);
      throw error;
    }
  }

  /**
   * Create new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>} - Created document
   */
  async create(data) {
    try {
      const document = new this.model(data);
      const savedDocument = await document.save();
      this.logger.info('Document created', { id: savedDocument._id });
      return savedDocument.toObject();
    } catch (error) {
      this.logger.error('Create failed', error);
      throw error;
    }
  }

  /**
   * Update document
   * @param {Object} filter - MongoDB filter
   * @param {Object} updateData - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} - Updated document or null
   */
  async update(filter, updateData, options = {}) {
    const { upsert = false, new: returnNew = true } = options;

    try {
      const result = await this.model.findOneAndUpdate(
        filter,
        { $set: updateData },
        { upsert, new: returnNew, runValidators: true }
      ).lean();

      if (result) {
        this.logger.info('Document updated', { id: result._id });
      }

      return result;
    } catch (error) {
      this.logger.error('Update failed', error);
      throw error;
    }
  }

  /**
   * Delete document
   * @param {Object} filter - MongoDB filter
   * @returns {Promise<Object>} - Delete result
   */
  async delete(filter) {
    try {
      const result = await this.model.deleteOne(filter);
      this.logger.info('Document deleted', { deletedCount: result.deletedCount });
      return result;
    } catch (error) {
      this.logger.error('Delete failed', error);
      throw error;
    }
  }

  /**
   * Aggregate documents
   * @param {Array} pipeline - MongoDB aggregation pipeline
   * @returns {Promise<Array>} - Aggregation results
   */
  async aggregate(pipeline) {
    try {
      const results = await this.model.aggregate(pipeline);
      this.logger.debug('Aggregation completed', { resultCount: results.length });
      return results;
    } catch (error) {
      this.logger.error('Aggregation failed', error);
      throw error;
    }
  }

  /**
   * Validate MongoDB ObjectId
   * @param {string} id - Object ID string
   * @returns {boolean} - Valid ObjectId
   */
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  /**
   * Transform document for API response
   * @param {Object} document - Document to transform
   * @returns {Object} - Transformed document
   */
  transformDocument(document) {
    if (!document) return null;

    const transformed = { ...document };
    
    // Convert ObjectId to string
    if (transformed._id) {
      transformed.id = transformed._id.toString();
      delete transformed._id;
    }

    // Convert timestamps
    if (transformed.createdAt) {
      transformed.createdAt = new Date(transformed.createdAt).toISOString();
    }
    if (transformed.updatedAt) {
      transformed.updatedAt = new Date(transformed.updatedAt).toISOString();
    }

    return transformed;
  }

  /**
   * Transform multiple documents
   * @param {Array} documents - Documents to transform
   * @returns {Array} - Transformed documents
   */
  transformDocuments(documents) {
    if (!Array.isArray(documents)) return [];
    return documents.map(doc => this.transformDocument(doc));
  }
}

module.exports = BaseService;
