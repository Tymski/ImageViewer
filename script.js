var currentCard = null; // global variable to store currently hovered card

const main = document.querySelector('main');

document.addEventListener('dragover', dragOverHandler, false)
document.addEventListener('drop', dropHandler, false)
document.addEventListener('mouseover', mouseOverHandler, false) // new event listener
document.addEventListener('keydown', keyDownHandler, false) // new event listener

async function dropHandler(ev) {
    if (ev.target.closest('.sidebar')) return;
    removeInfoBox();
    console.log('File(s) dropped');
    ev.preventDefault();

    // Handle items from DataTransfer
    if (ev.dataTransfer.items) {
        const items = Array.from(ev.dataTransfer.items);
        const promises = items.map(async item => {
            if (item.webkitGetAsEntry) {
                const entry = item.webkitGetAsEntry();
                if (entry.isDirectory) { await handleDirectory(entry); } else if (entry.isFile) { await handleFileEntry(entry); }
            } else if (item.kind === 'file') { handleFile(item.getAsFile()); }
        });
        await Promise.all(promises);
    } else {
        // Handle files directly (fallback)
        Array.from(ev.dataTransfer.files).forEach(file => { handleFile(file); });
    }
}

async function handleDirectory(directoryEntry) {
    const dirReader = directoryEntry.createReader();
    await readDirectory(dirReader);
}

async function readDirectory(dirReader) {
    try {
        const entries = await new Promise((resolve, reject) => { dirReader.readEntries(resolve, reject); });
        for (let entry of entries) {
            if (entry.isDirectory) { await handleDirectory(entry); } else { await handleFileEntry(entry); }
        }
        if (entries.length > 0) { await readDirectory(dirReader); }
    } catch (error) {
        console.error('Error reading directory:', error);
    }
}

async function handleFileEntry(fileEntry) {
    try {
        const file = await new Promise((resolve, reject) => { fileEntry.file(resolve, reject); });
        handleFile(file);
    } catch (error) {
        console.error('Error handling file entry:', error);
    }
}

function handleFile(file) {
    const fileType = getFileType(file.name);
    if (fileType === 'unsupported') return;
    createDOMElements(URL.createObjectURL(file), file.name, fileType);
}

function getFileType(fileName) {
    const extension = fileName.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'tif', 'bmp', 'svg', 'heic', 'heif'].includes(extension)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'flv', 'wmv'].includes(extension)) return 'video';
    return 'unsupported';
}

function dragOverHandler(ev) {
    if (ev.target.closest('.sidebar')) return;
    console.log('File(s) in drop zone');
    ev.preventDefault();
}

function createDOMElements(fileURL, fileName, fileType) {
    const autoplayEnabled = document.getElementById('autoplay').checked;
    const mediaElement = fileType === 'image'
        ? `<img src="${fileURL}" class="card-picture" />`
        : `<video src="${fileURL}" class="card-picture" loop controls disablePictureInPicture muted ${autoplayEnabled ? 'autoplay' : ''}></video>`;

    var div = `
        <div class="card">
            ${mediaElement}
            <p class="card-text">${fileName}</p>
        </div>
    `;
    main.appendChild(htmlToElement(div));
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function mouseOverHandler(ev) {
    currentCard = ev.target.closest('.card');
}

function keyDownHandler(ev) {
    if (ev.key === 'Delete' && currentCard !== null) {
        deleteCurrentCard();
    }
}

function deleteCurrentCard() {
    currentCard.parentNode.removeChild(currentCard);
}

function removeInfoBox() {
    let infoBox = document.querySelector("#info-box");
    if (!infoBox) return;
    infoBox.remove();
}