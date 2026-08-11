// js/ui/hud.js
import { CONFIG } from '../config.js';
import { BLOCK_PROPERTIES } from '../world/blockData.js';

export class HUD {
    constructor() {
        this.selectedSlot = 0;
        this.isBagOpen = false;
        this.isSettingsOpen = false;

        this.hotbar = [
            { id: 1, count: 64 },
            { id: 2, count: 64 },
            { id: 3, count: 64 },
            { id: 4, count: 32 },
            { id: 10, count: 16 }
        ];

        // Bolso de almacenamiento de 15 slots
        this.inventory = Array(15).fill(null).map((_, i) => ({
            id: (i % 10) + 1,
            count: 20
        }));
    }

    toggleBag() {
        this.isBagOpen = !this.isBagOpen;
    }

    toggleSettings() {
        this.isSettingsOpen = !this.isSettingsOpen;
    }

    selectSlot(index) {
        if (index >= 0 && index < this.hotbar.length) {
            this.selectedSlot = index;
        }
    }

    render(ctx, player, playerName, volume) {
        ctx.save();

        // 1. NOMBRE DEL JUGADOR Y VIDA
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.fillText(`Jugador: ${playerName || 'Yilber'}`, 20, 20);

        // Corazones de vida
        for (let i = 0; i < 10; i++) {
            const x = 20 + i * 16;
            ctx.fillStyle = i < Math.ceil(player.hp / 2) ? "#ff2222" : "#444444";
            ctx.fillRect(x, 28, 12, 12);
        }

        // 2. HOTBAR
        const slotSize = 36;
        const startX = (CONFIG.CANVAS_WIDTH - (5 * slotSize)) / 2;
        const startY = CONFIG.CANVAS_HEIGHT - 48;

        for (let i = 0; i < 5; i++) {
            const slotX = startX + i * (slotSize + 4);
            const isSelected = i === this.selectedSlot;

            ctx.fillStyle = isSelected ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.6)";
            ctx.fillRect(slotX, startY, slotSize, slotSize);
            ctx.strokeStyle = isSelected ? "#ffd700" : "#555";
            ctx.lineWidth = 2;
            ctx.strokeRect(slotX, startY, slotSize, slotSize);

            const item = this.hotbar[i];
            if (item && item.id) {
                const props = BLOCK_PROPERTIES[item.id];
                if (props) {
                    ctx.fillStyle = props.color || "#fff";
                    ctx.fillRect(slotX + 8, startY + 8, 20, 20);
                    ctx.fillStyle = "#fff";
                    ctx.font = "bold 10px Arial";
                    ctx.fillText(item.count, slotX + slotSize - 12, startY + slotSize - 4);
                }
            }
        }

        // 3. BOLSO / INVENTARIO (Si está abierto)
        if (this.isBagOpen) {
            ctx.fillStyle = "rgba(15, 15, 25, 0.9)";
            ctx.fillRect(CONFIG.CANVAS_WIDTH / 4, 60, CONFIG.CANVAS_WIDTH / 2, 220);
            ctx.strokeStyle = "#ff9900";
            ctx.strokeRect(CONFIG.CANVAS_WIDTH / 4, 60, CONFIG.CANVAS_WIDTH / 2, 220);

            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.fillText("🎒 BOLSO / INVENTARIO (Presiona 'B' para cerrar)", CONFIG.CANVAS_WIDTH / 2, 85);

            for (let i = 0; i < 15; i++) {
                const col = i % 5;
                const row = Math.floor(i / 5);
                const bx = CONFIG.CANVAS_WIDTH / 4 + 35 + col * 45;
                const by = 105 + row * 45;

                ctx.fillStyle = "rgba(255,255,255,0.1)";
                ctx.fillRect(bx, by, 38, 38);
                ctx.strokeStyle = "#888";
                ctx.strokeRect(bx, by, 38, 38);

                const invItem = this.inventory[i];
                if (invItem) {
                    const props = BLOCK_PROPERTIES[invItem.id];
                    if (props) {
                        ctx.fillStyle = props.color || "#fff";
                        ctx.fillRect(bx + 6, by + 6, 26, 26);
                    }
                }
            }
        }

        // 4. MENÚ DE CONFIGURACIÓN Y VOLUMEN (Si está abierto)
        if (this.isSettingsOpen) {
            ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
            ctx.fillRect(CONFIG.CANVAS_WIDTH / 4, 40, CONFIG.CANVAS_WIDTH / 2, 260);
            ctx.strokeStyle = "#00ffff";
            ctx.strokeRect(CONFIG.CANVAS_WIDTH / 4, 40, CONFIG.CANVAS_WIDTH / 2, 260);

            ctx.fillStyle = "#00ffff";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.fillText("⚙️ CONFIGURACIÓN Y PARTIDA", CONFIG.CANVAS_WIDTH / 2, 70);

            ctx.fillStyle = "#fff";
            ctx.font = "14px Arial";
            ctx.fillText(`Volumen de Audio: ${Math.round(volume * 100)}%`, CONFIG.CANVAS_WIDTH / 2, 120);
            ctx.fillText("(Usa teclas '+' o '-' para ajustar volumen)", CONFIG.CANVAS_WIDTH / 2, 145);

            ctx.fillStyle = "#28a745";
            ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - 80, 180, 160, 35);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px Arial";
            ctx.fillText("💾 Guardar Partida (G)", CONFIG.CANVAS_WIDTH / 2, 202);
        }

        ctx.restore();
    }
}
