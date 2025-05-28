// Test setup file
import { beforeAll, afterAll } from '@jest/globals';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret-key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost/test';

// Mock Anthropic API to avoid real API calls during tests
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      beta: {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'Mocked AI response for testing' }],
            usage: { input_tokens: 10, output_tokens: 20 },
            thinking: 'Mocked thinking process for testing'
          })
        }
      },
      files: {
        upload: jest.fn().mockResolvedValue({
          id: 'mock_file_id_12345',
          filename: 'test.txt',
          size: 100,
          type: 'text/plain'
        })
      }
    })),
    toFile: jest.fn().mockImplementation((buffer, filename, options) => ({
      buffer,
      filename,
      ...options
    }))
  };
});

// Setup test database or in-memory storage
beforeAll(async () => {
  console.log('Setting up test environment...');
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
});