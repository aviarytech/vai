# Verifiable AI (VAI)

VAI is a platform for verifying and managing AI interactions, providing transparency and accountability for AI-generated content. It allows users to create, verify, and manage credentials for AI interactions across different models and providers.

## Features

- **AI Interaction Verification**: Verify the authenticity and integrity of AI-generated responses
- **Public Square**: Browse and verify public AI interactions
- **Batch Operations**: Perform verification and export operations on multiple credentials
- **Real-time Chat Interface**: Interact with AI models while automatically generating verifiable credentials

## Architecture

The project is split into two main components:

### Backend (Node.js + Bun + Elysia)
- RESTful API for credential management
- MongoDB integration for data persistence
- Real-time AI interaction handling
- Verification service implementation

### Frontend (React + Vite + TypeScript)
- Modern React application with TypeScript
- Real-time chat interface
- Credential verification UI
- Dashboard for credential management
- Public square for browsing verified interactions

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.1.21 or later)
- MongoDB
- Node.js (v18 or later)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:aviarytech/vai.git
cd vai
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
bun install

# Install backend dependencies
cd ../backend
bun install
```

3. Configure environment variables:

Create `.env` files in both frontend and backend directories:

Frontend (.env):
```env
VITE_API_URL=http://localhost:3010/api
VITE_APP_NAME="VAI"
```

Backend (.env):
```env
PORT=3010
MONGODB_URI=mongodb://localhost:27017/ai_credential_verifier
AI_API_KEY=your_api_key
```

4. Start the development servers:
```bash
# Start both frontend and backend
bun start

# Or start them separately:
# Frontend
cd frontend
bun start

# Backend
cd backend
bun start
```

## Development

### Testing
```bash
# Run backend tests
cd backend
bun test

# Run backend tests with watch mode
bun test:watch
```

## Project Structure

```
vai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── config.ts
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   └── config.ts
│   └── package.json
└── package.json
```

## Key Components

### Frontend Components
- `ChatInterface`: Real-time AI interaction interface
- `VerificationHistory`: Display of verification records
- `Dashboard`: Credential management interface
- `PublicSquare`: Public browsing of verified interactions

### Backend Services
- `VerificationService`: Core credential verification logic
- `ChatService`: AI interaction handling
- `SearchService`: Credential search and filtering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
