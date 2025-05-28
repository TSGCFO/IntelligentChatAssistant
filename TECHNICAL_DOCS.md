# Technical Documentation

## Component Architecture

### Frontend Components

#### Chat Components
- **`ChatArea`**: Main chat interface handling message display and input
  - Manages conversation state and message sending
  - Auto-scrolling message container
  - Typing indicators and loading states
  - File attachment UI (ready for implementation)

- **`ChatSidebar`**: Navigation and conversation management
  - User profile display with logout
  - AI tools toggle interface
  - Conversation list with timestamps
  - Delete conversation functionality

- **`MessageBubble`**: Individual message display component
  - Role-based styling (user vs assistant)
  - Timestamp formatting
  - Metadata display for AI responses
  - Typing animation for pending messages

#### Authentication Components
- **`AuthPage`**: Split-screen login/register interface
  - Form validation with Zod schemas
  - Toggle between login and register
  - Hero section showcasing features
  - Automatic redirect for authenticated users

- **`ProtectedRoute`**: Route guard component
  - Authentication state checking
  - Loading state management
  - Automatic redirect to auth page

### Backend Architecture

#### Authentication Layer (`auth.ts`)
```typescript
// Passport.js configuration with local strategy
- Password hashing using scrypt with salt
- Session serialization/deserialization
- Route handlers for register/login/logout/user
```

#### Data Access Layer (`storage.ts`)
```typescript
interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>
  
  // Conversation management
  getUserConversations(userId: number): Promise<Conversation[]>
  createConversation(conversation: InsertConversation): Promise<Conversation>
  deleteConversation(id: number): Promise<void>
  
  // Message management
  getConversationMessages(conversationId: number): Promise<Message[]>
  createMessage(message: InsertMessage): Promise<Message>
  
  // Session management
  sessionStore: any
}
```

#### API Routes (`routes.ts`)
- RESTful API design
- Zod validation for all inputs
- Anthropic Claude integration
- Proper error handling and status codes

## State Management

### TanStack Query Configuration
```typescript
// Optimized query client setup
- Infinite stale time for static data
- No automatic refetching
- Proper error handling
- Cache invalidation on mutations
```

### Authentication State
- React Context for auth state
- Mutation functions for auth actions
- Automatic cache updates on login/logout
- Error handling with toast notifications

## Database Design

### Schema Relationships
```sql
Users (1) -> (N) Conversations
Conversations (1) -> (N) Messages
```

### Indexing Strategy
- Primary keys on all tables
- Foreign key constraints for data integrity
- Username unique constraint
- Timestamp indexing for conversation sorting

## AI Integration

### Claude API Configuration
```typescript
// Using latest Claude Sonnet 4 model
- Model: "claude-sonnet-4-20250514"
- Max tokens: 4000
- System prompt for chat behavior
- Conversation history context
- Metadata storage for usage tracking
```

### Message Flow
1. User submits message
2. Create/validate conversation
3. Store user message
4. Build conversation context
5. Call Anthropic API
6. Store AI response with metadata
7. Update conversation timestamp

## Security Implementation

### Authentication Security
- Scrypt password hashing with random salt
- Secure session management
- CSRF protection via same-origin sessions
- Input validation on all endpoints

### Data Protection
- TypeScript for type safety
- Zod schema validation
- Sanitized error messages
- No sensitive data in client responses

## Performance Optimizations

### Frontend Optimizations
- React Query caching
- Optimistic updates
- Component memoization
- Efficient re-renders
- Auto-resizing text areas

### Backend Optimizations
- Efficient database queries
- Proper indexing
- Session store optimization
- Memory-based storage for development

## Error Handling

### Frontend Error Handling
```typescript
// Comprehensive error states
- Network error handling
- Form validation errors
- Toast notifications for user feedback
- Loading states for all async operations
```

### Backend Error Handling
```typescript
// Proper HTTP status codes
- 400: Bad Request (validation errors)
- 401: Unauthorized (auth required)
- 404: Not Found (resource missing)
- 500: Internal Server Error (unexpected errors)
```

## Development Workflow

### Hot Module Replacement
- Vite HMR for instant updates
- Express server with automatic restart
- TypeScript compilation on save
- CSS updates without page refresh

### Type Safety
- Shared types between frontend/backend
- Drizzle ORM type generation
- Zod schema validation
- No `any` types in production code

## Deployment Considerations

### Environment Configuration
- Separate development/production configs
- Environment variable validation
- Secure secret management
- Database connection pooling

### Production Readiness
- Error logging and monitoring
- Performance metrics
- Security headers
- Rate limiting (ready for implementation)

## Extension Points

### Ready for Implementation
1. **Web Search Integration**
   - UI components already built
   - Metadata structure in place
   - Status indicators ready

2. **File Attachments**
   - Upload button in chat interface
   - Metadata storage prepared
   - Error handling ready

3. **Knowledge Base**
   - Toggle interface implemented
   - API structure prepared
   - Context integration ready

4. **Real-time Features**
   - WebSocket foundation ready
   - Message synchronization prepared
   - Typing indicators framework in place

### Future Enhancements
- Message search functionality
- Conversation export
- Advanced AI tools
- Multi-language support
- Dark/light theme toggle

## Testing Strategy

### Current Test Coverage
- Type safety through TypeScript
- Runtime validation with Zod
- Manual testing of all features
- Error boundary testing

### Recommended Testing
- Unit tests for utilities
- Integration tests for API endpoints
- E2E tests for user flows
- Performance testing for large conversations

This technical documentation provides deep insights into the implementation details and architectural decisions that make this AI chat application robust, scalable, and maintainable.