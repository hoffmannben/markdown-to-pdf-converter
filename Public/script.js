console.log('JavaScript lädt!');

document.getElementById('convertBtn').addEventListener('click', async () => {
    console.log('Button wurde geklickt!');

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Bitte wähle eine Markdown-Datei aus');
        return;
    }

    // Rest des Codes...
});
document.getElementById('convertBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Bitte wähle eine Markdown-Datei aus');
        return;
    }

    const text = await file.text();
    console.log('Dateiinhalt:', text);
    document.getElementById('status').textContent = 'Datei gelesen!';
});
document.getElementById('convertBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Bitte wähle eine Markdown-Datei aus');
        return;
    }

    const formData = new FormData();
    formData.append('markdown', file);

    document.getElementById('status').textContent = 'Wird hochgeladen...';

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    document.getElementById('status').textContent = result.message;
});
document.getElementById('convertBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Bitte wähle eine Markdown-Datei aus');
        return;
    }

    const formData = new FormData();
    formData.append('markdown', file);

    document.getElementById('status').textContent = 'Wird konvertiert...';

    const response = await fetch('/convert', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (result.success) {
        document.getElementById('status').innerHTML =
            `Fertig! <a href="${result.pdfUrl}" download>PDF herunterladen</a>`;
    } else {
        document.getElementById('status').textContent = 'Fehler: ' + result.error;
    }
});