// js/engine/renderer.js
import { CONFIG } from '../config.js';
import { BLOCKS, BLOCK_PROPERTIES } from '../world/blockData.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.tileSize = CONFIG.TILE_SIZE;
    }

    render(world, player, timeOfDay) {
        const ctx = this.ctx;
        
        // --- 1. FONDO CIELO DINÁMICO ---
        let skyBrightness = Math.sin(timeOfDay * Math.PI);
        let r = Math.floor(115 * Math.max(0.1, skyBrightness));
        let g = Math.floor(175 * Math.max(0.1, skyBrightness));
        let b = Math.floor(230 * Math.max(0.15, skyBrightness));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ajustar Cámara centrada en el jugador
        let cameraX = player.x - this.canvas.width / 2;
        let cameraY = player.y - this.canvas.height / 2;

        ctx.save();
        ctx.translate(-Math.floor(cameraX), -Math.floor(cameraY));

        // --- 2. RENDERIZADO DE BLOQUES HD ---
        let startX = Math.max(0, Math.floor(cameraX / this.tileSize));
        let endX = Math.min(world.width, Math.ceil((cameraX + this.canvas.width) / this.tileSize));
        let startY = Math.max(0, Math.floor(cameraY / this.tileSize));
        let endY = Math.min(world.height, Math.ceil((cameraY + this.canvas.height) / this.tileSize));

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                let blockId = world.getBlock(x, y);
                if (blockId !== BLOCKS.AIR) {
                    this.drawDetailedBlock(ctx, x * this.tileSize, y * this.tileSize, blockId);
                }
            }
        }

        // --- 3. JUGADOR DETALLADO ---
        player.render(ctx, { x: 0, y: 0 });

        ctx.restore();

        // --- 4. ILUMINACIÓN Y OSCURIDAD NOCTURNA ---
        if (skyBrightness < 0.4) {
            let nightAlpha = (0.4 - skyBrightness) * 1.8;
            ctx.fillStyle = `rgba(5, 5, 20, ${Math.min(0.85, nightAlpha)})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawDetailedBlock(ctx, x, y, id) {
        const props = BLOCK_PROPERTIES[id];
        const size = this.tileSize;

        // Color Base
        ctx.fillStyle = props.color;
        ctx.fillRect(x, y, size, size);

        // Detalles HD según el bloque
        if (id === BLOCKS.GRASS) {
            ctx.fillStyle = props.topColor;
            ctx.fillRect(x, y, size, 6); // Capa superior de hierba
            ctx.fillStyle = "#35611b";
            ctx.fillRect(x + 2, y + 6, 3, 4); // Flecos de pasto
            ctx.fillRect(x + 12, y + 6, 4, 3);
        } else if (props.spotColor) {
            // Minerales con vetas brillantes
            ctx.fillStyle = props.spotColor;
            ctx.fillRect(x + 4, y + 4, 5, 5);
            ctx.fillRect(x + 14, y + 8, 4, 6);
            ctx.fillRect(x + 8, y + 15, 6, 4);
        } else if (id === BLOCKS.WOOD) {
            // Beta de madera
            ctx.fillStyle = props.barkColor;
            ctx.fillRect(x + 2, y, 3, size);
            ctx.fillRect(x + 12, y, 4, size);
        }

        // Borde / Sombra de relieve en cada bloque
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(x, y + size - 2, size, 2);
        ctx.fillRect(x + size - 2, y, 2, size);
    }
}
