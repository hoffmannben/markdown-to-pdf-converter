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
    // Preview beim Wechsel aktualisieren
    updatePreview();
});

// Live Preview Funktion - Einfache Markdown → HTML Konvertierung
function updatePreview() {
    const markdown = document.getElementById('markdownEditor').value;
    const preview = document.getElementById('markdownPreview');

    // Einfache Markdown-Konvertierung (für Preview)
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
        // Line breaks
        .replace(/\n/gim, '<br>');

    preview.innerHTML = html || '<p style="color: #999;">Deine Vorschau erscheint hier...</p>';
}

// Live Preview bei jedem Tastendruck aktualisieren
document.getElementById('markdownEditor').addEventListener('input', updatePreview);

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