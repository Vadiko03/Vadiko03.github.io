// main.js — Canvas 2D puro, zero dipendenze

const cv = document.getElementById('bg');
const cx = cv.getContext('2d');
let W, H;

function resize() {
    W = cv.width  = window.innerWidth  * Math.min(devicePixelRatio, 2);
    H = cv.height = window.innerHeight * Math.min(devicePixelRatio, 2);
    cv.style.width  = window.innerWidth  + 'px';
    cv.style.height = window.innerHeight + 'px';
}
resize();
window.addEventListener('resize', resize);

// Mouse
const mx = { x: -999, y: -999 };
window.addEventListener('mousemove', e => {
    mx.x = e.clientX * Math.min(devicePixelRatio, 2);
    mx.y = e.clientY * Math.min(devicePixelRatio, 2);
});
window.addEventListener('mouseleave', () => { mx.x = -999; });

// Stelle fisse
const STARS = Array.from({ length: 200 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.1 + 0.2,
    a: Math.random() * 0.4 + 0.1,
}));

// Nodi rete
const N    = 55;
const CONN = 120 * Math.min(devicePixelRatio, 2);
const PULL = 140 * Math.min(devicePixelRatio, 2);

const nodes = Array.from({ length: N }, () => ({
    x:  Math.random() * window.innerWidth  * Math.min(devicePixelRatio, 2),
    y:  Math.random() * window.innerHeight * Math.min(devicePixelRatio, 2),
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
}));

function frame() {
    cx.clearRect(0, 0, W, H);

    // Stelle
    STARS.forEach(s => {
        cx.beginPath();
        cx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(255,255,255,${s.a})`;
        cx.fill();
    });

    // Aggiorna nodi + attrazione mouse
    nodes.forEach(n => {
        const dx = mx.x - n.x, dy = mx.y - n.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < PULL && d > 1) {
            const f = (1 - d / PULL) * 0.015;
            n.vx += dx / d * f;
            n.vy += dy / d * f;
        }
        n.vx *= 0.97;
        n.vy *= 0.97;
        n.x  += n.vx;
        n.y  += n.vy;
        if (n.x < 0)  { n.x = 0;  n.vx *= -1; }
        if (n.x > W)  { n.x = W;  n.vx *= -1; }
        if (n.y < 0)  { n.y = 0;  n.vy *= -1; }
        if (n.y > H)  { n.y = H;  n.vy *= -1; }
    });

    // Linee di connessione
    for (let a = 0; a < N; a++) {
        for (let b = a + 1; b < N; b++) {
            const dx = nodes[a].x - nodes[b].x;
            const dy = nodes[a].y - nodes[b].y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < CONN) {
                cx.beginPath();
                cx.moveTo(nodes[a].x, nodes[a].y);
                cx.lineTo(nodes[b].x, nodes[b].y);
                cx.strokeStyle = `rgba(124,106,255,${(1 - d / CONN) * 0.22})`;
                cx.lineWidth   = 1;
                cx.stroke();
            }
        }
    }

    // Glow + dot cursore
    if (mx.x > 0) {
        const g = cx.createRadialGradient(mx.x, mx.y, 0, mx.x, mx.y, PULL);
        g.addColorStop(0, 'rgba(124,106,255,0.09)');
        g.addColorStop(1, 'rgba(124,106,255,0)');
        cx.beginPath();
        cx.arc(mx.x, mx.y, PULL, 0, Math.PI * 2);
        cx.fillStyle = g;
        cx.fill();

        cx.beginPath();
        cx.arc(mx.x, mx.y, 3, 0, Math.PI * 2);
        cx.fillStyle = 'rgba(124,106,255,0.9)';
        cx.fill();
    }

    // Punti nodi
    nodes.forEach(n => {
        cx.beginPath();
        cx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        cx.fillStyle = 'rgba(255,255,255,0.65)';
        cx.fill();
    });

    requestAnimationFrame(frame);
}

frame();

// Scroll reveal
const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); }),
    { threshold: 0.12 }
);
document.querySelectorAll('.hidden').forEach(el => obs.observe(el));
