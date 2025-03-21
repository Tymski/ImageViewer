var currentCard = null; // global variable to store currently hovered card

const main = document.querySelector('main');

document.addEventListener('dragover', dragOverHandler, false)
document.addEventListener('drop', dropHandler, false)
document.addEventListener('mouseover', mouseOverHandler, false) // new event listener
document.addEventListener('keydown', keyDownHandler, false) // new event listener

function dropHandler(ev) {
    if (ev.target.closest('.sidebar')) return;
    removeInfoBox();
    console.log('File(s) dropped');
    ev.preventDefault();
    if (ev.dataTransfer.items) {
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                console.log('... file[' + i + '].name = ' + file.name);
                handleFile(file);
            }
        }
    } else {
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            handleFile(ev.dataTransfer.files[i]);
        }
    }
}

function handleFile(file) {
    const fileType = getFileType(file.name);
    if (fileType === 'unsupported') return;
    createDOMElements(URL.createObjectURL(file), file.name, fileType);
}

function getFileType(fileName) {
    const extension = fileName.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mkv'].includes(extension)) return 'video';
    return 'unsupported';
}

function dragOverHandler(ev) {
    if (ev.target.closest('.sidebar')) return;
    console.log('File(s) in drop zone');
    ev.preventDefault();
}

function createDOMElements(fileURL, fileName, fileType) {
    const mediaElement = fileType === 'image' 
        ? `<img src="${fileURL}" class="card-picture" />`
        : `<video src="${fileURL}" class="card-picture" loop autoplay muted controls disablePictureInPicture></video>`;

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