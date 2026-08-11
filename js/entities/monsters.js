// js/entities/monsters.js
import { CONFIG } from '../config.js';

export class Monster {
    constructor(x, y, type = 'zombie') {
        this.x = x;
        this.y = y;
        this.type = type; // 'zombie', 'spider', 'skeleton'
        this.vx = 0;
        this.vy = 0;
        
        this.width = type === 'spider' ? 24 : 16;
        this.height = type === 'spider' ? 14 : 34;
        
        this.grounded = false;
        this.facing = 1;
        this.hp = type === 'spider' ? 8 : 12;
        this.walkCycle = 0;
    }

    update(player, world) {
        const dx = player.x - this.x;
        const distance = Math.abs(dx);

        if (distance < 260) {
            this.facing = dx > 0 ? 1 : -1;
            this.vx = this.facing * (this.type === 'spider' ? 1.8 : 1.2);
            this.walkCycle += 0.2;

            const tileSize = CONFIG.TILE_SIZE;
            const frontX = Math.floor((this.x + (this.facing === 1 ? this.width + 2 : -2)) / tileSize);
            const feetY = Math.floor((this.y + this.height - 4) / tileSize);

            if (this.grounded && world.getBlock(frontX, feetY) !== 0) {
                this.vy = -6.5;
                this.grounded = false;
            }
        } else {
            this.vx *= 0.5;
        }

        this.vy += CONFIG.GRAVITY;
        if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
    }

    render(ctx, camera) {
        const drawX = Math.floor(this.x - camera.x);
        const drawY = Math.floor(this.y - camera.y);

        ctx.save();

        if (this.type === 'zombie') {
            // ZOMBIE HD
            ctx.fillStyle = "#3d5240";
            ctx.fillRect(drawX + 2, drawY + 11, 12, 12);
            ctx.fillStyle = "#4a7c59"; // Piel
            ctx.fillRect(drawX + 2, drawY + 1, 12, 10);
            ctx.fillStyle = "#ff1a1a"; // Ojos rojos
            ctx.fillRect(drawX + (this.facing === 1 ? 9 : 3), drawY + 4, 3, 2);
        } else if (this.type === 'spider') {
            // ARAÑA GIGANTE HD
            ctx.fillStyle = "#1a1110"; // Cuerpo
            ctx.fillRect(drawX + 4, drawY + 2, 16, 10);
            
            // Patas articuladas
            ctx.fillStyle = "#0d0808";
            const legMove = Math.sin(this.walkCycle) * 3;
            ctx.fillRect(drawX - 2, drawY + 6 + legMove, 8, 2);
            ctx.fillRect(drawX + 18, drawY + 6 - legMove, 8, 2);

            // Ojos Múltiples Rojos
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(drawX + (this.facing === 1 ? 16 : 2), drawY + 4, 2, 2);
            ctx.fillRect(drawX + (this.facing === 1 ? 14 : 4), drawY + 6, 2, 2);
        }

        ctx.restore();
    }
}
