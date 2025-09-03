# Wexa Co-worker Conversational UI

A modern ChatGPT-like conversational interface for the Wexa Co-worker knowledge base system. This React application provides an intuitive chat experience for querying and exploring your organization's knowledge base through natural language interactions.

## Features

- 🤖 **ChatGPT-like Interface**: Modern chat bubbles with left/right alignment
- 💬 **Multi-turn Conversations**: Context retention across conversation sessions
- 📚 **Source Attribution**: Expandable sources panel with document metadata
- 🌓 **Dark/Light Mode**: Toggle between themes with system preference detection
- 📱 **Responsive Design**: Works seamlessly across desktop and mobile devices
- ⚡ **Real-time Typing Indicators**: Visual feedback during response generation
- 🔍 **Rich Content Support**: Markdown rendering, code blocks, and tables
- 💾 **Conversation History**: Persistent chat sessions with sidebar navigation

## Architecture

```
Frontend (React + TailwindCSS) → Wexa Co-worker API → Query Builder → Retriever → Structurer → Qdrant Vector DB
```

### API Integration

The application integrates with your existing Wexa Co-worker pipeline:

**Request Format:**
```json
{
  "user_id": "12345",
  "session_id": "abcd-efgh", 
  "query": "Show me ATM configuration details for 2024"
}
```

**Response Format:**
```json
{
  "answer": "The ATM configuration for 2024 includes...",
  "sources": [
    {
      "document_id": "doc_142",
      "relevance_score": 0.92,
      "content": "ATM configuration details...",
      "metadata": { "year": "2024", "type": "configuration" }
    }
  ]
}
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Wexa Co-worker backend API running

### Installation

1. **Clone and install dependencies:**
```bash
cd "LightRiver UI"
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your API endpoint
```

3. **Start development server:**
```bash
npm start
```

The application will open at `http://localhost:3000`

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
REACT_APP_API_BASE_URL=http://your-coworker-api:8000/api
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── chat/            # Chat-specific components
│       ├── ChatInterface.tsx       # Main chat container
│       ├── MessageBubble.tsx       # Individual message display
│       ├── ChatInput.tsx          # Message input with send button
│       └── ConversationSidebar.tsx # Conversation history sidebar
├── hooks/
│   └── useConversations.ts        # Conversation state management
├── services/
│   └── api.ts                     # API integration layer
├── types/
│   └── index.ts                   # TypeScript type definitions
└── lib/
    └── utils.ts                   # Utility functions
```

## Key Components

### ChatInterface
Main chat container managing message flow and API integration.

### MessageBubble  
Renders individual messages with:
- User/assistant role styling
- Markdown content support
- Expandable sources panel
- Relevance scoring display

### ConversationSidebar
Provides:
- Conversation history navigation
- New conversation creation
- Dark/light mode toggle
- Settings access

## API Integration

The `apiService` handles all backend communication:

```typescript
// Send query to Wexa Co-worker
await apiService.sendQuery({
  user_id: userId,
  session_id: sessionId, 
  query: userMessage
});
```

## Performance Targets

- **Response Time**: <2s for top-5 results retrieval
- **UI Responsiveness**: Immediate feedback with typing indicators
- **Memory Efficiency**: Optimized message rendering and scrolling

## Deployment

### Docker Deployment

```bash
# Build production image
docker build -t wexa-coworker-ui .

# Run container
docker run -p 3000:80 -e REACT_APP_API_BASE_URL=http://api:8000/api wexa-coworker-ui
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wexa-coworker-ui
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wexa-coworker-ui
  template:
    metadata:
      labels:
        app: wexa-coworker-ui
    spec:
      containers:
      - name: ui
        image: wexa-coworker-ui:latest
        ports:
        - containerPort: 80
        env:
        - name: REACT_APP_API_BASE_URL
          value: "http://coworker-api:8000/api"
```

## Development

### Available Scripts

- `npm start` - Development server with hot reload
- `npm build` - Production build with optimizations  
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (not recommended)

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with React rules
- **Prettier**: Automatic code formatting
- **TailwindCSS**: Utility-first styling approach

## Future Enhancements

- **Authentication**: Role-based access control (Admin/User)
- **Real-time Updates**: WebSocket integration for live responses
- **Advanced Search**: Filters, date ranges, document type selection
- **Export Features**: Conversation export to PDF/markdown
- **Analytics**: Usage tracking and performance metrics
- **Mobile App**: React Native version for mobile devices

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the Wexa development team
- Check the API documentation for backend integration details
