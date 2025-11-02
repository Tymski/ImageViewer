// Toggle sidebar between overlay and static (occupying space)
function toggleSidebarStatic(checkbox) {
    // Toggle the 'sidebar-static' helper class which controls whether the
    // sidebar should occupy layout space when open.
    document.body.classList.toggle('sidebar-static', checkbox.checked);
    const sidebarEl = document.getElementById('sidebar');
    // If the checkbox is enabled and the sidebar is currently shown, ensure
    // the 'sidebar-visible' class is present so layout (margins) will shift.
    // Important: do NOT remove 'sidebar-visible' here when the checkbox is
    // unchecked — visibility is driven by the sidebar's open/closed state
    // (see toggleSettingsMenu). Removing it here caused the menu-toggle to
    // snap back to the closed position when the user toggled the checkbox.
    if (checkbox.checked && sidebarEl && sidebarEl.classList.contains('show')) {
        document.body.classList.add('sidebar-visible');
    }
}
// Select elements
const sidebar = document.querySelector('.sidebar');
const pixelSizeSlider = document.getElementById('scale-slider');
const pixelSliderValue = document.getElementById('scale-value');
const imageScaleSlider = document.getElementById('image-scale-slider');
const imageScaleValue = document.getElementById('image-scale-value');
const paddingSlider = document.getElementById('padding-slider');
const paddingValue = document.getElementById('padding-value');
const filenameSizeSlider = document.getElementById('filename-size-slider');
const filenameSizeValue = document.getElementById('filename-size-value');
const maxWidthSlider = document.getElementById('max-width-slider');
const maxWidthValue = document.getElementById('max-width-value');
const maxHeightSlider = document.getElementById('max-height-slider');
const maxHeightValue = document.getElementById('max-height-value');
const body = document.querySelector('body');
const root = document.querySelector(':root');
const switchSidesBtn = document.getElementById('switch-sides');
const filenamesCheckbox = document.getElementById('filenames');
const autoplayCheckbox = document.getElementById('autoplay');

// Track which sizing control was last used. Accessible by other scripts when
// creating new media so imported items follow the 'active' sizing.
window.__activeSizing = {
    mode: 'scale', // 'pixel' or 'scale' (default to scale)
    value: parseFloat(imageScaleValue ? imageScaleValue.innerText : (imageScaleSlider ? imageScaleSlider.value : 1))
};

// Helper: toggle visual active marker on the slider containers
function setActiveControl(mode) {
    const pixelContainer = pixelSizeSlider ? pixelSizeSlider.closest('.slider-container') : null;
    const scaleContainer = imageScaleSlider ? imageScaleSlider.closest('.slider-container') : null;
    if (pixelContainer) pixelContainer.classList.toggle('active', mode === 'pixel');
    if (scaleContainer) scaleContainer.classList.toggle('active', mode === 'scale');
}
// initialize visual marker
setActiveControl(window.__activeSizing.mode);

document.addEventListener('keydown', function (event) {
    if (event.key === 'q' || event.key === 'Tab' || event.key === '`') {
        // Just toggle the settings menu. We no longer forcibly turn off the
        // 'sidebar-static' checkbox here; instead layout is applied only when
        // the sidebar is both static and visible.
        if (typeof toggleSettingsMenu === 'function') toggleSettingsMenu();
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
    // mark pixel sizing as the active mode
    window.__activeSizing.mode = 'pixel';
    window.__activeSizing.value = size;
    setActiveControl('pixel');
}

imageScaleSlider.addEventListener('input', function () { changeImageScale(this.value) });
imageScaleValue.addEventListener('blur', function (event) { changeImageScale(event.target.innerText) });
function changeImageScale(scale) {
    scale = parseFloat(scale);
    if (isNaN(scale)) return;
    const cards = document.querySelectorAll('.card-picture');
    for (let i = 0; i < cards.length; i++) {
        // Only apply scale when we can derive a source width.
        try {
            if (cards[i].tagName === 'IMG' && cards[i].naturalWidth) {
                const width = cards[i].naturalWidth * scale;
                cards[i].style.width = `${width}px`;
            } else if (cards[i].tagName === 'VIDEO' && cards[i].videoWidth) {
                const width = cards[i].videoWidth * scale;
                cards[i].style.width = `${width}px`;
            }
        } catch (e) {
            // ignore and continue
        }
    }
    imageScaleValue.innerText = scale;
    // mark image-scaling as the active mode
    window.__activeSizing.mode = 'scale';
    window.__activeSizing.value = scale;
    setActiveControl('scale');
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

// Filename size control
if (filenameSizeSlider) filenameSizeSlider.addEventListener('input', function () { changeFilenameSize(this.value) });
if (filenameSizeValue) filenameSizeValue.addEventListener('blur', function (event) { changeFilenameSize(event.target.innerText) });
function changeFilenameSize(size) {
    size = parseFloat(size);
    if (isNaN(size)) return;
    root.style.setProperty('--filename-size', size + 'px');
    if (filenameSizeSlider) filenameSizeSlider.value = size;
    if (filenameSizeValue) filenameSizeValue.innerText = size;
}

// Max card width/height controls. A slider value of 0 means "none" (no limit).
if (maxWidthSlider) maxWidthSlider.addEventListener('input', function () { changeMaxWidth(this.value) });
if (maxWidthValue) maxWidthValue.addEventListener('blur', function (event) { changeMaxWidth(event.target.innerText) });
function changeMaxWidth(value) {
    try {
        if (typeof value === 'string' && value.trim().toLowerCase() === 'none') value = '0';
        value = parseFloat(value);
        if (isNaN(value)) return;
        if (value === 0) {
            // remove constraint
            root.style.removeProperty('--card-max-width');
            if (maxWidthValue) maxWidthValue.innerText = 'none';
            if (maxWidthSlider) maxWidthSlider.value = 0;
        } else {
            root.style.setProperty('--card-max-width', value + 'px');
            if (maxWidthValue) maxWidthValue.innerText = value;
            if (maxWidthSlider) maxWidthSlider.value = value;
        }
    } catch (e) { /* ignore */ }
}

if (maxHeightSlider) maxHeightSlider.addEventListener('input', function () { changeMaxHeight(this.value) });
if (maxHeightValue) maxHeightValue.addEventListener('blur', function (event) { changeMaxHeight(event.target.innerText) });
function changeMaxHeight(value) {
    try {
        if (typeof value === 'string' && value.trim().toLowerCase() === 'none') value = '0';
        value = parseFloat(value);
        if (isNaN(value)) return;
        if (value === 0) {
            root.style.removeProperty('--card-max-height');
            if (maxHeightValue) maxHeightValue.innerText = 'none';
            if (maxHeightSlider) maxHeightSlider.value = 0;
        } else {
            root.style.setProperty('--card-max-height', value + 'px');
            if (maxHeightValue) maxHeightValue.innerText = value;
            if (maxHeightSlider) maxHeightSlider.value = value;
        }
    } catch (e) { /* ignore */ }
}

switchSidesBtn.addEventListener('click', function () {
    sidebar.classList.toggle('left');
    sidebar.classList.toggle('right');
    // Keep a helper class on the body to indicate which side the sidebar is on
    if (sidebar.classList.contains('right')) {
        document.body.classList.add('sidebar-right');
        document.body.classList.remove('sidebar-left');
    } else {
        document.body.classList.add('sidebar-left');
        document.body.classList.remove('sidebar-right');
    }
});

function toggleFilenames(checkbox) {
    body.classList.toggle('hide-filenames', !checkbox.checked);
}

function togglePointFilter(checkbox) {
    body.classList.toggle('point-filter', checkbox.checked);
}

function changeBackground(color) {
    document.body.style.backgroundColor = color;
    // update the hex input if present
    const hexInput = document.getElementById('background-hex');
    if (hexInput) hexInput.value = color;
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

// Menu toggle, hide button, file dialog, and info-box click logic
function openFileDialog(event) {
    // Prevent triggering if clicking a link or button inside info-box
    if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') return;
    document.getElementById('file-input').click();
}

function toggleMenuButton(checkbox) {
    const btn = document.getElementById('menu-toggle');
    btn.style.display = checkbox.checked ? 'none' : '';
}


function setupFileDialogButton() {
    const btn = document.getElementById('open-file-btn');
    if (btn) {
        btn.onclick = () => document.getElementById('file-input').click();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupFileDialogButton();
    // Ensure body has an initial sidebar side class matching the sidebar element
    if (sidebar) {
        if (sidebar.classList.contains('right')) {
            document.body.classList.add('sidebar-right');
        } else {
            document.body.classList.add('sidebar-left');
        }
    }
    // Setup Display filenames below control
    const filenameBelow = document.getElementById('filename-below');
    if (filenameBelow) {
        filenameBelow.addEventListener('change', function() {
            document.body.classList.toggle('filenames-below', this.checked);
        });
    }
    // Stop all videos button
    const stopBtn = document.getElementById('stop-videos-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            const videos = document.querySelectorAll('video');
            videos.forEach(v => { v.pause(); v.currentTime = 0; });
        });
    }
    // Background hex input behavior
    const bgHex = document.getElementById('background-hex');
    if (bgHex) {
        bgHex.addEventListener('change', function() {
            changeBackground(this.value);
        });
    }
    
    // --- Settings persistence: Save settings to IndexedDB when enabled ---
    const saveToggle = document.getElementById('save-settings-toggle');
    const SAVE_KEY = 'settings';
    // Simple debounce so rapid input doesn't hammer the DB
    let saveDebounce = null;

    function collectSettings() {
        try {
            return {
                hideMenuBtn: document.getElementById('hide-menu-btn')?.checked || false,
                imageScale: document.getElementById('image-scale-slider')?.value || '1',
                imageScaleValue: document.getElementById('image-scale-value')?.innerText || '1',
                pixelSize: document.getElementById('scale-slider')?.value || '768',
                pixelSizeValue: document.getElementById('scale-value')?.innerText || '768',
                padding: document.getElementById('padding-slider')?.value || '10',
                filenames: document.getElementById('filenames')?.checked || false,
                filenameBelow: document.getElementById('filename-below')?.checked || false,
                sidebarStatic: document.getElementById('sidebar-static')?.checked || false,
                pointFilter: document.getElementById('point-filter')?.checked || false,
                centerImages: document.getElementById('center-images')?.checked || false,
                autoplay: document.getElementById('autoplay')?.checked || false,
                filenameSize: document.getElementById('filename-size-slider')?.value || '24',
                filenameSizeValue: document.getElementById('filename-size-value')?.innerText || '24',
                maxCardWidth: document.getElementById('max-width-slider')?.value || '0',
                maxCardWidthValue: document.getElementById('max-width-value')?.innerText || 'none',
                maxCardHeight: document.getElementById('max-height-slider')?.value || '0',
                maxCardHeightValue: document.getElementById('max-height-value')?.innerText || 'none',
                backgroundHex: document.getElementById('background-hex')?.value || '#191919',
                sidebarRight: document.querySelector('.sidebar')?.classList.contains('right') || false,
                activeSizing: window.__activeSizing || { mode: 'scale', value: 1 }
            };
        } catch (e) { return {}; }
    }

    function applySettings(settings) {
        if (!settings) return;
        // Use try/catch liberally to avoid breaking UI init
        try {
            const hideMenu = document.getElementById('hide-menu-btn');
            if (hideMenu && typeof settings.hideMenuBtn !== 'undefined') {
                hideMenu.checked = !!settings.hideMenuBtn;
                toggleMenuButton(hideMenu);
            }
            if (typeof settings.sidebarRight !== 'undefined') {
                const sb = document.querySelector('.sidebar');
                if (sb) {
                    sb.classList.toggle('right', !!settings.sidebarRight);
                    sb.classList.toggle('left', !settings.sidebarRight);
                    document.body.classList.toggle('sidebar-right', !!settings.sidebarRight);
                    document.body.classList.toggle('sidebar-left', !settings.sidebarRight);
                }
            }
            if (settings.pixelSizeValue || settings.pixelSize) {
                const v = settings.pixelSizeValue || settings.pixelSize;
                const pixelSlider = document.getElementById('scale-slider');
                const pixelSpan = document.getElementById('scale-value');
                if (pixelSlider) pixelSlider.value = settings.pixelSize;
                if (pixelSpan) pixelSpan.innerText = v;
                changePixelSize(v);
            }
            if (settings.imageScaleValue || settings.imageScale) {
                const v = settings.imageScaleValue || settings.imageScale;
                const imageScaleSlider = document.getElementById('image-scale-slider');
                const imageScaleSpan = document.getElementById('image-scale-value');
                if (imageScaleSlider) imageScaleSlider.value = settings.imageScale;
                if (imageScaleSpan) imageScaleSpan.innerText = v;
                changeImageScale(v);
            }
            if (typeof settings.padding !== 'undefined') {
                const paddingSlider = document.getElementById('padding-slider');
                const paddingSpan = document.getElementById('padding-value');
                if (paddingSlider) paddingSlider.value = settings.padding;
                if (paddingSpan) paddingSpan.innerText = settings.padding;
                changePadding(settings.padding);
            }
            if (typeof settings.filenameSize !== 'undefined' || settings.filenameSizeValue) {
                const v = settings.filenameSizeValue || settings.filenameSize;
                const fsSlider = document.getElementById('filename-size-slider');
                const fsSpan = document.getElementById('filename-size-value');
                if (fsSlider) fsSlider.value = settings.filenameSize;
                if (fsSpan) fsSpan.innerText = v;
                changeFilenameSize(v);
            }
            if (typeof settings.maxCardWidth !== 'undefined' || settings.maxCardWidthValue) {
                const v = settings.maxCardWidthValue || settings.maxCardWidth;
                const mwSlider = document.getElementById('max-width-slider');
                const mwSpan = document.getElementById('max-width-value');
                if (mwSlider) mwSlider.value = settings.maxCardWidth || 0;
                if (mwSpan) mwSpan.innerText = v === '0' || v === 0 ? 'none' : v;
                changeMaxWidth(v);
            }
            if (typeof settings.maxCardHeight !== 'undefined' || settings.maxCardHeightValue) {
                const v = settings.maxCardHeightValue || settings.maxCardHeight;
                const mhSlider = document.getElementById('max-height-slider');
                const mhSpan = document.getElementById('max-height-value');
                if (mhSlider) mhSlider.value = settings.maxCardHeight || 0;
                if (mhSpan) mhSpan.innerText = v === '0' || v === 0 ? 'none' : v;
                changeMaxHeight(v);
            }
            if (typeof settings.filenames !== 'undefined') {
                const f = document.getElementById('filenames');
                if (f) { f.checked = !!settings.filenames; toggleFilenames(f); }
            }
            if (typeof settings.filenameBelow !== 'undefined') {
                const fb = document.getElementById('filename-below');
                if (fb) { fb.checked = !!settings.filenameBelow; document.body.classList.toggle('filenames-below', fb.checked); }
            }
            if (typeof settings.sidebarStatic !== 'undefined') {
                const ss = document.getElementById('sidebar-static');
                if (ss) { ss.checked = !!settings.sidebarStatic; toggleSidebarStatic(ss); }
            }
            if (typeof settings.pointFilter !== 'undefined') {
                const pf = document.getElementById('point-filter');
                if (pf) { pf.checked = !!settings.pointFilter; togglePointFilter(pf); }
            }
            if (typeof settings.centerImages !== 'undefined') {
                const ci = document.getElementById('center-images');
                if (ci) { ci.checked = !!settings.centerImages; toggleCenterImages(ci); }
            }
            if (typeof settings.autoplay !== 'undefined') {
                const ap = document.getElementById('autoplay');
                if (ap) { ap.checked = !!settings.autoplay; toggleAutoplay(ap); }
            }
            if (settings.backgroundHex) {
                const hex = document.getElementById('background-hex');
                if (hex) { hex.value = settings.backgroundHex; changeBackground(settings.backgroundHex); }
            }
            if (settings.activeSizing) {
                window.__activeSizing = settings.activeSizing;
                setActiveControl(window.__activeSizing.mode);
            }
        } catch (e) { console.warn('applySettings failed', e); }
    }

    async function saveSettingsIfEnabled() {
        if (!saveToggle || !saveToggle.checked) return;
        const settings = collectSettings();
        try {
            await window.__ivDB.set(SAVE_KEY, settings);
            // store the preference locally so we recall that saving was enabled
            localStorage.setItem('saveSettingsEnabled', 'true');
        } catch (e) { console.warn('Failed saving settings', e); }
    }

    async function clearSavedSettings() {
        try {
            await window.__ivDB.delete(SAVE_KEY);
        } catch (e) { /* ignore */ }
        localStorage.removeItem('saveSettingsEnabled');
    }

    async function loadSavedSettings() {
        try {
            const settings = await window.__ivDB.get(SAVE_KEY);
            return settings;
        } catch (e) { return undefined; }
    }

    // Wire change listeners for controls so changes auto-save when enabled
    function wireAutoSave() {
    const ids = ['hide-menu-btn','image-scale-slider','image-scale-value','scale-slider','scale-value','padding-slider','padding-value','filename-size-slider','filename-size-value','max-width-slider','max-width-value','max-height-slider','max-height-value','filenames','filename-below','sidebar-static','point-filter','center-images','autoplay','background-hex','switch-sides'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const ev = (el.tagName === 'INPUT' && el.type === 'range') || el.tagName === 'SELECT' ? 'input' : 'change';
            el.addEventListener(ev, () => {
                if (saveDebounce) clearTimeout(saveDebounce);
                saveDebounce = setTimeout(() => { saveSettingsIfEnabled(); }, 250);
            });
        });
        // special-case contenteditable spans
        const spans = document.querySelectorAll('span.number');
        spans.forEach(s => s.addEventListener('blur', () => { if (saveDebounce) clearTimeout(saveDebounce); saveDebounce = setTimeout(() => saveSettingsIfEnabled(), 250); }));
        // When switching sides via the button, save
        const switchBtn = document.getElementById('switch-sides');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => { setTimeout(() => saveSettingsIfEnabled(), 150); });
        }
    }

    // Initialize toggle state from localStorage and load/apply settings if needed
    (async function initPersistence() {
        try {
            const preferred = localStorage.getItem('saveSettingsEnabled');
            if (saveToggle) {
                saveToggle.checked = preferred === 'true';
                saveToggle.addEventListener('change', async function() {
                    if (this.checked) {
                        localStorage.setItem('saveSettingsEnabled','true');
                        // load settings from DB and apply if present, then save current state
                        const s = await loadSavedSettings();
                        if (s) applySettings(s);
                        saveSettingsIfEnabled();
                    } else {
                        await clearSavedSettings();
                    }
                });
            }
            // Wire autosave listeners regardless; they check toggle before saving
            wireAutoSave();
            if (saveToggle && saveToggle.checked) {
                // Delay slightly to allow other DOMContentLoaded initializers to run
                setTimeout(async () => {
                    const s = await loadSavedSettings();
                    if (s) applySettings(s);
                }, 50);
            }
        } catch (e) { console.warn('initPersistence err', e); }
    })();
    // Ensure 'Sidebar occupies space' is OFF by default on load
    // NOTE: we intentionally do NOT force the 'sidebar-static' setting here so
    // the checkbox state can persist or be controlled by the UI. If it's
    // checked on load we respect it, but only apply the layout shift when the
    // sidebar is also open (see toggleSidebarStatic and toggleSettingsMenu).
});