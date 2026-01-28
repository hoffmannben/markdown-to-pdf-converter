const express = require('express');
const multer = require('multer');
const { marked } = require('marked');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Upload-Konfiguration
const upload = multer({ dest: 'uploads/' });

// Uploads-Ordner erstellen falls nicht vorhanden
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Statische Dateien aus public-Ordner bereitstellen
app.use(express.static('public'));

// Uploads-Ordner auch öffentlich machen (für PDF-Download)
app.use('/uploads', express.static('uploads'));

// Konvertierungs-Route
app.post('/convert', upload.single('markdown'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const markdown = fs.readFileSync(filePath, 'utf-8');

        // Markdown zu HTML
        const html = marked(markdown);

        // HTML zu PDF mit Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);

        const pdfPath = `uploads/output-${Date.now()}.pdf`;
        await page.pdf({ path: pdfPath, format: 'A4' });

        await browser.close();

        // Temporäre Markdown-Datei löschen
        fs.unlinkSync(filePath);

        res.json({
            success: true,
            pdfUrl: `/${pdfPath}`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});