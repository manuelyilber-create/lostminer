// js/ui/hud.js
import { CONFIG } from '../config.js';
import { BLOCK_PROPERTIES } from '../world/blockData.js';

export class HUD {
    constructor() {
        this.selectedSlot = 0;
        // Inventario rápido por defecto (bloques seleccionables)
        this.hotbar = [
            { id: 1, count: 64 }, // Tierra
            { id: 2, count: 64 }, // Pasto
            { id: 3, count: 64 }, // Piedra
            { id: 4, count: 32 }, // Madera
            { id: 10, count: 16 } // Antorcha
        ];
    }

    selectSlot(index) {
        if (index >= 0 && index < this.hotbar.length) {
            this.selectedSlot = index;
        }
    }

    render(ctx, player) {
        ctx.save();

        // --- 1. BARRA DE VIDA (CORAZONES HD) ---
        const heartX = 20;
        const heartY = 20;
        const totalHearts = 10;
        const currentHearts = Math.ceil(player.hp / 2);

        for (let i = 0; i < totalHearts; i++) {
            const x = heartX + i * 18;
            const isFull = i < currentHearts;

            // Base oscura del corazón
            ctx.fillStyle = "#330000";
            ctx.fillRect(x, heartY + 2, 14, 10);
            ctx.fillRect(x + 2, heartY, 10, 14);

            if (isFull) {
                // Relleno Rojo Intenso
                ctx.fillStyle = "#e61a1a";
                ctx.fillRect(x + 1, heartY + 3, 12, 8);
                ctx.fillRect(x + 3, heartY + 1, 8, 12);

                // Brillo blanco de relieve
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(x + 3, heartY + 3, 2, 2);
            }
        }

        // --- 2. HOTBAR (BARRA DE ACCESO RÁPIDO) ---
        const slotSize = 36;
        const totalSlots = 5;
        const startX = (CONFIG.CANVAS_WIDTH - (totalSlots * slotSize)) / 2;
        const startY = CONFIG.CANVAS_HEIGHT - 50;

        for (let i = 0; i < totalSlots; i++) {
            const slotX = startX + i * (slotSize + 4);
            const isSelected = i === this.selectedSlot;

            // Fondo del marco
            ctx.fillStyle = isSelected ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(slotX, startY, slotSize, slotSize);

            // Borde HD
            ctx.strokeStyle = isSelected ? "#ffd700" : "#555555";
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(slotX, startY, slotSize, slotSize);

            // Renderizar miniatura del bloque dentro del Slot
            const item = this.hotbar[i];
            if (item && item.id) {
                const props = BLOCK_PROPERTIES[item.id];
                if (props) {
                    const iconX = slotX + 8;
                    const iconY = startY + 8;
                    const iconSize = 20;

                    ctx.fillStyle = props.color || "#fff";
                    ctx.fillRect(iconX, iconY, iconSize, iconSize);

                    // Número de cantidad
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 10px Arial";
                    ctx.textAlign = "right";
                    ctx.fillText(item.count, slotX + slotSize - 3, startY + slotSize - 4);
                }
            }
        }

        ctx.restore();
    }
}
