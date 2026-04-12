const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width, height, particles;

// Extract the accent color from CSS to use in JS
const rootStyles = getComputedStyle(document.documentElement);
// We pull the raw RGB values out of the rgba string to control opacity dynamically
const accentColorMatch = rootStyles.getPropertyValue('--accent-color').match(/\d+, \d+, \d+/);
const rgbAccent = accentColorMatch ? accentColorMatch[0] : '6, 182, 212';

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

        // Screen wrapping (if they float off screen, they appear on the other side)
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
