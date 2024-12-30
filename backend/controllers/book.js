const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    // Vérification de la présence du livre et de l'image
    if (!req.body.book || !req.file) {
        return res.status(400).json({ message: 'Le livre et l\'image sont requis' });
    }

    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject._userId;

        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });

        book.save()
            .then(() => res.status(201).json({ message: 'Livre créé !' }))
            .catch(error => res.status(400).json({ error }));
    } catch (error) {
        return res.status(400).json({ message: 'Format de livre invalide' });
    }
};

exports.getBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getBestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.updateBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
    .then((book) => {
        if (book.userId !== req.auth.userId) {
            res.status(403).json({ message: 'Non autorisé' });
        } else {
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre modifié !' }))
            .catch(error => res.status(400).json({ error }));
        }
    })
    .catch(error => res.status(400).json({ error }));
};

exports.createRating = (req, res, next) => {
    const { userId, rating } = req.body;

    // Vérifie si la note est valide (entre 0 et 5)
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
    }

    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Vérifie si l'utilisateur a déjà noté ce livre
            if (book.ratings.find(r => r.userId === userId)) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
            }

            // Crée le nouvel objet rating
            const newRating = {
                userId: userId,
                grade: rating
            };
            
            // Calcule la nouvelle moyenne
            const updatedRatings = [...book.ratings, newRating];
            const newAverageRating = updatedRatings.reduce((sum, r) => sum + r.grade, 0) / updatedRatings.length;

            // Met à jour le livre avec la nouvelle note
            Book.findByIdAndUpdate(
                { _id: req.params.id },
                { 
                    $push: { ratings: newRating },
                    averageRating: Math.round(newAverageRating)
                },
                { new: true } // Pour retourner le document mis à jour
            )
            .then(updatedBook => res.status(201).json(updatedBook))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(404).json({ error }));
};

exports.getBookById = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => {
        if (book.userId !== req.auth.userId) {
            res.status(403).json({ message: 'Non autorisé' });
        } else {
            fs.unlink(`images/${book.imageUrl.split('/images/')[1]}`, () => {
                Book.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                .catch(error => res.status(400).json({ error }));
            });
        }
    })
    .catch(error => res.status(400).json({ error }));
};
