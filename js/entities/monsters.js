// js/entities/monsters.js
import { CONFIG } from '../config.js';

export class Monster {
    constructor(x, y, type = 'zombie') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        
        // Dimensiones HD
        this.width = 16;
        this.height = 34;
        
        this.grounded = false;
        this.facing = 1;
        
        this.hp = 12;
        this.maxHp = 12;
        this.walkCycle = 0;
        this.attackCooldown = 0;
    }

    update(player, world) {
        // --- INTELIGENCIA ARTIFICIAL DE PERSECUCIÓN ---
        const dx = player.x - this.x;
        const distance = Math.abs(dx);

        // Si el jugador está en su rango de visión (250px)
        if (distance < 250) {
            this.facing = dx > 0 ? 1 : -1;
            this.vx = this.facing * 1.2; // Velocidad de persecución
            this.walkCycle += 0.18;

            // Detección de salto: si hay un bloque frente a él, salta
            const tileSize = CONFIG.TILE_SIZE;
            const frontTileX = Math.floor((this.x + (this.facing === 1 ? this.width + 2 : -2)) / tileSize);
            const feetTileY = Math.floor((this.y + this.height - 4) / tileSize);

            // Si el bloque de enfrente es sólido y el zombie está en el suelo -> Salta
            if (this.grounded && world.getBlock(frontTileX, feetTileY) !== 0) {
                this.vy = -6.5;
                this.grounded = false;
            }
        } else {
            // Si está lejos, camina despacio
            this.vx *= 0.5;
            this.walkCycle = 0;
        }

        // Aplicar Gravedad
        this.vy += CONFIG.GRAVITY;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;

        if (this.attackCooldown > 0) this.attackCooldown--;
    }

    render(ctx, camera) {
        const drawX = Math.floor(this.x - camera.x);
        const drawY = Math.floor(this.y - camera.y);

        ctx.save();

        const legOffset = Math.sin(this.walkCycle) * 3;

        // --- 1. PIERNAS Y PANTALÓN ROTAS ---
        ctx.fillStyle = "#2a3b2a"; // Pantalón desgastado
        ctx.fillRect(drawX + 3, drawY + 22, 4, 12 + legOffset);
        ctx.fillRect(drawX + 9, drawY + 22, 4, 12 - legOffset);

        // --- 2. TORSO Y BRAZOS DE ZOMBIE ---
        ctx.fillStyle = "#3d5240"; // Ropa harapienta
        ctx.fillRect(drawX + 2, drawY + 11, 12, 12);

        // Brazos estirados al frente (característico de zombie)
        ctx.fillStyle = "#4a7c59"; // Piel verde
        const armX = drawX + (this.facing === 1 ? 10 : -6);
        ctx.fillRect(armX, drawY + 13, 10, 4);

        // --- 3. CABEZA Y ROSTRO DE MONSTRUO ---
        // Piel verdosa
        ctx.fillStyle = "#4a7c59";
        ctx.fillRect(drawX + 2, drawY + 1, 12, 10);

        // Pelo ralo / cicatriz
        ctx.fillStyle = "#1e3323";
        ctx.fillRect(drawX + 3, drawY, 10, 3);

        // Ojos Rojos Brillantes
        const eyeX = drawX + (this.facing === 1 ? 9 : 3);
        ctx.fillStyle = "#ff1a1a";
        ctx.fillRect(eyeX, drawY + 4, 3, 2);
        ctx.fillStyle = "#ffff00"; // Pupila amarilla
        ctx.fillRect(eyeX + (this.facing === 1 ? 1 : 0), drawY + 4, 1, 1);

        // Boca / Dientes
        ctx.fillStyle = "#1a0d0d";
        ctx.fillRect(drawX + (this.facing === 1 ? 8 : 4), drawY + 8, 3, 2);

        ctx.restore();
    }
}
