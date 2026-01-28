console.log('JavaScript lädt!');
// Dark Mode Funktionalität
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Prüfe, ob Dark Mode in localStorage gespeichert ist
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    themeToggle.checked = true;
}

// Toggle Dark Mode
themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
});
// Export Format Selection
let selectedFormat = 'pdf';

document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = btn.dataset.format;
    });
});
// Globale Variablen
let uploadedFiles = []; // Array für mehrere Dateien
let uploadMode = 'single'; // 'single' oder 'multiple'

// Upload Mode Toggle
document.querySelectorAll('input[name="uploadMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        uploadMode = e.target.value;
        updateUploadUI();
    });
});

function updateUploadUI() {
    const dropZoneTitle = document.getElementById('dropZoneTitle');
    const fileButtonText = document.getElementById('fileButtonText');
    const fileInput = document.getElementById('fileInput');

    if (uploadMode === 'multiple') {
        dropZoneTitle.textContent = 'Markdown-Dateien hier ablegen';
        fileButtonText.textContent = 'Dateien auswählen';
        fileInput.setAttribute('multiple', '');
    } else {
        dropZoneTitle.textContent = 'Markdown-Datei hier ablegen';
        fileButtonText.textContent = 'Datei auswählen';
        fileInput.removeAttribute('multiple');
        uploadedFiles = [];
        updateFilesList();
    }
}

// Drag & Drop Funktionalität
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');

// Verhindere Standard-Verhalten
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Hover-Effekt beim Drag
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
    }, false);
});

// Datei beim Drop verarbeiten
dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleFiles(files);
}, false);

// Datei beim Klick auf Button verarbeiten
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

// Click auf Drop Zone öffnet File Dialog
dropZone.addEventListener('click', (e) => {
    if (e.target === dropZone || e.target.closest('.drop-zone')) {
        fileInput.click();
    }
});

// Datei-Handling
function handleFiles(files) {
    const mdFiles = Array.from(files).filter(file => file.name.endsWith('.md'));

    if (mdFiles.length === 0) {
        fileInfo.textContent = '⚠ Bitte nur .md Dateien hochladen';
        fileInfo.style.color = '#f44336';
        return;
    }

    if (uploadMode === 'single') {
        uploadedFiles = [mdFiles[0]];
        fileInfo.textContent = `✓ ${mdFiles[0].name} ausgewählt`;
        fileInfo.style.color = '#4CAF50';

        const suggestedName = mdFiles[0].name.replace('.md', '');
        document.getElementById('filenameInput').value = suggestedName;
    } else {
        // Mehrfach-Modus
        mdFiles.forEach(file => {
            if (!uploadedFiles.some(f => f.name === file.name)) {
                uploadedFiles.push(file);
            }
        });
        fileInfo.textContent = `✓ ${uploadedFiles.length} Datei(en) ausgewählt`;
        fileInfo.style.color = '#4CAF50';
        updateFilesList();
    }
}

// Dateien-Liste anzeigen
function updateFilesList() {
    const filesList = document.getElementById('filesList');
    const filesListItems = document.getElementById('filesListItems');

    if (uploadMode === 'multiple' && uploadedFiles.length > 0) {
        filesList.style.display = 'block';
        filesListItems.innerHTML = '';

        uploadedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="file-item-name">${index + 1}. ${file.name}</span>
                <div class="file-item-actions">
                    <button class="file-item-btn move-up-btn" onclick="moveFile(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="file-item-btn move-down-btn" onclick="moveFile(${index}, 1)" ${index === uploadedFiles.length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="file-item-btn remove-btn" onclick="removeFile(${index})">✕</button>
                </div>
            `;
            filesListItems.appendChild(li);
        });
    } else {
        filesList.style.display = 'none';
    }
}

// Datei in der Liste verschieben
function moveFile(index, direction) {
    if (index + direction < 0 || index + direction >= uploadedFiles.length) return;

    const temp = uploadedFiles[index];
    uploadedFiles[index] = uploadedFiles[index + direction];
    uploadedFiles[index + direction] = temp;

    updateFilesList();
}

// Datei aus der Liste entfernen
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFilesList();

    if (uploadedFiles.length === 0) {
        fileInfo.textContent = '';
    } else {
        fileInfo.textContent = `✓ ${uploadedFiles.length} Datei(en) ausgewählt`;
    }
}

// Alle Dateien entfernen
document.getElementById('clearFilesBtn').addEventListener('click', () => {
    uploadedFiles = [];
    updateFilesList();
    fileInfo.textContent = '';
});

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
    updatePreview();
});

// Live Preview Funktion
function updatePreview() {
    const markdown = document.getElementById('markdownEditor').value;
    const preview = document.getElementById('markdownPreview');

    let html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
        .replace(/\n/gim, '<br>');

    preview.innerHTML = html || '<p style="color: #999;">Deine Vorschau erscheint hier...</p>';
}

document.getElementById('markdownEditor').addEventListener('input', updatePreview);

// Konvertieren Button
document.getElementById('convertBtn').addEventListener('click', async () => {
    console.log('Button wurde geklickt!');

    let markdownContent = '';

    if (document.getElementById('uploadTab').classList.contains('active')) {
        // Upload-Modus
        if (uploadedFiles.length === 0) {
            alert('Bitte wähle mindestens eine Markdown-Datei aus');
            return;
        }

        // Alle Dateien zusammenfügen
        for (const file of uploadedFiles) {
            const content = await file.text();
            markdownContent += content + '\n\n---\n\n'; // Trennlinie zwischen Dateien
        }
    } else {
        // Editor-Modus
        markdownContent = document.getElementById('markdownEditor').value;

        if (!markdownContent.trim()) {
            alert('Bitte schreibe etwas Markdown-Text');
            return;
        }
    }

    let filename = document.getElementById('filenameInput').value.trim();
    if (!filename) {
        alert('Bitte gib einen Dateinamen ein');
        return;
    }

    // Markdown als Blob für FormData erstellen
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const formData = new FormData();
    formData.append('markdown', blob, 'document.md');
    formData.append('filename', filename);

// PDF Style Optionen hinzufügen
    formData.append('fontSize', document.getElementById('fontSize').value);
    formData.append('fontFamily', document.getElementById('fontFamily').value);
    formData.append('margins', document.getElementById('margins').value);
    formData.append('lineHeight', document.getElementById('lineHeight').value);

    document.getElementById('loadingContainer').style.display = 'block';
    document.getElementById('status').style.display = 'none';

    try {
        // Je nach Format die richtige Route aufrufen
        let endpoint = '/convert'; // PDF
        if (selectedFormat === 'html') {
            endpoint = '/export-html';
        } else if (selectedFormat === 'docx') {
            endpoint = '/export-docx';
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('status').style.display = 'block';

        if (result.success) {
            if (selectedFormat === 'pdf') {
                // PDF-Vorschau anzeigen
                showPdfPreview(result.pdfUrl, filename);
            } else {
                // Direkter Download für HTML/DOCX
                const extension = selectedFormat;
                const downloadLink = document.createElement('a');
                downloadLink.href = result.fileUrl;
                downloadLink.download = `${filename}.${extension}`;
                downloadLink.click();

                document.getElementById('status').innerHTML =
                    `✅ ${extension.toUpperCase()} erfolgreich erstellt! <a href="${result.fileUrl}" download="${filename}.${extension}">Erneut herunterladen</a>`;
            }
        } else {
            document.getElementById('status').textContent = '❌ Fehler: ' + result.error;
        }
    } catch (error) {
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('status').style.display = 'block';
        document.getElementById('status').textContent = '❌ Fehler: ' + error.message;
    }
});
// PDF Preview Funktionen
let currentPdfUrl = '';
let currentPdfFilename = '';

function showPdfPreview(pdfUrl, filename) {
    currentPdfUrl = pdfUrl;
    currentPdfFilename = filename;

    const modal = document.getElementById('pdfPreviewModal');
    const iframe = document.getElementById('pdfPreviewFrame');

    // PDF im iframe laden
    iframe.src = pdfUrl;

    // Modal anzeigen
    modal.classList.add('active');

    // Status aktualisieren
    document.getElementById('status').innerHTML =
        `✅ PDF erfolgreich erstellt!`;
}

function closePdfPreview() {
    const modal = document.getElementById('pdfPreviewModal');
    const iframe = document.getElementById('pdfPreviewFrame');

    modal.classList.remove('active');
    iframe.src = '';
}

// Event Listeners für Modal
document.getElementById('closePreview').addEventListener('click', closePdfPreview);
document.getElementById('closePreviewBtn').addEventListener('click', closePdfPreview);

// Download Button
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = currentPdfUrl;
    link.download = `${currentPdfFilename}.pdf`;
    link.click();
});

// Modal schließen bei Klick außerhalb
document.getElementById('pdfPreviewModal').addEventListener('click', (e) => {
    if (e.target.id === 'pdfPreviewModal') {
        closePdfPreview();
    }
});

// ESC-Taste zum Schließen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePdfPreview();
    }
});