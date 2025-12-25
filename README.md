# 📰 AI-News Application

Real-time AI-powered news aggregation and search application with infinite scroll, built with Next.js (frontend) and Node.js/Express (backend).

## ✨ Features

- 🔄 **Infinite Scroll** - Seamless news browsing without pagination
- 🤖 **AI-Powered Search** - Intelligent news search and recommendations
- 📱 **Real-time Updates** - Live news updates via WebSocket
- 🎨 **Modern UI** - Responsive design with smooth animations
- 🚀 **Production Ready** - Deployed on Vercel with CI/CD
- 🔍 **Category Filtering** - Filter news by technology, sports, business, etc.
- 🌍 **Multi-language Support** - Language detection and translation
- 📊 **Analytics** - Search trends and usage statistics

## 🏗️ Architecture

```
AI-News/
├── frontend/          # Next.js React application
├── backend/           # Node.js Express API server
├── .github/           # GitHub Actions CI/CD workflows
└── docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm 8+**
- **MongoDB** (local or cloud instance)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshboghra/Ai-News.git
   cd AI-News
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   # Environment variables are centralized in the root .env file
   # Both frontend and backend read from this single file
   ```

4. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   # or update MONGO_URI in .env
   ```

5. **Start the application:**
   ```bash
   # Development mode (both frontend & backend)
   npm run dev

   # Or start individually:
   npm run dev:frontend  # Frontend only
   npm run dev:backend   # Backend only
   ```

6. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3032

## 📋 Available Scripts

### Root Directory Scripts
```bash
npm run dev              # Start both frontend & backend in development mode
npm run start            # Start both frontend & backend in production mode (requires build first)
npm run build            # Build both frontend & backend for production
npm run install:all      # Install all dependencies (root + frontend + backend)
npm run clean            # Clean all build artifacts

# Development vs Production:
# - npm run dev   : Development mode with hot reload (no build needed)
# - npm run build : Build for production
# - npm run start : Start production build (requires npm run build first)
```

### Windows Batch Files
```cmd
dev.bat                  # Start development mode (Windows)
start.bat                # Start production mode (Windows)
build.bat                # Build both applications (Windows)
```

### Frontend Scripts (in `frontend/` directory)
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks
```

### Backend Scripts (in `backend/` directory)
```bash
npm run dev              # Start with nodemon (hot reload)
npm run start            # Start production server
npm test                 # Run tests
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/ai_news

# API Keys
OPENAI_API_KEY=your-openai-api-key
GOOGLE_TRANSLATE_API_KEY=your-google-translate-key

# Vercel (for deployment)
VERCEL_TOKEN=your-vercel-token
VERCEL_FRONTEND_PROJECT_ID=your-frontend-project-id
VERCEL_BACKEND_PROJECT_ID=your-backend-project-id
```

### Required API Keys

- **OpenAI API Key**: For AI-powered search features
- **Google Translate API Key**: For language translation
- **MongoDB Connection**: Database for news storage

## 🏃‍♂️ Windows Batch Files

For Windows users, you can use the provided batch files:

```cmd
dev.bat      # Start development mode (both frontend & backend)
build.bat    # Build both applications for production
start.bat    # Build and start production mode (both services)
```

**These batch files are kept in the root directory for Windows convenience.**

## 🚀 Deployment

### Vercel (Recommended)

The application is configured for Vercel deployment:

1. **Connect GitHub repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** via GitHub Actions

### Manual Deployment

```bash
# Build for production
npm run build

# Start production servers
npm run start
```

## 🧪 Testing

### Automated Testing
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

### E2E Testing
```bash
# Run Playwright tests
npx playwright test
```

## 🔍 API Documentation

### Backend Endpoints

- `GET /api/news/latest` - Get latest news
- `GET /api/news/search` - Search news
- `GET /api/news/category` - Get news by category
- `GET /api/news/trending` - Get trending searches

### Frontend Routes

- `/` - Home page with news feed
- `/search` - Search results page
- `/category/[slug]` - Category-specific news

## 🛠️ Development

### Project Structure

```
frontend/
├── app/                 # Next.js app directory
├── components/          # React components
├── hooks/               # Custom React hooks
├── services/            # API services
├── styles/              # CSS styles
├── types/               # TypeScript types
└── utils/               # Utility functions

backend/
├── src/
│   ├── config/          # Database & app config
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Main server file
└── tests/               # Test files
```

### Key Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Node.js, Express.js, MongoDB
- **Real-time**: Socket.IO
- **AI**: OpenAI API
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Team

- **Developer**: Harshboghra
- **Repository**: [GitHub](https://github.com/Harshboghra/Ai-News)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Harshboghra/Ai-News/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Harshboghra/Ai-News/discussions)

---

**Happy coding! 🚀**
