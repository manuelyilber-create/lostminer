// js/engine/particles.js
import { CONFIG } from '../config.js';

export class Particle {
    constructor(x, y, color, size = 3) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * size + 1;
        
        // Velocidad aleatoria en varias direcciones
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2; // Ligero impulso hacia arriba
        
        this.gravity = 0.25;
        this.life = 1.0; // Transparencia (1.0 a 0.0)
        this.decay = Math.random() * 0.03 + 0.02; // Velocidad de desaparición
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
    }

    render(ctx, camera) {
        if (this.life <= 0) return;

        const drawX = Math.floor(this.x - camera.x);
        const drawY = Math.floor(this.y - camera.y);

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, drawY, this.size, this.size);
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // Método para hacer explotar partículas al romper bloques o golpear
    spawnBlockParticles(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx, camera) {
        this.particles.forEach(p => p.render(ctx, camera));
    }
}
