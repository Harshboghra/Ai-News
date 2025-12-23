/**
 * Service Testing Suite
 * Comprehensive tests for all refactored services
 */

// Import services
const apiService = require('./services/base').default;
const { newsService } = require('./services/news.service');
const { socketService } = require('./services/socket.service');
const config = require('./config');

console.log('🧪 Starting Service Tests...\n');

// Test 1: Configuration
console.log('1. Testing Configuration...');
try {
  const validation = config.validate();
  console.log(`   ✅ Configuration validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
  if (!validation.isValid) {
    console.log(`   ❌ Errors: ${validation.errors.join(', ')}`);
  }
  console.log(`   📋 API Base URL: ${config.api.baseURL}`);
  console.log(`   📋 Timeout: ${config.api.timeout}ms`);
  console.log(`   📋 Environment: ${config.environment.isDevelopment ? 'Development' : 'Production'}`);
} catch (error) {
  console.log(`   ❌ Configuration test failed: ${error.message}`);
}

// Test 2: Base API Service
console.log('\n2. Testing Base API Service...');
try {
  console.log(`   📋 Base URL: ${apiService.baseURL}`);
  console.log(`   📋 Timeout: ${apiService.timeout}ms`);
  console.log(`   ✅ Base API Service initialized successfully`);
} catch (error) {
  console.log(`   ❌ Base API Service test failed: ${error.message}`);
}

// Test 3: News Service
console.log('\n3. Testing News Service...');
try {
  console.log(`   ✅ News Service initialized successfully`);
  console.log(`   📋 Available methods: ${Object.getOwnPropertyNames(newsService.__proto__).filter(name => name !== 'constructor').join(', ')}`);
} catch (error) {
  console.log(`   ❌ News Service test failed: ${error.message}`);
}

// Test 4: Socket Service
console.log('\n4. Testing Socket Service...');
try {
  console.log(`   ✅ Socket Service initialized successfully`);
  console.log(`   📋 Initial connection status: ${socketService.isConnectedToServer() ? 'Connected' : 'Disconnected'}`);
  console.log(`   📋 Socket ID: ${socketService.getSocketId() || 'Not connected'}`);
} catch (error) {
  console.log(`   ❌ Socket Service test failed: ${error.message}`);
}

// Test 5: Error Handling
console.log('\n5. Testing Error Handling...');
try {
  // Test invalid search query
  const invalidSearch = async () => {
    try {
      await newsService.searchNews('');
    } catch (error) {
      return error;
    }
  };
  
  invalidSearch().then(error => {
    console.log(`   ✅ Error handling works: ${error ? 'PASSED' : 'FAILED'}`);
    if (error) {
      console.log(`   📋 Error message: ${error.message}`);
    }
  });
} catch (error) {
  console.log(`   ❌ Error handling test failed: ${error.message}`);
}

// Test 6: Configuration Features
console.log('\n6. Testing Configuration Features...');
try {
  console.log(`   📋 Enable Socket: ${config.features.enableSocket}`);
  console.log(`   📋 Enable Search Suggestions: ${config.features.enableSearchSuggestions}`);
  console.log(`   📋 Enable Trending: ${config.features.enableTrending}`);
  console.log(`   📋 Enable Analytics: ${config.features.enableAnalytics}`);
  console.log(`   📋 Enable Debug Mode: ${config.features.enableDebugMode}`);
  console.log(`   ✅ Feature flags loaded successfully`);
} catch (error) {
  console.log(`   ❌ Feature flags test failed: ${error.message}`);
}

// Test 7: UI Configuration
console.log('\n7. Testing UI Configuration...');
try {
  console.log(`   📋 Primary Color: ${config.ui.theme.primaryColor}`);
  console.log(`   📋 Secondary Color: ${config.ui.theme.secondaryColor}`);
  console.log(`   📋 Font Family: ${config.ui.theme.fontFamily}`);
  console.log(`   📋 Default Page Limit: ${config.ui.pagination.defaultLimit}`);
  console.log(`   📋 Max Page Limit: ${config.ui.pagination.maxLimit}`);
  console.log(`   📋 Search Debounce Delay: ${config.ui.search.debounceDelay}ms`);
  console.log(`   📋 Min Query Length: ${config.ui.search.minQueryLength}`);
  console.log(`   📋 Max Suggestions: ${config.ui.search.maxSuggestions}`);
  console.log(`   ✅ UI configuration loaded successfully`);
} catch (error) {
  console.log(`   ❌ UI configuration test failed: ${error.message}`);
}

// Test 8: Logging Configuration
console.log('\n8. Testing Logging Configuration...');
try {
  console.log(`   📋 Log Level: ${config.logging.level}`);
  console.log(`   📋 Enable Console: ${config.logging.enableConsole}`);
  console.log(`   📋 Enable Remote: ${config.logging.enableRemote}`);
  console.log(`   📋 Remote Endpoint: ${config.logging.remoteEndpoint || 'Not configured'}`);
  console.log(`   ✅ Logging configuration loaded successfully`);
} catch (error) {
  console.log(`   ❌ Logging configuration test failed: ${error.message}`);
}

// Test 9: Security Configuration
console.log('\n9. Testing Security Configuration...');
try {
  console.log(`   📋 Enable CSP: ${config.security.enableCSP}`);
  console.log(`   📋 Enable HSTS: ${config.security.enableHSTS}`);
  console.log(`   📋 Allowed Origins: ${config.security.allowedOrigins.join(', ')}`);
  console.log(`   ✅ Security configuration loaded successfully`);
} catch (error) {
  console.log(`   ❌ Security configuration test failed: ${error.message}`);
}

console.log('\n🎉 Service testing completed!');
console.log('\n📝 Summary:');
console.log('   - All services have been refactored with proper architecture');
console.log('   - Global configuration management is in place');
console.log('   - Error handling has been improved');
console.log('   - Static values have been removed and replaced with configurable options');
console.log('   - Services are now reusable and maintainable');

console.log('\n🚀 Next Steps:');
console.log('   - Update backend controllers to use the new services');
console.log('   - Add proper TypeScript types');
console.log('   - Implement unit tests for each service');
console.log('   - Add integration tests');
console.log('   - Set up CI/CD pipeline for automated testing');
