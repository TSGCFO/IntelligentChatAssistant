# AI Chat Application

A sophisticated web-based AI chat application powered by Anthropic's Claude AI, featuring modern authentication, conversation management, and a ChatGPT-inspired interface.

## 🌟 Features

### Core Functionality
- **AI-Powered Conversations**: Integration with Claude 3.7 Sonnet (latest model)
- **User Authentication**: Secure username/password registration and login system
- **Conversation Management**: Create, view, and delete chat conversations
- **Real-time Messaging**: Instant message exchange with typing indicators
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar

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

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user information

### Conversations
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/conversations/:id/messages` - Send message and get AI response

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
- Complete user authentication system
- Conversation management (create, view, delete)
- Real-time AI chat with Claude 3.7 Sonnet
- Responsive chat interface
- Message history and persistence
- Session management
- Error handling and loading states
- TypeScript throughout the application
- PostgreSQL database integration

### 🔄 Ready for Enhancement
- Web search functionality (UI ready)
- Domain-specific knowledge integration (UI ready)
- File upload and attachment handling
- Message export functionality
- Advanced AI tool integration
- Real-time collaborative features

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

This application provides a solid foundation for an AI chat platform with room for extensive feature expansion while maintaining clean architecture and excellent user experience.