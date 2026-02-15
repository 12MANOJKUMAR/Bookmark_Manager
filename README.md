# Bookmark Manager

A full-stack Bookmark Manager application built with **React**, **Node.js/Express**, and **Tailwind CSS**.

## Features

- **Add/Edit/Delete Bookmarks**: Manage your favorite links easily.
- **Auto-Fetch Metadata**: Automatically fetches the page title when adding a URL.
- **Tagging & Filtering**: Organize bookmarks with tags and filter by them.
- **Real-time Search**: Search by title or URL instantly.
- **Pagination**: Browse through your bookmarks efficiently.
- **Dark Mode**: Toggle between Light and Dark themes.
- **Responsive UI**: Modern, clean design using Tailwind CSS and Lucide icons.
- **Rate Limiting**: API is protected against abuse.

## Tech Stack

- **Frontend**: Vite, React, Tailwind CSS, Axios, Lucide-React
- **Backend**: Node.js, Express, Cheerio (metadata fetching), Express-Rate-Limit
- **Testing**: Jest, Supertest

## AI Prototyping Note
> This project was rapidly prototyped using AI assistance to accelerate development while ensuring best practices and code quality.

## Setup Instructions

### Prerequisites
- Node.js (v14+ recommended)

### Installation

1.  **Clone the repository** (or unzip the project).

2.  **Install Backend Dependencies**:
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies**:
    ```bash
    cd ../client
    npm install
    ```

### Running the App (Single Command)

You can start both the backend and frontend with a single script:

```bash
./start.sh
```

Alternatively, you can run them in separate terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm start
# Runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

## Submission Details

- **Time Spent**: ~1.5 hours
- **AI Tools Used**: Google Vertex AI Agent (Gemini 2.0 Pro)
- **Assumptions Made**:
  - The backend should run on port 5000 and frontend on 5173 (default).
  - Rate limiting is set to 100 requests per 15 minutes.
  - In-memory storage is acceptable as per brief (data resets on restart).
  - No external DB service is required.

### Running Tests

To run the backend unit tests:
```bash
cd server
npm test
```
