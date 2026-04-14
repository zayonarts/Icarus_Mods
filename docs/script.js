const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width, height, particles;

// Extract the accent color from CSS to use in JS
const rootStyles = getComputedStyle(document.documentElement);
// We pull the raw RGB values out of the rgba string to control opacity dynamically
const accentColorMatch = rootStyles.getPropertyValue('--accent-color').match(/\d+, \d+, \d+/);
const rgbAccent = accentColorMatch ? accentColorMatch[0] : '182, 255, 0';

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];

    // Generate 100 floating dots
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.5, // Drifting speed X
            vy: (Math.random() - 0.5) * 0.5, // Drifting speed Y
            opacity: Math.random() * 0.5 + 0.1
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Screen wrapping
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw the glowing dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgbAccent}, ${p.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${rgbAccent}, 1)`;
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', init);
init();
animate();

async function updateStats(shouldAnimate = false) {
    try {
        const response = await fetch('assets/counts.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        let totalMods = 0;
        let totalEntries = 0;
        let totalRecipes = 0;

        // Clean aggregation loop
        Object.values(data).forEach(module => {
            totalMods += module.ModCount || 0;
            totalEntries += module.EntriesModified || 0;
            totalRecipes += module.RecipesModified || 0;
        });

        if (shouldAnimate) {
            // High-speed initialization (0.75s)
            animateValue('count-mods', 0, totalMods, 750);
            animateValue('count-entries', 0, totalEntries, 750);
            animateValue('count-recipes', 0, totalRecipes, 750);
        } else {
            const format = (num) => num.toLocaleString('en-US');
            document.getElementById('count-mods').textContent = format(totalMods);
            document.getElementById('count-entries').textContent = format(totalEntries);
            document.getElementById('count-recipes').textContent = format(totalRecipes);
        }

    } catch (error) {
        console.error('HUD Update Error:', error);
    }
}

// --- Coordinate Tracking System ---
function initCoordinateTracker() {
    const latEl = document.getElementById('hud-lat');
    const lngEl = document.getElementById('hud-lng');
    if (!latEl || !lngEl) return;

    let targetLat = 0, targetLng = 0;
    let currentLat = 0, currentLng = 0;

    window.addEventListener('mousemove', (e) => {
        // Map Page Origin (Top-Left) to 0,0
        // No negative values, calculation based on full page length
        const totalHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const totalWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);

        targetLng = (e.pageX / totalWidth) * 360;
        targetLat = (e.pageY / totalHeight) * 180;
    });

    function animateCoordinates() {
        // Smooth Lerp toward target
        currentLat += (targetLat - currentLat) * 0.1;
        currentLng += (targetLng - currentLng) * 0.1;

        // Add extreme precision jitter (±0.0002)
        const jitterLat = (Math.random() - 0.5) * 0.0004;
        const jitterLng = (Math.random() - 0.5) * 0.0004;

        latEl.textContent = (currentLat + jitterLat).toFixed(4);
        lngEl.textContent = (currentLng + jitterLng).toFixed(4);

        requestAnimationFrame(animateCoordinates);
    }

    animateCoordinates();
}

// --- Boot Sequence: Optic Convergence (Smooth Reveal) ---
function smoothReveal(elementId, fullText) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML = ''; // Clear for reveal

    [...fullText].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces
        span.classList.add('char');
        // Staggered delay: 50ms per character
        span.style.animationDelay = `${i * 0.05}s`;
        el.appendChild(span);
    });
}

// --- Boot Sequence: Number Ticker ---
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.textContent = value.toLocaleString('en-US');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Optic Convergence Reveal
    smoothReveal("main-title", "Zayon's Icarus Mods");

    // 2. High-Speed Fetch & Animate Stats
    updateStats(true); // Param true to trigger animation

    // 3. Start HUD Tracking
    initCoordinateTracker();

    // 4. Initialize Mod Browser
    initModBrowser();

    // 5. Global Navigation & Telemetry: Back to Top + Progress Bar
    const backToTopMain = document.getElementById('back-to-top-main');
    const mainProgressBar = document.getElementById('main-progress-bar');
    
    window.addEventListener('scroll', () => {
        // Scroll Progress Telemetry
        if (mainProgressBar) {
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollTotal > 0) {
                const scrollPercent = Math.min(100, (window.scrollY / scrollTotal) * 100);
                mainProgressBar.style.width = scrollPercent > 99 ? '100.5%' : `${scrollPercent}%`;
            }
        }

        // Tactical Ascension Visibility
        if (backToTopMain) {
            if (window.scrollY > 20) {
                backToTopMain.classList.add('visible');
            } else {
                backToTopMain.classList.remove('visible');
            }
        }
    });
    
    if (backToTopMain) {
        backToTopMain.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Refresh stats every minute to stay sync
    setInterval(() => updateStats(false), 60000);
});

// --- Dynamic Mod Browser System ---

let categoriesData = {}; // Global store for category metadata

// Helper to convert HEX to RGB for CSS variables
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        '66, 245, 102'; // Fallback green
}

async function initModBrowser() {
    const container = document.getElementById('mod-browser');
    if (!container) return;

    try {
        // Step 1: Fetch Manifests
        // Auto-detect environment to bypass GitHub Pages directory restrictions
        const isGithubPages = window.location.hostname.includes('github.io');
        const modinfoUrl = isGithubPages 
            ? 'https://raw.githubusercontent.com/zayonarts/Icarus_Mods/main/modinfo.json'
            : '../modinfo.json';

        const [catRes, modinfoRes] = await Promise.all([
            fetch('assets/categories.json'),
            fetch(modinfoUrl)
        ]);

        if (!catRes.ok || !modinfoRes.ok) throw new Error("Index Fetch Failure");

        const catJson = await catRes.json();
        categoriesData = catJson.Categories || catJson; // Handle both nested and direct structures

        const modinfoJson = await modinfoRes.json();
        const mods = modinfoJson.mods || modinfoJson;

        // Step 2: Categorize Mods
        const groupedMods = {};
        Object.keys(categoriesData).forEach(key => groupedMods[key] = []);

        mods.forEach(mod => {
            // Determine category by checking readmeURL path
            for (const [key, cat] of Object.entries(categoriesData)) {
                if (mod.readmeURL && mod.readmeURL.includes(`/${cat.Folder}/`)) {
                    groupedMods[key].push(mod);
                    break;
                }
            }
        });

        // Step 3: Render Browser
        container.innerHTML = ''; // Clear loader

        for (const [key, category] of Object.entries(categoriesData)) {
            const modsInCat = groupedMods[key] || [];
            if (modsInCat.length === 0) continue;

            const section = document.createElement('section');
            section.className = 'mod-category';
            section.setAttribute('data-category', key);

            // --- DATA-DRIVEN THEMING: Match Title Case from JSON ---
            if (category.Color) {
                section.style.setProperty('--cat-color', category.Color);
                section.style.setProperty('--cat-color-rgb', hexToRgb(category.Color));
            }

            section.innerHTML = `
                <div class="category-header">
                    <i class="fas ${category.Icon} category-icon"></i>
                    <h2 class="category-title">${category.Name}</h2>
                    <span class="category-desc">${category.Description}</span>
                </div>
                <div class="mod-grid" id="grid-${key}"></div>
            `;

            container.appendChild(section);
            const grid = section.querySelector('.mod-grid');

            // Render Mod Cards
            modsInCat.forEach(mod => {
                grid.innerHTML += createModCard(mod, key);
            });
        }

    } catch (error) {
        console.error("Mod Browser Error:", error);
        container.innerHTML = `<div class="loader-text" style="color: #ff4444">CRITICAL ERROR: DATA LINK INTERRUPTED</div>`;
    }
}

function getFolderURL(readmeURL) {
    if (!readmeURL) return "#";
    // Convert GitHub file blob URL to tree folder URL
    return readmeURL
        .replace('/blob/', '/tree/')
        .replace('/README.md', '/');
}

function createModCard(mod, categoryKey) {
    // Restore the high-fidelity immersive HUD ID logic
    const id = (Math.random() * 10000).toFixed(0).padStart(4, '0');

    return `
        <div class="mod-module">
            <div class="mod-card-header">
                <span class="mod-id">ID: ${id}</span>
                <div class="mod-status-pulse"></div>
            </div>
            <h3 class="mod-name">${mod.name}</h3>
            <p class="mod-description">${mod.description.substring(0, 100)}${mod.description.length > 100 ? '...' : ''}</p>
            <div class="mod-meta">
                <span class="mod-version">V ${mod.version || '1.0.0'}</span>
                <button class="mod-link" onclick="openModDetails('${mod.readmeURL}', '${mod.name.replace(/'/g, "\\'")}', '${categoryKey}')">
                    ENGAGE MODULE
                </button>
            </div>
        </div>
    `;
}

// --- Engagement Modal Logic ---

async function openModDetails(url, name, categoryKey) {
    const dialog = document.getElementById('mod-details-dialog');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    const closeBtn = document.getElementById('close-modal');
    const downloadBtn = document.getElementById('download-source');

    if (!dialog || !content) return;

    // Apply Dynamic Category Theming to Dialog
    const catMetadata = categoriesData[categoryKey];
    if (catMetadata && catMetadata.Color) {
        dialog.setAttribute('data-category', categoryKey);
        dialog.style.setProperty('--accent-color', catMetadata.Color);
        dialog.style.setProperty('--accent-rgb', hexToRgb(catMetadata.Color));
    }

    // Map Download Link
    if (downloadBtn) {
        downloadBtn.href = getFolderURL(url);
    }

    // Reset and Load
    title.textContent = "SYNCHRONIZING...";
    content.innerHTML = '<div class="loader-text">ESTABLISHING QUANTUM LINK...</div>';

    // Reset Progress Bar
    const progressBar = document.getElementById('scroll-progress-bar');
    if (progressBar) progressBar.style.width = '0%';

    dialog.showModal();

    // Lock Body Scroll
    document.body.style.overflow = 'hidden';

    // Scroll Logic for Modal
    const jumpBtn = document.getElementById('jump-to-top-popup');
    const dialogInner = dialog.querySelector('.dialog-inner');
    if (dialogInner && progressBar) {
        dialogInner.onscroll = () => {
            const scrollTotal = dialogInner.scrollHeight - dialogInner.clientHeight;
            if (scrollTotal > 0) {
                const scrollPercent = Math.min(100, (dialogInner.scrollTop / scrollTotal) * 100);
                progressBar.style.width = scrollPercent > 99 ? '100.5%' : `${scrollPercent}%`;

                // Toggle TOP button visibility in popup
                if (jumpBtn) {
                    if (dialogInner.scrollTop > 20) {
                        jumpBtn.classList.add('visible');
                    } else {
                        jumpBtn.classList.remove('visible');
                    }
                }
            } else {
                progressBar.style.width = '100.5%'; 
                if (jumpBtn) jumpBtn.classList.remove('visible');
            }
        };

        if (jumpBtn) {
            jumpBtn.onclick = () => dialogInner.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Close logic: Button or Click Outside
    const dismiss = () => {
        dialog.close();
        document.body.style.overflow = ''; // Restore Scroll
    };
    closeBtn.onclick = dismiss;
    dialog.onclick = (e) => { if (e.target === dialog) dismiss(); };

    // Transform GitHub URLs to direct RAW if needed
    let fetchUrl = url;
    if (url.includes('github.com') && url.includes('/raw/')) {
        fetchUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
    }

    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            const relativePath = '../' + url.split('main/')[1];
            const localRes = await fetch(relativePath);
            if (!localRes.ok) throw new Error("Data Link Failure");
            const localText = await localRes.text();
            renderContent(name, localText);
        } else {
            const rawText = await response.text();
            renderContent(name, rawText);
        }
    } catch (error) {
        console.error("Link Corruption Diagnostic:", error);
        content.innerHTML = '<div class="loader-text" style="color: #ff4444">LINK CORRUPTED: MODULE DATA INACCESSIBLE<br><small style="font-size: 0.5rem; opacity: 0.5;">CHECK CONSOLE FOR ERROR CODE</small></div>';
    }

    function renderContent(modName, rawText) {
        title.textContent = modName.toUpperCase();

        // --- Title De-duplication Logic ---
        // Strip the first H1 if it exists (to avoid repeating the name)
        const cleanText = rawText.replace(/^#\s+.*$/m, '').trim();

        content.innerHTML = parseMarkdownToHUD(cleanText);
    }
}

function parseMarkdownToHUD(text) {
    // 1. Pre-process Inline Formatting (so it works inside tables too)
    let processedText = text
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1">') // Images
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>') // Links
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/gim, '<em>$1</em>') // Italics
        .replace(/`(.*?)`/gim, '<code>$1</code>'); // Code

    // 2. Tactical Tables (Stateful Parser)
    const lines = processedText.split('\n');
    let inTable = false;
    let tableHtml = '';
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
            if (!inTable) {
                inTable = true;
                tableHtml = '<div style="overflow-x:auto"><table>';
            }
            if (line.includes('---')) continue;

            const cells = line.split('|').filter((c, idx, arr) => {
                // Keep cells that aren't empty, unless they are between pipes
                return c.trim() !== '' || (idx > 0 && idx < arr.length - 1);
            });

            const tag = tableHtml.includes('<tr>') ? 'td' : 'th'; // First row as header
            tableHtml += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
        } else {
            if (inTable) {
                tableHtml += '</table></div>';
                processedLines.push(tableHtml);
                inTable = false;
            }
            processedLines.push(lines[i]);
        }
    }
    if (inTable) processedLines.push(tableHtml + '</table></div>');
    let html = processedLines.join('\n');

    // 3. Regex Transforms for HUD Blocks
    return html
        .replace(/^# (.*$)/gim, '<h1>$1</h1>') // H1
        .replace(/^## (.*$)/gim, '<h2>$1</h2>') // H2
        .replace(/^### (.*$)/gim, '<h3>$1</h3>') // H3
        .replace(/---/gim, '<hr>') // Horizontal Rule
        .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>') // Lists
        .replace(/<\/ul>\n<ul>/gim, '') // Merge adjacent lists
        .split('\n')
        .map(line => {
            const l = line.trim();
            if (!l) return '';
            // If it's a block element, don't wrap in <p>
            if (l.startsWith('<h') || l.startsWith('<ul') || l.startsWith('<li') || l.startsWith('<table') || l.startsWith('<hr') || l.startsWith('<div') || l.startsWith('<img')) return l;
            return `<p>${l}</p>`;
        })
        .join('')
        // Merge consecutive images into a single container if needed
        .replace(/(<img[^>]*>)\s*(<img[^>]*>)/gim, '$1 $2')
        .replace(/<p><h1>/gim, '<h1>').replace(/<\/h1><\/p>/gim, '</h1>')
        .replace(/<p><h2>/gim, '<h2>').replace(/<\/h2><\/p>/gim, '</h2>')
        .replace(/<p><h3>/gim, '<h3>').replace(/<\/h3><\/p>/gim, '</h3>')
        .replace(/<p><ul>/gim, '<ul>').replace(/<\/ul><\/p>/gim, '</ul>')
        .replace(/<p><div>/gim, '<div>').replace(/<\/div><\/p>/gim, '</div>')
        .replace(/<p><hr>/gim, '<hr>').replace(/<\/hr><\/p>/gim, '<hr>');
}

async function fetchReadmeContent(url, modName) {
    try {
        // Note: Simple description extraction from Markdown
        // We pull the first paragraph that isn't a header
        const res = await fetch(url);
        if (!res.ok) return null;
        const text = await res.text();

        const paragraphs = text.split('\n\n')
            .map(p => p.trim())
            .filter(p => p && !p.startsWith('#') && !p.startsWith('!'));

        return paragraphs[0] || null;
    } catch {
        return null;
    }
}
