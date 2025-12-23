/**
 * Socket Service
 * Enhanced socket configuration and event handling
 */

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Initialize socket connection
   * @param {Object} options - Connection options
   * @param {string} options.url - Socket server URL
   * @param {Object} options.options - Socket options
   * @returns {Promise<void>}
   */
  async connect(options = {}) {
    const config = require('../config');
    
    const defaultOptions = {
      transports: ['websocket'],
      timeout: config.api.timeout,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      ...options.options
    };

    try {
      const url = options.url || config.api.baseURL;
      
      this.socket = io(url, defaultOptions);
      
      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('Socket connected successfully');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.isConnected = false;
          console.error('Socket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
          console.log('Socket disconnected:', reason);
          
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, reconnect manually
            setTimeout(() => this.connect(options), 1000);
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      throw error;
    }
  }

  /**
   * Setup default event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.emitEvent('socket:connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.emitEvent('socket:disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.emitEvent('socket:error', error);
    });

    // Reconnection events
    this.socket.on('reconnect', (attemptNumber) => {
      this.emitEvent('socket:reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.emitEvent('socket:reconnect_attempt', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      this.emitEvent('socket:reconnect_error', error);
    });

    this.socket.on('reconnect_failed', () => {
      this.emitEvent('socket:reconnect_failed');
    });
  }

  /**
   * Add event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Event callback
   */
  on(eventName, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Cannot add event listener.');
      return;
    }

    this.socket.on(eventName, callback);

    // Store listener for cleanup
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Event callback
   */
  off(eventName, callback) {
    if (!this.socket) return;

    this.socket.off(eventName, callback);

    // Remove from stored listeners
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to server
   * @param {string} eventName - Event name
   * @param {any} data - Event data
   */
  emit(eventName, data) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot emit event:', eventName);
      return;
    }

    this.socket.emit(eventName, data);
  }

  /**
   * Get socket connection status
   * @returns {boolean} - Connection status
   */
  isConnectedToServer() {
    return this.isConnected;
  }

  /**
   * Get socket ID
   * @returns {string|null} - Socket ID
   */
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.cleanupEventListeners();
    }
  }

  /**
   * Cleanup all event listeners
   */
  cleanupEventListeners() {
    if (!this.socket) return;

    // Remove all stored listeners
    this.eventListeners.forEach((listeners, eventName) => {
      listeners.forEach(callback => {
        this.socket.off(eventName, callback);
      });
    });

    this.eventListeners.clear();
  }

  /**
   * Emit internal event
   * @param {string} eventName - Event name
   * @param {any} data - Event data
   */
  emitEvent(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Subscribe to news updates
   * @param {Function} callback - Callback function
   */
  onNewsUpdate(callback) {
    this.on('news:new', callback);
  }

  /**
   * Subscribe to news updates with specific category
   * @param {string} category - News category
   * @param {Function} callback - Callback function
   */
  onCategoryNewsUpdate(category, callback) {
    this.on(`news:new:${category}`, callback);
  }

  /**
   * Subscribe to search updates
   * @param {Function} callback - Callback function
   */
  onSearchUpdate(callback) {
    this.on('search:update', callback);
  }

  /**
   * Subscribe to error events
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.on('error', callback);
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
