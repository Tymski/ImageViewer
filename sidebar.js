// Select elements
const sidebar = document.querySelector('.sidebar');
const pixelSizeSlider = document.getElementById('scale-slider');
const pixelSliderValue = document.getElementById('scale-value');
const imageScaleSlider = document.getElementById('image-scale-slider');
const imageScaleValue = document.getElementById('image-scale-value');
const padding = document.getElementById('padding-slider');
const body = document.querySelector('body');
const root = document.querySelector(':root');

document.addEventListener('keydown', function (event) {
    if (event.key === 'q' || event.key === 'Tab' || event.key === '`') {
        sidebar.classList.toggle('show');
        event.preventDefault(); // Prevent default Tab behavior
    }
});

const numberSpans = document.querySelectorAll("span.number");
for (let i = 0; i < numberSpans.length; i++) {
    const number = numberSpans[i];
    number.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.blur();
        }
    });
}

pixelSizeSlider.addEventListener('input', function () { changePixelSize(this.value) });
pixelSliderValue.addEventListener('blur', function (event) { changePixelSize(event.target.innerText) });
function changePixelSize(size) {
    size = parseFloat(size);
    if (isNaN(size)) return;
    const value = `${size}px`;
    const cards = document.querySelectorAll('.card-picture');
    for (let i = 0; i < cards.length; i++) {
        cards[i].style.width = value;
    }
    pixelSliderValue.innerText = size;
}

imageScaleSlider.addEventListener('input', function () { changeImageScale(this.value) });
imageScaleValue.addEventListener('blur', function (event) { changeImageScale(event.target.innerText) });
function changeImageScale(scale) {
    scale = parseFloat(scale);
    if (isNaN(scale)) return;
    const cards = document.querySelectorAll('.card-picture');
    for (let i = 0; i < cards.length; i++) {
        const width = cards[i].naturalWidth * scale;
        const value = `${width}px`;
        cards[i].style.width = value;
    }
    imageScaleValue.innerText = scale;
}

padding.addEventListener('input', function () {
    root.style.setProperty('--card-padding', this.value + 'px');
});

function toggleFilenames(checkbox) {
    body.classList.toggle('hide-filenames', !checkbox.checked);
}

function togglePointFilter(checkbox) {
    body.classList.toggle('point-filter', checkbox.checked);
}

function changeBackground(color) {
    document.body.style.backgroundColor = color
}

function toggleCenterImages(checkbox) {
    body.classList.toggle('center-content', checkbox.checked);
    main.classList.toggle('center-text', checkbox.checked);
}