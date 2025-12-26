# AI News Search - Troubleshooting Guide

## 🔧 Search API Issues Fixed

Your search API had several issues that have been resolved:

### Issues Fixed:
1. **Missing MongoDB Text Index** - Added text index on `title` and `description` fields
2. **Incorrect Field Name** - Fixed `textScore` to `score` in search controller
3. **Missing Dependencies** - Added `franc` and `socket.io` to package.json
4. **Index Setup** - Added automatic index creation on server startup

## 🚀 How to Fix & Test

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Start MongoDB service (varies by system)
sudo systemctl start mongod  # Linux
# or
brew services start mongodb/brew/mongodb-community  # macOS
# or use MongoDB Compass GUI
```

### Step 3: Run Backend Server
```bash
cd backend
npm start
```


### Step 4: Check if Data Exists
The server automatically fetches RSS feeds every 30 minutes. To manually fetch data:

```bash
# In another terminal, run the test script
node backend/test-search.js
```

### Step 5: Test Search API
Once you have data, test the search endpoint:

```bash
# Test search for "technology"
curl "http://localhost:5000/api/news/search?q=technology"

# Test search for "sports"
curl "http://localhost:5000/api/news/search?q=sports"

# Test latest news
curl "http://localhost:5000/api/news/latest"
```

### Step 6: Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing the Search

### Manual API Testing
Use these curl commands to test your search API:

```bash
# Test English search
curl "http://localhost:5000/api/news/search?q=technology"

# Test Hindi search
curl "http://localhost:5000/api/news/search?q=खेल"

# Test Gujarati search
curl "http://localhost:5000/api/news/search?q=રમત"

# Test latest news
curl "http://localhost:5000/api/news/latest?limit=10"
```

### Expected Response Format
```json
{
  "detectedLanguage": "en",
  "results": [
    {
      "_id": "64...",
      "title": "News Title",
      "description": "News description...",
      "language": "en",
      "category": "technology",
      "source": "BBC",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "finalScore": 15.5
    }
  ]
}
```

## 🔍 Search Features

### AI-Powered Ranking
Your search uses multiple scoring factors:
- **Text Relevance** (5x weight) - How well the query matches
- **Recency** - Newer articles get higher scores
- **Category Match** - Articles in relevant categories rank higher
- **Source Trust** - Trusted sources get bonus points
- **Exact Match** - Exact title matches get priority

### Multi-Language Support
- Automatic language detection using `franc`
- Searches in detected language first
- Falls back to English if no results
- Supports English, Hindi, Gujarati, and more

### Real-Time Updates
- Socket.IO provides live news updates
- Instant search as you type (300ms debounce)
- Live news feed on homepage

## 🐛 Common Issues & Solutions

### Issue: "No results found"
**Solution:** 
1. Check if MongoDB has data: `node backend/test-search.js`
2. Wait for RSS fetcher to run (every 30 minutes)
3. Check RSS sources in `backend/src/utils/rssSources.js`

### Issue: "Search failed" error
**Solution:**
1. Check MongoDB connection in `.env`
2. Verify text indexes were created (check server logs)
3. Ensure `franc` package is installed

### Issue: "Connection refused"
**Solution:**
1. Make sure MongoDB is running
2. Check if port 5000 is available
3. Verify `.env` file has correct MongoDB URI

### Issue: Frontend can't connect to API
**Solution:**
1. Check `NEXT_PUBLIC_API_URL` in frontend `.env`
2. Ensure backend server is running on port 5000
3. Check CORS settings in backend

## 📊 Performance Tips

1. **Text Indexes**: Automatically created on startup
2. **Caching**: Results are cached for 5 minutes
3. **Debouncing**: Search delays 300ms to reduce API calls
4. **Limit Results**: Default limit is 20 results

## 🎯 Next Steps

1. **Add More RSS Sources**: Edit `backend/src/utils/rssSources.js`
2. **Improve AI Ranking**: Modify scoring in `backend/src/utils/ranking.js`
3. **Add Categories**: Categorize news by keywords
4. **User Preferences**: Add user-specific language preferences

## 📞 Support

If you still have issues:
1. Check server logs for error messages
2. Verify MongoDB connection
3. Test API endpoints with curl
4. Ensure all dependencies are installed

The search API should now work properly with AI-powered ranking and multi-language support!
