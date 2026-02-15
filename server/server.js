const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cheerio = require('cheerio');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// In-memory store
let bookmarks = [
    {
        id: uuidv4(),
        url: 'https://react.dev',
        title: 'React',
        description: 'The library for web and native user interfaces',
        tags: ['frontend', 'library', 'javascript'],
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        url: 'https://tailwindcss.com',
        title: 'Tailwind CSS',
        description: 'Rapidly build modern websites without ever leaving your HTML.',
        tags: ['frontend', 'css', 'utility'],
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        url: 'https://nodejs.org',
        title: 'Node.js',
        description: 'Node.js® is a free, open-source, cross-platform JavaScript runtime environment.',
        tags: ['backend', 'runtime', 'javascript'],
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        url: 'https://vitejs.dev',
        title: 'Vite',
        description: 'Next Generation Frontend Tooling',
        tags: ['tooling', 'frontend', 'bundler'],
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        url: 'https://expressjs.com',
        title: 'Express',
        description: 'Fast, unopinionated, minimalist web framework for Node.js',
        tags: ['backend', 'framework', 'node'],
        createdAt: new Date().toISOString()
    }
];

// Helper: Fetch Title
const fetchTitle = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
        });
        const $ = cheerio.load(data);
        return $('title').text() || url;
    } catch (error) {
        console.error('Error fetching title:', error.message);
        return url;
    }
};

// Routes

// GET /api/bookmarks
app.get('/api/bookmarks', (req, res) => {
    try {
        const { tag, page = 1, limit = 10, search } = req.query;
        let result = [...bookmarks];

        // Search filter
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(lowerSearch) ||
                b.url.toLowerCase().includes(lowerSearch)
            );
        }

        // Tag filter
        if (tag) {
            result = result.filter(b => b.tags.includes(tag.toLowerCase()));
        }

        // Sort by createdAt desc
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        const startIndex = (pageInt - 1) * limitInt;
        const endIndex = pageInt * limitInt;

        const paginatedResult = result.slice(startIndex, endIndex);

        res.json({
            data: paginatedResult,
            meta: {
                total: result.length,
                page: pageInt,
                limit: limitInt,
                totalPages: Math.ceil(result.length / limitInt)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/bookmarks
app.post('/api/bookmarks', async (req, res) => {
    try {
        const { url, title, description, tags } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        let finalTitle = title;
        if (!finalTitle) {
            finalTitle = await fetchTitle(url);
        }

        const newBookmark = {
            id: uuidv4(),
            url,
            title: finalTitle,
            description: description || '',
            tags: Array.isArray(tags) ? tags.map(t => t.toLowerCase()) : [],
            createdAt: new Date().toISOString()
        };

        bookmarks.push(newBookmark);
        res.status(201).json(newBookmark);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create bookmark' });
    }
});

// PUT /api/bookmarks/:id
app.put('/api/bookmarks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { url, title, description, tags } = req.body;

        const index = bookmarks.findIndex(b => b.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        const updatedBookmark = {
            ...bookmarks[index],
            url: url || bookmarks[index].url,
            title: title || bookmarks[index].title,
            description: description !== undefined ? description : bookmarks[index].description,
            tags: Array.isArray(tags) ? tags.map(t => t.toLowerCase()) : bookmarks[index].tags
        };

        bookmarks[index] = updatedBookmark;
        res.json(updatedBookmark);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update bookmark' });
    }
});

// DELETE /api/bookmarks/:id
app.delete('/api/bookmarks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const initialLength = bookmarks.length;
        bookmarks = bookmarks.filter(b => b.id !== id);

        if (bookmarks.length === initialLength) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        res.status(200).json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete bookmark' });
    }
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
