const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configuration du stockage temporaire pour multer
const storage = multer.memoryStorage();

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Format de fichier non supporté'), false);
    }
};

// Configuration de multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: fileFilter
}).single('image');

// Middleware de compression et sauvegarde
const processImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        // Création d'un nom de fichier unique
        const filename = `${Date.now()}-compressed.webp`;
        const filepath = path.join('images', filename);

        // Compression et conversion en WebP avec Sharp
        await sharp(req.file.buffer)
            .resize(800, 800, { // Redimensionne l'image à max 800x800
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 }) // Convertit en WebP avec 80% de qualité
            .toFile(filepath);

        // Ajout du nom de fichier à la requête pour le contrôleur
        req.file.filename = filename;
        
        next();
    } catch (error) {
        next(error);
    }
};

// Export du middleware combiné
module.exports = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        processImage(req, res, next);
    });
};
