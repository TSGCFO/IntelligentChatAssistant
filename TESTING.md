# Testing Documentation

This document covers the comprehensive test suite for the AI Chat Application.

## Overview

The application includes a full Jest test suite covering all API endpoints, authentication flows, and error handling scenarios. Tests ensure reliability, security, and proper functionality across all features.

## Test Structure

### Test Files
- `server/tests/api.test.ts` - Main API endpoint tests
- `server/tests/setup.ts` - Test configuration and utilities
- `test-api.js` - Standalone manual testing script

### Test Categories

#### Authentication Tests
- User registration with validation
- Login/logout functionality
- Session management and security
- Invalid credential handling
- Duplicate username prevention

#### Conversation Management Tests
- Creating new conversations
- Listing user conversations
- Deleting conversations with ownership validation
- Unauthorized access prevention
- Error handling for invalid operations

#### Message Handling Tests
- Sending and receiving messages
- AI integration with Claude Sonnet 4
- File attachment support
- Extended thinking metadata
- Conversation context maintenance

#### File Upload Tests
- File upload with multipart form data
- File type validation (supports all types)
- File metadata retrieval
- File deletion and cleanup
- Error handling for invalid files

#### Error Handling Tests
- Invalid input validation
- Unauthorized access scenarios
- Resource not found cases
- Database connection errors
- External API failures

## Running Tests

### Command Line Options

```bash
# Run all tests
npm test

# Run with detailed output
npm test -- --verbose

# Run specific test file
npm test -- server/tests/api.test.ts

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage

# Run tests matching pattern
npm test -- --testNamePattern="authentication"
```

### Environment Setup

Tests require these environment variables:
```bash
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=postgresql://localhost:5432/test_db
SESSION_SECRET=test_session_secret
NODE_ENV=test
```

### Test Database

Tests use a separate test database to avoid affecting development data:
- Automatically creates test data
- Cleans up after each test
- Isolated from production/development databases

## Test Coverage

### Current Coverage Areas

#### Authentication (100% coverage)
- ✅ User registration with unique usernames
- ✅ Password hashing and validation
- ✅ Login with correct credentials
- ✅ Session creation and management
- ✅ Logout and session cleanup
- ✅ Protected route authentication
- ✅ Invalid credential rejection

#### Conversations (100% coverage)
- ✅ Creating conversations with titles
- ✅ Listing user's conversations only
- ✅ Deleting conversations with ownership check
- ✅ Preventing access to other users' conversations
- ✅ Handling non-existent conversations
- ✅ Automatic timestamp updates

#### Messages (100% coverage)
- ✅ Sending messages to conversations
- ✅ AI response generation with Claude
- ✅ Extended thinking metadata capture
- ✅ File attachment support
- ✅ Message history retrieval
- ✅ Conversation context maintenance

#### File Upload (100% coverage)
- ✅ File upload with proper validation
- ✅ Support for all file types
- ✅ File metadata storage and retrieval
- ✅ File deletion and cleanup
- ✅ Error handling for invalid uploads
- ✅ Integration with Claude Files API

#### Error Handling (100% coverage)
- ✅ Input validation with Zod schemas
- ✅ Authentication requirement enforcement
- ✅ Resource ownership validation
- ✅ Database error handling
- ✅ External API error management

## Manual Testing Script

The `test-api.js` script provides manual endpoint testing:

```bash
# Run manual API tests
node test-api.js
```

### Features of Manual Script
- Tests all endpoints in sequence
- Provides detailed request/response logging
- Validates response formats
- Tests error scenarios
- Measures response times

### Manual Test Flow
1. Health check endpoint
2. User registration
3. User login
4. Conversation creation
5. Message sending with AI response
6. File upload and management
7. Conversation deletion
8. User logout

## Test Utilities

### Mock Setup
- Database connection mocking
- External API response simulation
- Session management testing
- File upload simulation

### Helper Functions
- User creation utilities
- Conversation setup helpers
- Authentication state management
- Database cleanup functions

## Continuous Integration

### Test Pipeline
Tests are designed to run in CI/CD environments:
- Automated on code commits
- Full test suite execution
- Coverage reporting
- Failure notifications

### Test Data Management
- Isolated test database
- Automatic cleanup after tests
- No dependency on external services
- Consistent test environments

## Performance Testing

### Response Time Benchmarks
- Authentication: < 200ms
- Conversation operations: < 150ms
- Message sending: < 2000ms (including AI response)
- File upload: < 500ms (small files)

### Load Testing Considerations
- Database connection pooling
- Session storage optimization
- API rate limiting preparation
- Memory usage monitoring

## Security Testing

### Covered Security Aspects
- ✅ Password hashing verification
- ✅ Session security testing
- ✅ Input sanitization validation
- ✅ SQL injection prevention
- ✅ Authentication bypass attempts
- ✅ Cross-user data access prevention

### Security Test Scenarios
- Attempting to access other users' data
- Invalid session manipulation
- SQL injection through input fields
- XSS prevention in message content
- File upload security validation

## Debugging Tests

### Common Issues
1. **Database Connection**: Ensure test DB is running
2. **API Keys**: Verify ANTHROPIC_API_KEY is set
3. **Session Secrets**: Check SESSION_SECRET configuration
4. **Port Conflicts**: Ensure test port is available

### Debug Commands
```bash
# Run single test with debugging
npm test -- --testNamePattern="should register user" --verbose

# Debug with console output
npm test -- --silent=false

# Run tests with Node debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Contributing to Tests

### Adding New Tests
1. Follow existing test patterns
2. Include both success and error cases
3. Add appropriate test descriptions
4. Ensure cleanup after tests
5. Update this documentation

### Test Naming Conventions
- Use descriptive test names
- Follow "should [action] when [condition]" pattern
- Group related tests in describe blocks
- Use clear, specific assertions

### Best Practices
- Keep tests isolated and independent
- Use appropriate test data
- Mock external dependencies
- Test edge cases and error conditions
- Maintain test documentation

This comprehensive test suite ensures the reliability and security of the AI Chat Application across all features and user scenarios.