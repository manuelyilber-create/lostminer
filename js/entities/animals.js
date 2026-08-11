// js/entities/animals.js
import { CONFIG } from '../config.js';

export class Animal {
    constructor(x, y, type = 'sheep') {
        this.x = x;
        this.y = y;
        this.type = type; // 'sheep' u 'other'
        this.vx = 0;
        this.vy = 0;
        
        // Dimensiones
        this.width = 20;
        this.height = 16;
        
        this.grounded = false;
        this.facing = Math.random() > 0.5 ? 1 : -1;
        
        // Estado de Inteligencia Artificial (IA)
        this.state = 'idle'; // 'idle', 'walking', 'eating'
        this.stateTimer = 0;
        this.walkCycle = 0;
        this.hp = 8;
    }

    update(world) {
        this.stateTimer++;

        // --- MÁQUINA DE ESTADOS IA ---
        if (this.stateTimer > 120 + Math.random() * 180) {
            this.stateTimer = 0;
            const rand = Math.random();
            if (rand < 0.4) {
                this.state = 'idle';
                this.vx = 0;
            } else if (rand < 0.8) {
                this.state = 'walking';
                this.facing = Math.random() > 0.5 ? 1 : -1;
            } else {
                this.state = 'eating';
                this.vx = 0;
            }
        }

        // Comportamiento según el estado
        if (this.state === 'walking') {
            this.vx = this.facing * 0.8;
            this.walkCycle += 0.15;
        } else {
            this.vx = 0;
            this.walkCycle = 0;
        }

        // Aplicar Gravedad
        this.vy += CONFIG.GRAVITY;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
    }

    render(ctx, camera) {
        const drawX = Math.floor(this.x - camera.x);
        const drawY = Math.floor(this.y - camera.y);

        ctx.save();

        if (this.type === 'sheep') {
            // --- OVEJA DETALLADA ---
            const legOffset = Math.sin(this.walkCycle) * 2;

            // Patas
            ctx.fillStyle = "#222222";
            ctx.fillRect(drawX + 3, drawY + 11, 3, 5 + legOffset);
            ctx.fillRect(drawX + 14, drawY + 11, 3, 5 - legOffset);

            // Cuerpo (Lana esponjosa con textura)
            ctx.fillStyle = "#f0f0f0";
            ctx.fillRect(drawX + 2, drawY + 2, 16, 10);
            
            // Relieve / Sombra de la lana
            ctx.fillStyle = "#d9d9d9";
            ctx.fillRect(drawX + 4, drawY + 8, 12, 3);
            ctx.fillRect(drawX + 1, drawY + 4, 2, 6);

            // Cabeza (Baja si está comiendo)
            const headY = this.state === 'eating' ? drawY + 6 : drawY + 1;
            const headX = drawX + (this.facing === 1 ? 14 : -3);

            // Piel de la cara
            ctx.fillStyle = "#e0c0a0";
            ctx.fillRect(headX, headY, 6, 6);

            // Ojo
            ctx.fillStyle = "#111111";
            ctx.fillRect(headX + (this.facing === 1 ? 4 : 1), headY + 2, 1, 2);

            // Oreja
            ctx.fillStyle = "#c8a080";
            ctx.fillRect(headX + (this.facing === 1 ? 1 : 4), headY + 1, 2, 1);
        }

        ctx.restore();
    }
}
