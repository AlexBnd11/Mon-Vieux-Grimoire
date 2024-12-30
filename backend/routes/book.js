const express = require('express');
const bookController = require('../controllers/book');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, bookController.createBook);
router.get('/', bookController.getBooks);
router.get('/bestrating', bookController.getBestRating);
router.put('/:id', auth, multer, bookController.updateBook);
router.post('/:id/rating', auth, bookController.createRating);
router.get('/:id', bookController.getBookById);
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;