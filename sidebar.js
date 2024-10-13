// Select elements
const sidebar = document.querySelector('.sidebar');
const slider = document.getElementById('scale-slider');
const padding = document.getElementById('padding-slider');
const body = document.querySelector('body');
const root = document.querySelector(':root');

// Add event listener to toggle sidebar visibility
document.addEventListener('keydown', function (event) {
    if (event.key === 'q' || event.key === 'Tab' || event.key === '`') {
        sidebar.classList.toggle('show');
        event.preventDefault(); // Prevent default Tab behavior
    }
});

// Add event listener to slider to change card size
slider.addEventListener('input', function () {
    const value = this.value + 'px';
    const cards = document.querySelectorAll('.card-picture');
    for (let i = 0; i < cards.length; i++) {
        cards[i].style.width = value;
    }
});

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