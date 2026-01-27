const express = require('express');
const app = express();
const port = 3000;

// Statische Dateien aus public-Ordner bereitstellen
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Upload-Konfiguration
const upload = multer({ dest: 'uploads/' });

// Uploads-Ordner erstellen falls nicht vorhanden
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.post('/upload', upload.single('markdown'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const markdown = fs.readFileSync(filePath, 'utf-8');

        res.json({
            success: true,
            message: 'Datei erfolgreich hochgeladen',
            content: markdown
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});