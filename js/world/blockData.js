// js/world/blockData.js
export const BLOCKS = {
    AIR: 0,
    DIRT: 1,
    GRASS: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    COAL: 6,
    IRON: 7,
    GOLD: 8,
    DIAMOND: 9,
    TORCH: 10,
    WATER: 11,
    SAND: 12
};

export const BLOCK_PROPERTIES = {
    [BLOCKS.AIR]: { name: "Aire", solid: false, transparent: true },
    [BLOCKS.DIRT]: { name: "Tierra Orgánica", solid: true, color: "#543821" },
    [BLOCKS.GRASS]: { name: "Pasto Nutritivo", solid: true, color: "#427a24", topColor: "#57a62e" },
    [BLOCKS.STONE]: { name: "Piedra Rocosa", solid: true, color: "#4d5156" },
    [BLOCKS.WOOD]: { name: "Madera de Roble", solid: true, color: "#614126", barkColor: "#3b2614" },
    [BLOCKS.LEAVES]: { name: "Follaje Frondoso", solid: true, color: "#2e6924", transparent: true },
    [BLOCKS.COAL]: { name: "Mena de Carbón", solid: true, color: "#4d5156", spotColor: "#1a1a1b" },
    [BLOCKS.IRON]: { name: "Mena de Hierro", solid: true, color: "#4d5156", spotColor: "#c2916b" },
    [BLOCKS.GOLD]: { name: "Mena de Oro", solid: true, color: "#4d5156", spotColor: "#e6bf35" },
    [BLOCKS.DIAMOND]: { name: "Mena de Diamante", solid: true, color: "#4d5156", spotColor: "#2be0d4" },
    [BLOCKS.TORCH]: { name: "Antorcha Intensa", solid: false, color: "#ff9900" },
    [BLOCKS.WATER]: { name: "Agua Cristalina", solid: false, transparent: true, color: "rgba(30, 144, 255, 0.6)" },
    [BLOCKS.SAND]: { name: "Arena Fina", solid: true, color: "#d2b48c" }
};
