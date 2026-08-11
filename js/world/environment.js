// js/world/environment.js
import { CONFIG } from '../config.js';
import { BLOCKS } from './blockData.js';

export class Environment {
    constructor() {
        this.clouds = [];
        this.birds = [];
        this.fish = [];

        // Generar Nubes
        for (let i = 0; i < 10; i++) {
            this.clouds.push({
                x: Math.random() * CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE,
                y: 20 + Math.random() * 80,
                speed: 0.2 + Math.random() * 0.3,
                size: 40 + Math.random() * 30
            });
        }

        // Generar Aves Volando
        for (let i = 0; i < 5; i++) {
            this.birds.push({
                x: Math.random() * CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE,
                y: 40 + Math.random() * 100,
                vx: 1 + Math.random() * 1.5,
                wingCycle: 0
            });
        }

        // Generar Peces
        for (let i = 0; i < 8; i++) {
            this.fish.push({
                x: Math.random() * CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE,
                y: (CONFIG.SEA_LEVEL + 3) * CONFIG.TILE_SIZE,
                vx: (Math.random() - 0.5) * 0.8,
                color: Math.random() > 0.5 ? "#ff4500" : "#ffd700"
            });
        }
    }

    update(world) {
        // Mover Nubes
        this.clouds.forEach(c => {
            c.x += c.speed;
            if (c.x > CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) c.x = -100;
        });

        // Mover Aves
        this.birds.forEach(b => {
            b.x += b.vx;
            b.wingCycle += 0.2;
            if (b.x > CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) b.x = -50;
        });

        // Mover Peces en el agua
        this.fish.forEach(f => {
            f.x += f.vx;
            const tileX = Math.floor(f.x / CONFIG.TILE_SIZE);
            const tileY = Math.floor(f.y / CONFIG.TILE_SIZE);

            // Si sale del agua, cambia de sentido
            if (world.getBlock(tileX, tileY) !== BLOCKS.WATER) {
                f.vx *= -1;
            }
        });
    }

    render(ctx, camera) {
        ctx.save();

        // ☁️ Renderizar Nubes
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        this.clouds.forEach(c => {
            const drawX = c.x - camera.x;
            ctx.beginPath();
            ctx.arc(drawX, c.y, c.size / 2, 0, Math.PI * 2);
            ctx.arc(drawX + 20, c.y - 10, c.size / 2.2, 0, Math.PI * 2);
            ctx.arc(drawX + 40, c.y, c.size / 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // 🦅 Renderizar Aves HD
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        this.birds.forEach(b => {
            const drawX = b.x - camera.x;
            const wingY = Math.sin(b.wingCycle) * 5;
            ctx.beginPath();
            ctx.moveTo(drawX - 8, b.y + wingY);
            ctx.lineTo(drawX, b.y);
            ctx.lineTo(drawX + 8, b.y + wingY);
            ctx.stroke();
        });

        // 🐟 Renderizar Peces HD
        this.fish.forEach(f => {
            const drawX = f.x - camera.x;
            const drawY = f.y - camera.y;

            ctx.fillStyle = f.color;
            ctx.fillRect(drawX, drawY, 8, 4);
            // Cola
            ctx.fillRect(f.vx > 0 ? drawX - 3 : drawX + 8, drawY - 1, 3, 6);
            // Ojo
            ctx.fillStyle = "#fff";
            ctx.fillRect(f.vx > 0 ? drawX + 6 : drawX + 1, drawY + 1, 1, 1);
        });

        ctx.restore();
    }
}
