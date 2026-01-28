console.log('JavaScript lädt!');

// Tab-Wechsel
document.getElementById('uploadTab').addEventListener('click', () => {
    document.getElementById('uploadTab').classList.add('active');
    document.getElementById('editorTab').classList.remove('active');
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('editorSection').style.display = 'none';
});

document.getElementById('editorTab').addEventListener('click', () => {
    document.getElementById('editorTab').classList.add('active');
    document.getElementById('uploadTab').classList.remove('active');
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
});

// Konvertieren Button
document.getElementById('convertBtn').addEventListener('click', async () => {
    console.log('Button wurde geklickt!');

    let markdownContent = '';

    // Prüfen, welcher Tab aktiv ist
    if (document.getElementById('uploadTab').classList.contains('active')) {
        // Datei-Upload-Modus
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            alert('Bitte wähle eine Markdown-Datei aus');
            return;
        }

        markdownContent = await file.text();
    } else {
        // Editor-Modus
        markdownContent = document.getElementById('markdownEditor').value;

        if (!markdownContent.trim()) {
            alert('Bitte schreibe etwas Markdown-Text');
            return;
        }
    }

    // Markdown als Blob für FormData erstellen
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const formData = new FormData();
    formData.append('markdown', blob, 'document.md');

    // Ladebalken anzeigen
    document.getElementById('loadingContainer').style.display = 'block';
    document.getElementById('status').style.display = 'none';

    try {
        const response = await fetch('/convert', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        // Ladebalken verstecken
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('status').style.display = 'block';

        if (result.success) {
            document.getElementById('status').innerHTML =
                `✅ Fertig! <a href="${result.pdfUrl}" download>PDF herunterladen</a>`;
        } else {
            document.getElementById('status').textContent = '❌ Fehler: ' + result.error;
        }
    } catch (error) {
        // Ladebalken verstecken bei Fehler
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('status').style.display = 'block';
        document.getElementById('status').textContent = '❌ Fehler: ' + error.message;
    }
});