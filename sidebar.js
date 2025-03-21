// Select elements
const sidebar = document.querySelector('.sidebar');
const pixelSizeSlider = document.getElementById('scale-slider');
const pixelSliderValue = document.getElementById('scale-value');
const imageScaleSlider = document.getElementById('image-scale-slider');
const imageScaleValue = document.getElementById('image-scale-value');
const paddingSlider = document.getElementById('padding-slider');
const paddingValue = document.getElementById('padding-value');
const body = document.querySelector('body');
const root = document.querySelector(':root');
const switchSidesBtn = document.getElementById('switch-sides');
const filenamesCheckbox = document.getElementById('filenames');
const autoplayCheckbox = document.getElementById('autoplay');

document.addEventListener('keydown', function (event) {
    if (event.key === 'q' || event.key === 'Tab' || event.key === '`') {
        sidebar.classList.toggle('show');
        event.preventDefault();
    } else if (event.key === 'n') {
        filenamesCheckbox.click();
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

paddingSlider.addEventListener('input', function () { changePadding(this.value) });
paddingValue.addEventListener('blur', function (event) { changePadding(event.target.innerText) });
function changePadding(value) {
    value = parseFloat(value);
    if (isNaN(value)) return;
    root.style.setProperty('--card-padding', value + 'px');
    paddingSlider.value = value;
    paddingValue.innerText = value;
}

switchSidesBtn.addEventListener('click', function () {
    sidebar.classList.toggle('left');
    sidebar.classList.toggle('right');
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

function toggleAutoplay(checkbox) {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (checkbox.checked) {
            video.play();
        } else {
            video.pause();
        }
    });
}