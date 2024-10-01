const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const restaurantRoutes = require('./routes/restaurant');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;  // Changed from 3000 to 5000

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jalsa_new');

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

// Middleware to make userId available to all views
app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    next();
});

// Add this logging
console.log('Contents of views directory:', fs.readdirSync(path.join(__dirname, 'views')));

// Add this route before app.use('/', restaurantRoutes);
app.get('/about', (req, res) => {
    res.render('about');
});

app.use('/', restaurantRoutes);

// Move this route before the restaurantRoutes
app.get('/about', (req, res) => {
    try {
        const viewPath = path.join(__dirname, 'views', 'about.ejs');
        console.log('Attempting to render:', viewPath);
        
        if (fs.existsSync(viewPath)) {
            console.log('About file exists');
            const fileContent = fs.readFileSync(viewPath, 'utf8');
            console.log('File content (first 100 chars):', fileContent.substring(0, 100));
            res.render('about');
        } else {
            console.error('About file does not exist:', viewPath);
            res.status(404).send('About page not found');
        }
    } catch (error) {
        console.error('Error rendering about page:', error);
        res.status(500).send('Error loading the About page. Please try again.');
    }
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${server.address().port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying the next available port...`);
        server.listen(0); // 0 means to use any available port
    } else {
        console.error('Error starting server:', err);
    }
});