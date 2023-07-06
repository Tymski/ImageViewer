// Select elements
const sidebar = document.querySelector('.sidebar');
const slider = document.getElementById('scale-slider');
const padding = document.getElementById('padding-slider');
const filenameToggleBtn = document.getElementById('filename-toggle-btn');

// Add event listener to toggle sidebar visibility
document.addEventListener('keydown', function (event) {
    if (event.key === 'q') {
        sidebar.classList.toggle('show');
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

// Add event listener to slider to change card size
padding.addEventListener('input', function () {
    const value = this.value + 'px';
    const cards = document.querySelectorAll('.card');
    for (let i = 0; i < cards.length; i++) {
        cards[i].style.padding = value;
    }
});

var filenamesHidden = true;

// Add event listener to toggle visibility of filenames
filenameToggleBtn.addEventListener('click', function () {
    console.log(filenamesHidden);
    const filenames = document.querySelectorAll('.card-text');
    console.log(filenames.length);
    for (let i = 0; i < filenames.length; i++) {
        if (filenamesHidden) {
            if (filenames[i].classList.contains('hidden')) continue;
            filenames[i].classList.add('hidden');
        } else {
            filenames[i].classList.remove('hidden');
        }
    }
    filenamesHidden = !filenamesHidden;
});
