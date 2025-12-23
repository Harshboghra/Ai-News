/**
 * Socket Service
 * Enhanced socket configuration and event handling
 */

import { io } from 'socket.io-client';

class SocketService {
  socket: any;
  isConnected: boolean;
  eventListeners: Map<string, Function[]>;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;

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
   * @param options - Connection options
   * @returns Promise<void>
   */
  async connect(options: any = {}) {
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
      
      return new Promise<void>((resolve, reject) => {
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('Socket connected successfully');
          resolve();
        });

        this.socket.on('connect_error', (error: any) => {
          this.isConnected = false;
          console.error('Socket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', (reason: any) => {
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
      this.emitEvent('socket:connected', {});
    });

    this.socket.on('disconnect', (reason: any) => {
      this.isConnected = false;
      this.emitEvent('socket:disconnected', { reason });
    });

    this.socket.on('connect_error', (error: any) => {
      this.emitEvent('socket:error', error);
    });

    // Reconnection events
    this.socket.on('reconnect', (attemptNumber: any) => {
      this.emitEvent('socket:reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber: any) => {
      this.emitEvent('socket:reconnect_attempt', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error: any) => {
      this.emitEvent('socket:reconnect_error', error);
    });

    this.socket.on('reconnect_failed', () => {
      this.emitEvent('socket:reconnect_failed', {});
    });
  }

  /**
   * Add event listener
   * @param eventName - Event name
   * @param callback - Event callback
   */
  on(eventName: string, callback: Function) {
    if (!this.socket) {
      console.warn('Socket not connected. Cannot add event listener.');
      return;
    }

    this.socket.on(eventName, callback);

    // Store listener for cleanup
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)?.push(callback);
  }

  /**
   * Remove event listener
   * @param eventName - Event name
   * @param callback - Event callback
   */
  off(eventName: string, callback: Function) {
    if (!this.socket) return;

    this.socket.off(eventName, callback);

    // Remove from stored listeners
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  /**
   * Emit event to server
   * @param eventName - Event name
   * @param data - Event data
   */
  emit(eventName: string, data: any) {
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
   * @param eventName - Event name
   * @param data - Event data
   */
  emitEvent(eventName: string, data: any) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in event listener:', error);
          }
        });
      }
    }
  }

  /**
   * Subscribe to news updates
   * @param callback - Callback function
   */
  onNewsUpdate(callback: Function) {
    this.on('news:new', callback);
  }

  /**
   * Subscribe to news updates with specific category
   * @param category - News category
   * @param callback - Callback function
   */
  onCategoryNewsUpdate(category: string, callback: Function) {
    this.on(`news:new:${category}`, callback);
  }

  /**
   * Subscribe to search updates
   * @param callback - Callback function
   */
  onSearchUpdate(callback: Function) {
    this.on('search:update', callback);
  }

  /**
   * Subscribe to error events
   * @param callback - Callback function
   */
  onError(callback: Function) {
    this.on('error', callback);
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
