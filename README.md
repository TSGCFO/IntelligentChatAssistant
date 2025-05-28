# AI Chat Application

An advanced AI chat application powered by Anthropic Claude, featuring intelligent conversational capabilities, comprehensive API testing, and a robust file upload system.

## 🌟 Features

### Core Functionality
- **AI-Powered Conversations**: Integration with Claude Sonnet 4 (claude-sonnet-4-20250514)
- **User Authentication**: Secure username/password registration and login system
- **Conversation Management**: Create, view, and delete chat conversations
- **File Upload System**: Support for any file type using Claude Files API
- **Real-time Messaging**: Instant message exchange with typing indicators
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar

### Advanced Features
- **Extended Thinking Display**: View Claude's reasoning process in expandable sections
- **Copy to Clipboard**: One-click copying for code snippets and entire messages
- **Voice Interaction Mode**: Speech recognition and text-to-speech capabilities (HTTPS required)
- **Message Rendering**: Enhanced parsing for code blocks, markdown, and rich content
- **Accessibility Features**: Screen reader support and keyboard navigation

### Interface Features
- **Clean Chat Interface**: ChatGPT-inspired design with message bubbles
- **Sidebar Navigation**: Conversation history with timestamps and quick access
- **Tool Status Indicators**: Visual indicators for AI capabilities
- **User Profile Management**: Simple profile display with logout functionality
- **Theme Integration**: Anthropic purple branding throughout

### Technical Features
- **Session Management**: Persistent user sessions with secure storage
- **Database Integration**: PostgreSQL ready with Drizzle ORM
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Real-time Updates**: Automatic conversation list updates
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Comprehensive Testing**: Full Jest test suite for all API endpoints

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **AI Integration**: Anthropic Claude API

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui base components
│   │   │   └── chat/       # Chat-specific components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database configuration
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data access layer
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schemas
└── README.md              # This documentation
```

## 📊 Database Schema

### Users Table
- `id`: Serial primary key
- `username`: Unique username (required)
- `password`: Hashed password (required)
- `createdAt`: Account creation timestamp

### Conversations Table
- `id`: Serial primary key
- `userId`: Foreign key to users table
- `title`: Conversation title (auto-generated from first message)
- `createdAt`: Conversation creation timestamp
- `updatedAt`: Last message timestamp

### Messages Table
- `id`: Serial primary key
- `conversationId`: Foreign key to conversations table
- `role`: Message role ('user' or 'assistant')
- `content`: Message text content
- `metadata`: JSON field for AI response metadata
- `createdAt`: Message timestamp

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /api/register` - Create new user account
  - Body: `{ username: string, password: string }`
  - Returns: User object with id, username, createdAt
- `POST /api/login` - User login
  - Body: `{ username: string, password: string }`
  - Returns: User object and sets session cookie
- `POST /api/logout` - User logout
  - Clears session and returns success message
- `GET /api/user` - Get current user information
  - Returns: Current user object or 401 if not authenticated

### Conversation Management
- `GET /api/conversations` - List user's conversations
  - Returns: Array of conversations with id, title, timestamps
- `POST /api/conversations` - Create new conversation
  - Body: `{ title: string }`
  - Returns: New conversation object
- `DELETE /api/conversations/:id` - Delete conversation
  - Requires: Conversation ownership validation
  - Returns: Success confirmation

### Message Handling
- `GET /api/conversations/:id/messages` - Get conversation messages
  - Returns: Array of messages with role, content, metadata, timestamps
- `POST /api/conversations/:id/messages` - Send message and get AI response
  - Body: `{ message: string, fileIds?: string[] }`
  - Returns: User message and AI response with extended thinking support

### File Upload System
- `POST /api/upload` - Upload file for AI analysis
  - Body: FormData with file
  - Returns: `{ file_id: string, filename: string, size: number, type: string }`
- `GET /api/files/:file_id` - Get file metadata
  - Returns: File information and upload status
- `DELETE /api/files/:file_id` - Delete uploaded file
  - Returns: Deletion confirmation

### Testing & Health Check
- `GET /api/health` - Application health status
  - Returns: System status and database connectivity
- `GET /api/test` - API testing endpoint
  - Returns: Test response for connectivity verification

## 🎨 Design System

### Color Palette
- **Primary**: #5C33BE (Anthropic purple)
- **Secondary**: #2D2D2D (charcoal)
- **Background**: #FFFFFF (white)
- **Text**: #1A1A1A (near black)
- **Accent**: #E6E6FA (light lavender)

### Typography
- **Font**: Inter (primary), Source Sans Pro (fallback)
- **Spacing**: 16px base spacing system
- **Border Radius**: 8px standard radius

### Components
- **Message Bubbles**: Rounded corners with role-based styling
- **Sidebar**: Collapsible with conversation history
- **Input Area**: Auto-resizing textarea with send button
- **Status Indicators**: Green dots for active features

## 🔧 Configuration

### Environment Variables
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude integration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `NODE_ENV`: Environment (development/production)

### Features Ready for Extension
- **Web Search**: Interface ready, implementation pending
- **Knowledge Base**: UI prepared for domain-specific knowledge
- **AI Agents**: Placeholder for future OpenAI Agents SDK integration
- **File Attachments**: UI elements in place for future implementation

## 🚀 Current Status

### ✅ Implemented
- Complete user authentication system with secure session management
- Conversation management (create, view, delete) with ownership validation
- Real-time AI chat with Claude Sonnet 4 (claude-sonnet-4-20250514)
- File upload system supporting all file types via Claude Files API
- Extended thinking display showing Claude's reasoning process
- Copy to clipboard functionality for code snippets and messages
- Voice interaction mode with speech recognition and text-to-speech
- Enhanced message rendering with code syntax highlighting
- Comprehensive Jest test suite covering all API endpoints
- Responsive chat interface with accessibility features
- Message history and persistence with metadata support
- Error handling and loading states throughout the application
- TypeScript implementation across frontend and backend
- PostgreSQL database integration with Drizzle ORM

### 🧪 Testing Coverage
- **Authentication Tests**: Registration, login, logout, session validation
- **Conversation Tests**: CRUD operations, ownership verification, error handling
- **Message Tests**: Send/receive, AI integration, file attachment support
- **File Upload Tests**: Upload validation, metadata retrieval, deletion
- **Error Handling Tests**: Invalid inputs, unauthorized access, edge cases
- **Integration Tests**: End-to-end API workflow validation

### 🔄 Ready for Enhancement
- Web search functionality (UI components ready)
- Domain-specific knowledge integration (interface prepared)
- Real-time collaborative features
- Message export functionality
- Advanced AI tool integration
- Multi-language support

## 📱 User Experience

### Authentication Flow
1. Users land on a split-screen auth page
2. Can register new account or login to existing
3. Automatic redirect to chat interface upon success

### Chat Experience
1. Welcome screen for new users
2. Sidebar shows conversation history
3. Click "+" or start typing to begin new conversation
4. Messages appear in real-time with typing indicators
5. Conversations auto-save and can be resumed

### Mobile Experience
- Collapsible sidebar for mobile screens
- Touch-friendly interface elements
- Responsive message bubbles
- Optimized input area for mobile keyboards

## 🔒 Security Features

- **Password Hashing**: Secure scrypt-based password hashing
- **Session Management**: Secure session storage with encryption
- **Input Validation**: Zod schema validation on all endpoints
- **Authentication Guards**: Protected routes requiring login
- **CSRF Protection**: Session-based authentication prevents CSRF
- **Type Safety**: TypeScript prevents runtime type errors

## 📈 Performance Features

- **Optimistic Updates**: UI updates before server confirmation
- **Efficient Queries**: TanStack Query with intelligent caching
- **Auto-resize Components**: Smooth textarea expansion
- **Lazy Loading**: Components load as needed
- **Memory Management**: Proper cleanup of event listeners

## 🧪 Testing & Development

### Running Tests
```bash
# Run all API tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- server/tests/api.test.ts

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage
The application includes comprehensive Jest testing covering:
- **API Endpoints**: All authentication, conversation, and file upload endpoints
- **Error Handling**: Invalid inputs, unauthorized access, edge cases
- **Database Operations**: CRUD operations with proper validation
- **File Upload**: Multipart form handling and file validation
- **Session Management**: Authentication state and security

### API Testing Script
A standalone API testing script is available for manual verification:
```bash
# Test all endpoints manually
node test-api.js
```

### Environment Setup
Ensure these environment variables are set for testing:
- `ANTHROPIC_API_KEY`: Required for AI integration tests
- `DATABASE_URL`: PostgreSQL connection for test database
- `SESSION_SECRET`: Session encryption key

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Anthropic API key

### Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`
6. Run tests: `npm test`

### Production Deployment
The application is ready for deployment with:
- Secure session management
- Environment-based configuration
- Comprehensive error handling
- Full test coverage
- Type safety throughout

This application provides a solid foundation for an AI chat platform with room for extensive feature expansion while maintaining clean architecture and excellent user experience.