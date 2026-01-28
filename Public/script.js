console.log('JavaScript lädt!');

document.getElementById('convertBtn').addEventListener('click', async () => {
    console.log('Button wurde geklickt!');

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Bitte wähle eine Markdown-Datei aus');
        return;
    }

    const formData = new FormData();
    formData.append('markdown', file);

    // Ladebalken anzeigen, Status verstecken
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