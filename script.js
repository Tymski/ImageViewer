var currentCard = null; // global variable to store currently hovered card

const main = document.querySelector('main');
// Keep a dedicated cards wrapper so we can avoid changing the font-size on the
// scrolling <main> element (setting font-size:0 on the scroll container can
// unexpectedly change mousewheel/scroll behavior in some environments).
const cardsContainer = document.getElementById('cards') || (function(){
    const el = document.createElement('div'); el.id = 'cards'; main.appendChild(el); return el;
})();

document.addEventListener('dragover', dragOverHandler, false)
document.addEventListener('drop', dropHandler, false)
document.addEventListener('mouseover', mouseOverHandler, false)
document.addEventListener('keydown', keyDownHandler, false)

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

    // Build DOM elements instead of raw HTML so we can attach load/metadata
    // handlers and apply the current active sizing to newly created media.
    const card = document.createElement('div');
    card.className = 'card';

    let media;
    if (fileType === 'image') {
        media = document.createElement('img');
        media.src = fileURL;
        media.className = 'card-picture';

        // Apply active sizing if available. If scaling is active, wait for
        // the image to load to use naturalWidth.
    const active = window.__activeSizing || { mode: 'scale', value: parseFloat(document.getElementById('image-scale-value') ? document.getElementById('image-scale-value').innerText : (document.getElementById('image-scale-slider') ? document.getElementById('image-scale-slider').value : 1)) };
        if (active.mode === 'pixel') {
            media.style.width = `${active.value}px`;
        } else {
            media.addEventListener('load', function () {
                try {
                    if (media.naturalWidth) media.style.width = `${media.naturalWidth * Number(active.value)}px`;
                } catch (e) { /* ignore */ }
            });
        }
    } else {
        media = document.createElement('video');
        media.src = fileURL;
        media.className = 'card-picture';
        media.loop = true;
        media.controls = true;
        media.disablePictureInPicture = true;
        media.muted = true;
        if (autoplayEnabled) media.autoplay = true;

    const active = window.__activeSizing || { mode: 'scale', value: parseFloat(document.getElementById('image-scale-value') ? document.getElementById('image-scale-value').innerText : (document.getElementById('image-scale-slider') ? document.getElementById('image-scale-slider').value : 1)) };
        if (active.mode === 'pixel') {
            media.style.width = `${active.value}px`;
        } else {
            // Use loadedmetadata to get intrinsic video width
            media.addEventListener('loadedmetadata', function () {
                try {
                    if (media.videoWidth) media.style.width = `${media.videoWidth * Number(active.value)}px`;
                } catch (e) { /* ignore */ }
            });
        }
    }

    const p = document.createElement('p');
    p.className = 'card-text';
    p.textContent = fileName;

    card.appendChild(media);
    card.appendChild(p);
    cardsContainer.appendChild(card);
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

// --- File/Folder Dialog Logic ---
function triggerFileDialog() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    fileInput.click();
}

function handleFileInputChange(ev) {
    removeInfoBox();
    const files = Array.from(ev.target.files);
    files.forEach(handleFile);
}

function toggleSettingsMenu() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    if (!sidebar || !menuToggle) return;
    // If the sidebar is currently shown, the user is about to hide it.
    // Toggle visibility. We no longer force-disable the 'sidebar-static'
    // checkbox. Instead, track a 'sidebar-visible' class on the body so CSS
    // layout shifts only occur when the sidebar is both static and visible.
    const willShow = !sidebar.classList.contains('show');

    sidebar.classList.toggle('show');
    // Update the menu toggle triangle using the right-pointing glyph and rotate via CSS
    const tri = menuToggle.querySelector('.menu-toggle-triangle');
    if (tri) {
        tri.textContent = '▶';
        if (sidebar.classList.contains('show')) {
            tri.classList.remove('right','down');
            tri.classList.add('left');
        } else {
            tri.classList.remove('left','down');
            tri.classList.add('right');
        }
    }

    // Update the body helper class used for layout rules.
    if (willShow) {
        document.body.classList.add('sidebar-visible');
    } else {
        document.body.classList.remove('sidebar-visible');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Info box click opens file dialog
    const infoBoxTop = document.getElementById('info-box-top');
    if (infoBoxTop) {
        infoBoxTop.addEventListener('click', triggerFileDialog);
    }

    const infoBoxBottom = document.getElementById('info-box-bottom');
    if (infoBoxBottom) {
        infoBoxBottom.addEventListener('click', toggleSettingsMenu);
    }

    // File input change handler
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileInputChange);
    }
    // Menu toggle button logic
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        // Remove any previous event listeners if needed (not strictly necessary in DOMContentLoaded)
        menuToggle.onclick = toggleSettingsMenu;
        // Initialize symbol
        const sidebarEl = document.getElementById('sidebar');
        const triInit = menuToggle.querySelector('.menu-toggle-triangle');
        if (triInit) {
            triInit.textContent = '▶';
            if (sidebarEl && sidebarEl.classList.contains('show')) {
                triInit.classList.remove('right','down');
                triInit.classList.add('left');
            } else {
                triInit.classList.remove('left','down');
                triInit.classList.add('right');
            }
        }
    }
    // Hide menu button checkbox logic
    const hideMenuBtnCheckbox = document.getElementById('hide-menu-btn');
    if (hideMenuBtnCheckbox && menuToggle) {
        hideMenuBtnCheckbox.addEventListener('change', function() {
            menuToggle.style.display = this.checked ? 'none' : '';
        });
    }
    // Open file button in menu
    const openFileBtn = document.getElementById('open-file-btn');
    if (openFileBtn) {
        openFileBtn.addEventListener('click', function() {
            triggerFileDialog();
        });
    }
});