const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    console.log('Auth middleware called');
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        console.log('Auth successful');
        next();
    } catch (error) {
        console.log('Auth failed:', error);
        res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};
