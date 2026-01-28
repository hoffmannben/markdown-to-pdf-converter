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

        // Dateiname und Styles aus Request holen
        const filename = req.body.filename || 'output';
        const fontSize = req.body.fontSize || 'normal';
        const fontFamily = req.body.fontFamily || 'serif';
        const margins = req.body.margins || 'normal';
        const lineHeight = req.body.lineHeight || 'normal';

        // Style-Mappings
        const fontSizeMap = {
            small: '10pt',
            normal: '12pt',
            large: '14pt',
            xlarge: '16pt'
        };

        const fontFamilyMap = {
            serif: 'Georgia, "Times New Roman", serif',
            'sans-serif': 'Arial, Helvetica, sans-serif',
            monospace: '"Courier New", Courier, monospace'
        };

        const marginsMap = {
            narrow: '1cm',
            normal: '2cm',
            wide: '3cm'
        };

        const lineHeightMap = {
            compact: '1.3',
            normal: '1.6',
            relaxed: '2.0'
        };

        // Markdown zu HTML
        const markdownHtml = marked(markdown);

        // HTML mit Styles
        const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: ${fontFamilyMap[fontFamily]};
                    font-size: ${fontSizeMap[fontSize]};
                    line-height: ${lineHeightMap[lineHeight]};
                    margin: ${marginsMap[margins]};
                    color: #333;
                }
                h1 {
                    color: #2c3e50;
                    border-bottom: 3px solid #3498db;
                    padding-bottom: 10px;
                    margin-top: 0;
                }
                h2 {
                    color: #34495e;
                    border-bottom: 2px solid #95a5a6;
                    padding-bottom: 8px;
                }
                h3 {
                    color: #555;
                }
                code {
                    background-color: #f4f4f4;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: "Courier New", monospace;
                }
                pre {
                    background-color: #f4f4f4;
                    padding: 15px;
                    border-radius: 5px;
                    overflow-x: auto;
                }
                blockquote {
                    border-left: 4px solid #3498db;
                    padding-left: 15px;
                    color: #555;
                    font-style: italic;
                }
                a {
                    color: #3498db;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                ul, ol {
                    padding-left: 30px;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background-color: #3498db;
                    color: white;
                }
            </style>
        </head>
        <body>
            ${markdownHtml}
        </body>
        </html>
        `;

        // HTML zu PDF mit Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(styledHtml, { waitUntil: 'networkidle0' });

        const pdfPath = `uploads/${filename}-${Date.now()}.pdf`;
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: marginsMap[margins],
                right: marginsMap[margins],
                bottom: marginsMap[margins],
                left: marginsMap[margins]
            }
        });

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