/**
 * Error Handler Test Script
 * Run this in your browser after the application loads to test error handling
 */

function testErrorHandling() {
  console.log('=== Starting Error Handler Tests ===');
  
  // Get components from registry
  const grid = componentRegistry.get('grid');
  const renderer = componentRegistry.get('renderer');
  const gameManager = componentRegistry.get('gameManager');
  
  // Test 1: Info message (should be logged but not shown to user)
  console.log('Test 1: Info message');
  errorHandler.info('This is an info message', ErrorCategory.UNKNOWN);
  
  // Test 2: Warning message (should be shown to user)
  console.log('Test 2: Warning message');
  errorHandler.warning('This is a warning message', ErrorCategory.INPUT);
  
  // Test 3: Error message (should be shown to user)
  console.log('Test 3: Error message');
  errorHandler.error('This is an error message', ErrorCategory.RENDERING);
  
  // Test 4: Out of bounds cell toggle (should log warning but not show to user)
  console.log('Test 4: Out of bounds cell toggle');
  grid.toggleCell(-1, -1);
  
  // Test 5: Out of bounds pattern placement (should show warning to user)
  console.log('Test 5: Out of bounds pattern placement');
  grid.placePattern([[1]], -10, -10);
  
  // Test 6: Invalid pattern (should show error to user)
  console.log('Test 6: Invalid pattern');
  grid.placePattern(null, 0, 0);
  
  // Test 7: Invalid boundary type (should log warning but not show to user)
  console.log('Test 7: Invalid boundary type');
  grid.setBoundaryType('invalid-type');
  
  // Test 8: Callback notification
  console.log('Test 8: Callback notification');
  errorHandler.setNotificationCallback((errorDetails) => {
    console.log('Callback received error:', errorDetails.level, errorDetails.message);
  });
  errorHandler.error('This error triggers the callback', ErrorCategory.UNKNOWN);
  
  // Test 9: Disable user notifications temporarily
  console.log('Test 9: Disable user notifications');
  errorHandler.setUserErrorVisibility(false);
  errorHandler.error('This error should not be shown to user', ErrorCategory.UNKNOWN);
  errorHandler.setUserErrorVisibility(true);
  
  // Test 10: Get error log
  console.log('Test 10: Get error log');
  const errorLog = errorHandler.getErrorLog();
  console.log(`Error log contains ${errorLog.length} entries`);
  
  // Test 11: Get recent errors
  console.log('Test 11: Get recent errors');
  const recentErrors = errorHandler.getErrorLog(3);
  console.log(`Recent errors: ${recentErrors.length} entries`);
  
  console.log('=== Error Handler Tests Complete ===');
}

// Run the tests when this script is loaded
testErrorHandling(); 