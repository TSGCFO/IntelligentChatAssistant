# API Reference Guide

## Authentication Endpoints

### POST /api/register

Create a new user account.

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (201):**

```json
{
  "id": 1,
  "username": "john_doe",
  "createdAt": "2025-01-28T12:00:00.000Z"
}
```

**Errors:**

- `400`: Username already exists
- `400`: Invalid request data

---

### POST /api/login

Authenticate existing user.

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**

```json
{
  "id": 1,
  "username": "john_doe",
  "createdAt": "2025-01-28T12:00:00.000Z"
}
```

**Errors:**

- `401`: Invalid credentials

---

### POST /api/logout

End user session.

**Response (200):** Empty response

---

### GET /api/user

Get current authenticated user information.

**Response (200):**

```json
{
  "id": 1,
  "username": "john_doe",
  "createdAt": "2025-01-28T12:00:00.000Z"
}
```

**Errors:**

- `401`: Not authenticated

## Conversation Endpoints

### GET /api/conversations

Get all conversations for the authenticated user.

**Response (200):**

```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "Discussion about AI",
    "createdAt": "2025-01-28T12:00:00.000Z",
    "updatedAt": "2025-01-28T12:30:00.000Z"
  }
]
```

**Errors:**

- `401`: Not authenticated

---

### POST /api/conversations

Create a new conversation.

**Request Body:**

```json
{
  "title": "string (required, max 255 chars)"
}
```

**Response (201):**

```json
{
  "id": 1,
  "userId": 1,
  "title": "Discussion about AI",
  "createdAt": "2025-01-28T12:00:00.000Z",
  "updatedAt": "2025-01-28T12:00:00.000Z"
}
```

**Errors:**

- `401`: Not authenticated
- `400`: Invalid conversation data

---

### DELETE /api/conversations/:id

Delete a specific conversation and all its messages.

**Parameters:**

- `id`: Conversation ID (integer)

**Response (204):** Empty response

**Errors:**

- `401`: Not authenticated
- `404`: Conversation not found or not owned by user

## Message Endpoints

### GET /api/conversations/:id/messages

Get all messages for a specific conversation.

**Parameters:**

- `id`: Conversation ID (integer)

**Response (200):**

```json
[
  {
    "id": 1,
    "conversationId": 1,
    "role": "user",
    "content": "Hello, how are you?",
    "metadata": null,
    "createdAt": "2025-01-28T12:00:00.000Z"
  },
  {
    "id": 2,
    "conversationId": 1,
    "role": "assistant",
    "content": "Hello! I'm Claude, and I'm doing well, thank you for asking.",
    "metadata": {
      "model": "claude-3-7-sonnet-20250219",
      "usage": {
        "input_tokens": 12,
        "output_tokens": 17
      }
    },
    "createdAt": "2025-01-28T12:00:15.000Z"
  }
]
```

**Errors:**

- `401`: Not authenticated
- `404`: Conversation not found or not owned by user

---

### POST /api/conversations/:id/messages

Send a message and receive AI response.

**Parameters:**

- `id`: Conversation ID (integer)

**Request Body:**

```json
{
  "role": "user",
  "content": "string (required)",
  "metadata": {} // optional
}
```

**Response (200):**

```json
{
  "userMessage": {
    "id": 1,
    "conversationId": 1,
    "role": "user",
    "content": "Hello, how are you?",
    "metadata": null,
    "createdAt": "2025-01-28T12:00:00.000Z"
  },
  "aiMessage": {
    "id": 2,
    "conversationId": 1,
    "role": "assistant",
    "content": "Hello! I'm Claude, and I'm doing well, thank you for asking.",
    "metadata": {
      "model": "claude-3-7-sonnet-20250219",
      "usage": {
        "input_tokens": 12,
        "output_tokens": 17
      }
    },
    "createdAt": "2025-01-28T12:00:15.000Z"
  }
}
```

**Errors:**

- `401`: Not authenticated
- `404`: Conversation not found or not owned by user
- `400`: Invalid message data
- `500`: AI service error

## Data Models

### User

```typescript
interface User {
  id: number;
  username: string;
  password: string; // hashed, never returned in API
  createdAt: Date;
}
```

### Conversation

```typescript
interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message

```typescript
interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  metadata: {
    model?: string;
    usage?: {
      input_tokens: number;
      output_tokens: number;
    };
    webSearch?: boolean;
    knowledgeBase?: boolean;
  } | null;
  createdAt: Date;
}
```

## Error Response Format

All error responses follow this structure:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented, but the API is designed to be rate-limit friendly:

- All endpoints return appropriate HTTP status codes
- Error responses include descriptive messages
- Conversation and message creation are the main write operations

## Authentication

The API uses session-based authentication:

- Sessions are stored server-side
- Cookies are httpOnly and secure
- No bearer tokens or API keys required for client requests
- Sessions expire when browser closes or explicit logout

## Pagination

Currently not implemented but endpoints are designed for future pagination:

- Conversations and messages could accept `?page` and `?limit` parameters
- Response could include pagination metadata

## Real-time Features

The API is designed for potential WebSocket integration:

- Message metadata can store real-time status
- Conversation updates timestamp for change detection
- All operations are atomic and consistent

## Claude AI Integration

### System Prompt

The AI assistant uses this system prompt:

```
You are Claude, an AI assistant created by Anthropic. You have access to web search and domain-specific knowledge to help users with detailed conversations. Be helpful, accurate, and engaging in your responses.
```

### Model Configuration

- **Model**: claude-sonnet-4-20250514 (latest available)
- **Max Tokens**: 4,000
- **Context**: Full conversation history
- **Temperature**: Default (not specified, using Claude's default)

### Response Processing

- Text responses are extracted from Claude's response
- Usage metadata is stored for analytics
- Conversation context is maintained across messages
- Error handling for API failures

This API provides a solid foundation for building chat applications with room for extensive feature expansion while maintaining clean architecture and excellent developer experience.
