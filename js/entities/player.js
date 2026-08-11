// js/entities/player.js
import { CONFIG } from '../config.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        
        // Dimensiones HD
        this.width = 16;
        this.height = 34;
        
        // Estado Físico
        this.grounded = false;
        this.facing = 1; // 1: Derecha, -1: Izquierda
        
        // Atributos
        this.hp = 20;
        this.maxHp = 20;
        
        // Animaciones del Rostro
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.walkCycle = 0;
    }

    update(keys) {
        const speed = 2.4;

        // Movimiento Horizontal
        if (keys['a'] || keys['ArrowLeft']) {
            this.vx = -speed;
            this.facing = -1;
            this.walkCycle += 0.2;
        } else if (keys['d'] || keys['ArrowRight']) {
            this.vx = speed;
            this.facing = 1;
            this.walkCycle += 0.2;
        } else {
            this.vx *= 0.5; // Fricción suave
            this.walkCycle = 0;
        }

        // Salto
        if ((keys['w'] || keys[' '] || keys['ArrowUp']) && this.grounded) {
            this.vy = -7.5;
            this.grounded = false;
        }

        // Aplicar Gravedad
        this.vy += CONFIG.GRAVITY;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;

        // Lógica de Parpadeo del Rostro
        this.blinkTimer++;
        if (this.blinkTimer > 180) {
            this.isBlinking = true;
            if (this.blinkTimer > 192) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }
    }

    render(ctx, camera) {
        const drawX = Math.floor(this.x - camera.x);
        const drawY = Math.floor(this.y - camera.y);

        ctx.save();
        
        // --- 1. PIERNAS Y PANTALONES ---
        ctx.fillStyle = "#1c315e"; // Jeans HD
        const legOffset = Math.sin(this.walkCycle) * 3;
        ctx.fillRect(drawX + 3, drawY + 22, 4, 12 + legOffset);
        ctx.fillRect(drawX + 9, drawY + 22, 4, 12 - legOffset);

        // Zapato
        ctx.fillStyle = "#111";
        ctx.fillRect(drawX + (this.facing === 1 ? 4 : 2), drawY + 32, 5, 2);

        // --- 2. TORSO Y ROสั่ง (CAMISA HD) ---
        ctx.fillStyle = "#a82e2e"; // Camisa Roja Detallada
        ctx.fillRect(drawX + 2, drawY + 11, 12, 12);
        // Dobladillo
        ctx.fillStyle = "#7a1f1f";
        ctx.fillRect(drawX + 2, drawY + 21, 12, 2);

        // --- 3. CABEZA Y ROSTRO REALISTA ---
        // Piel base
        ctx.fillStyle = "#e8b88b";
        ctx.fillRect(drawX + 2, drawY + 1, 12, 10);

        // Cabello con relieve
        ctx.fillStyle = "#4a2d18";
        ctx.fillRect(drawX + 1, drawY, 14, 4); // Flequillo superior
        ctx.fillRect(drawX + (this.facing === 1 ? 1 : 11), drawY + 3, 4, 5); // Patilla

        // ROSTRO: Ojos y Detalles Visibles
        const eyeX = drawX + (this.facing === 1 ? 9 : 3);
        
        if (!this.isBlinking) {
            // Esclerótica (Blanco del ojo)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(eyeX, drawY + 4, 3, 3);
            
            // Iris/Pupila detallada
            ctx.fillStyle = "#2b5c28"; // Ojos Verdes
            ctx.fillRect(eyeX + (this.facing === 1 ? 1 : 0), drawY + 4, 2, 3);
            
            // Brillo en la pupila
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(eyeX + (this.facing === 1 ? 2 : 0), drawY + 4, 1, 1);
        } else {
            // Ojo Parpadeando (Párpado cerrado)
            ctx.fillStyle = "#aa7755";
            ctx.fillRect(eyeX, drawY + 5, 3, 1);
        }

        // BOCA Y EXPRESIÓN
        ctx.fillStyle = "#a35c4c";
        ctx.fillRect(drawX + (this.facing === 1 ? 8 : 4), drawY + 8, 2, 1);

        ctx.restore();
    }
}
