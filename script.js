const startBtn = document.getElementById('startBtn');
const buttonScreen = document.getElementById('buttonScreen');
const animationScreen = document.getElementById('animationScreen');
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
const message = document.getElementById('message');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Evento del botón
startBtn.addEventListener('click', () => {
    buttonScreen.classList.remove('active');
    setTimeout(() => {
        animationScreen.classList.add('active');
        startHeartAnimation();
    }, 500);
});

// Clase para las partículas que forman el corazón
class Particle {
    constructor(x, y, targetX, targetY, index) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.targetX = targetX;
        this.targetY = targetY;
        this.baseSize = Math.random() * 3 + 2;
        this.size = this.baseSize;
        this.speedX = 0;
        this.speedY = 0;
        this.arrived = false;
        this.opacity = 0;
        this.hue = Math.random() * 60 + 320; // Colores rosa/rojo/magenta
        this.pulseOffset = index * 0.1; // Offset para efecto de onda
    }

    update(time) {
        if (!this.arrived) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {
                this.speedX = dx * 0.08;
                this.speedY = dy * 0.08;
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity = Math.min(this.opacity + 0.03, 1);
            } else {
                this.arrived = true;
                this.opacity = 1;
            }
        } else {
            // Efecto de pulsación cuando está en posición
            const pulse = Math.sin(time * 0.003 + this.pulseOffset) * 0.5 + 0.5;
            this.size = this.baseSize + pulse * 1.5;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Gradiente radial brillante
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 80%, 1)`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brillante
        ctx.fillStyle = `hsla(${this.hue}, 100%, 95%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Función para generar puntos en forma de corazón
function getHeartPoints(centerX, centerY, scale) {
    const points = [];
    const numPoints = 400; // Más partículas para efecto más denso

    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        points.push({
            x: centerX + x * scale,
            y: centerY + y * scale
        });
    }

    return points;
}

// Animación del corazón
function startHeartAnimation() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 35;

    const heartPoints = getHeartPoints(centerX, centerY, scale);
    const particles = heartPoints.map((point, index) =>
        new Particle(0, 0, point.x, point.y, index)
    );

    let allArrivedTime = null;
    let startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;

        // Fondo negro con fade suave
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let allArrived = true;
        particles.forEach(particle => {
            particle.update(elapsed);
            particle.draw();
            if (!particle.arrived) allArrived = false;
        });

        // Mostrar mensaje cuando todas las partículas lleguen
        if (allArrived && !allArrivedTime) {
            allArrivedTime = currentTime;
        }

        if (allArrivedTime && currentTime - allArrivedTime > 500 && !message.classList.contains('visible')) {
            message.classList.remove('hidden');
            message.classList.add('visible');
        }

        requestAnimationFrame(animate);
    }

    animate();
}