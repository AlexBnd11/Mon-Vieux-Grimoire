const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.DB_PASS,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    console.log('Requête reçue:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
    });
    next();
  });

// Middleware de parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;