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
                createDOMElements(URL.createObjectURL(ev.dataTransfer.files[i]), file.name);
            }
        }
    } else {
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        }
    }
}

function dragOverHandler(ev) {
    if (ev.target.closest('.sidebar')) return;
    console.log('File(s) in drop zone');
    ev.preventDefault();
}

function createDOMElements(imageURL, fileName) {
    var div = `
        <div class="card">
            <img src="${imageURL}" class="card-picture" />
            <p class="card-text">${fileName}</p>
        </div>
    `;
    main.appendChild(htmlToElement(div));
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
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