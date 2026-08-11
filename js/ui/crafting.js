// js/ui/crafting.js
import { BLOCKS } from '../world/blockData.js';

export class CraftingSystem {
    constructor() {
        this.isOpen = false;
        
        // Recetas de crafteo disponibles
        this.recipes = [
            {
                name: "Antorcha (x4)",
                result: { id: BLOCKS.TORCH, count: 4 },
                input: [{ id: BLOCKS.WOOD, count: 1 }, { id: BLOCKS.COAL, count: 1 }]
            },
            {
                name: "Bloque de Madera (x4)",
                result: { id: BLOCKS.WOOD, count: 4 },
                input: [{ id: BLOCKS.WOOD, count: 1 }]
            }
        ];
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    render(ctx, width, height) {
        if (!this.isOpen) return;

        ctx.save();
        
        // Fondo semi-transparente oscuro
        ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
        ctx.fillRect(width / 4, height / 6, width / 2, height * 0.65);

        // Borde del menú
        ctx.strokeStyle = "#ff9900";
        ctx.lineWidth = 3;
        ctx.strokeRect(width / 4, height / 6, width / 2, height * 0.65);

        // Título
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("MENÚ DE CRAFTEO (Presiona 'E' para cerrar)", width / 2, height / 6 + 30);

        // Dibujar recetas
        let startY = height / 6 + 60;
        this.recipes.forEach((recipe, idx) => {
            ctx.fillStyle = "#222233";
            ctx.fillRect(width / 4 + 20, startY + idx * 45, width / 2 - 40, 35);

            ctx.fillStyle = "#ffcc00";
            ctx.font = "14px Arial";
            ctx.textAlign = "left";
            ctx.fillText(recipe.name, width / 4 + 30, startY + idx * 45 + 22);
        });

        ctx.restore();
    }
}
