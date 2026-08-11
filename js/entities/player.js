// js/entities/player.js
import { CONFIG } from '../config.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 16;
        this.height = 34;
        this.grounded = false;
        this.facing = 1;
        this.hp = 20;
        this.maxHp = 20;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.walkCycle = 0;
        this.equippedWeapon = 'rifle'; // Arma equipada por defecto
    }

    update(keys) {
        const speed = 2.4;
        if (keys['a'] || keys['ArrowLeft']) {
            this.vx = -speed;
            this.facing = -1;
            this.walkCycle += 0.2;
        } else if (keys['d'] || keys['ArrowRight']) {
            this.vx = speed;
            this.facing = 1;
            this.walkCycle += 0.2;
        } else {
            this.vx *= 0.5;
            this.walkCycle = 0;
        }

        if ((keys['w'] || keys[' '] || keys['ArrowUp']) && this.grounded) {
            this.vy = -7.5;
            this.grounded = false;
        }

        this.vy += CONFIG.GRAVITY;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;

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
        
        // 1. PIERNAS Y PANTALONES
        ctx.fillStyle = "#1c315e";
        const legOffset = Math.sin(this.walkCycle) * 3;
        ctx.fillRect(drawX + 3, drawY + 22, 4, 12 + legOffset);
        ctx.fillRect(drawX + 9, drawY + 22, 4, 12 - legOffset);

        // Zapato
        ctx.fillStyle = "#111";
        ctx.fillRect(drawX + (this.facing === 1 ? 4 : 2), drawY + 32, 5, 2);

        // 2. TORSO Y CAMISA HD
        ctx.fillStyle = "#a82e2e";
        ctx.fillRect(drawX + 2, drawY + 11, 12, 12);

        // 3. CABEZA Y ROSTRO REALISTA
        ctx.fillStyle = "#e8b88b";
        ctx.fillRect(drawX + 2, drawY + 1, 12, 10);

        ctx.fillStyle = "#4a2d18"; // Cabello
        ctx.fillRect(drawX + 1, drawY, 14, 4);

        const eyeX = drawX + (this.facing === 1 ? 9 : 3);
        if (!this.isBlinking) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(eyeX, drawY + 4, 3, 3);
            ctx.fillStyle = "#2b5c28"; // Iris
            ctx.fillRect(eyeX + (this.facing === 1 ? 1 : 0), drawY + 4, 2, 3);
        } else {
            ctx.fillStyle = "#aa7755";
            ctx.fillRect(eyeX, drawY + 5, 3, 1);
        }

        // 4. ARMA HD ULTRADETALLADA EN MANO
        if (this.equippedWeapon === 'rifle') {
            const gunX = drawX + (this.facing === 1 ? 10 : -12);
            const gunY = drawY + 14;

            // Cañón Metálico
            ctx.fillStyle = "#2b2b2b";
            ctx.fillRect(gunX, gunY, 14, 3);
            
            // Cuerpo / Receptor
            ctx.fillStyle = "#4f4f4f";
            ctx.fillRect(gunX + (this.facing === 1 ? 2 : 4), gunY - 2, 6, 5);

            // Empuñadura de Madera
            ctx.fillStyle = "#614126";
            ctx.fillRect(gunX + (this.facing === 1 ? 4 : 6), gunY + 3, 3, 4);

            // Mira Telescópica HD
            ctx.fillStyle = "#111";
            ctx.fillRect(gunX + 3, gunY - 4, 6, 2);
            ctx.fillStyle = "#00ffff"; // Brillo del lente
            ctx.fillRect(gunX + (this.facing === 1 ? 8 : 3), gunY - 4, 1, 2);
        }

        ctx.restore();
    }
}
