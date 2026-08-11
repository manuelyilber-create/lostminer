// js/world/terrain.js
import { CONFIG } from '../config.js';
import { BLOCKS } from './blockData.js';

export class World {
    constructor() {
        this.width = CONFIG.WORLD_WIDTH;
        this.height = CONFIG.WORLD_HEIGHT;
        this.blocks = new Uint8Array(this.width * this.height);
    }

    generate() {
        for (let x = 0; x < this.width; x++) {
            // Relieve del terreno suave usando ondas seno compuestas
            let heightOffset = Math.floor(
                Math.sin(x * 0.05) * 8 + 
                Math.cos(x * 0.02) * 12
            );
            let surfaceY = CONFIG.SEA_LEVEL + heightOffset;

            for (let y = 0; y < this.height; y++) {
                let idx = y * this.width + x;

                if (y < surfaceY) {
                    this.blocks[idx] = BLOCKS.AIR;
                } else if (y === surfaceY) {
                    this.blocks[idx] = BLOCKS.GRASS;
                } else if (y > surfaceY && y < surfaceY + 6) {
                    this.blocks[idx] = BLOCKS.DIRT;
                } else {
                    // Generación de Piedra, Cuevas y Vetas de Minerales
                    let caveNoise = Math.sin(x * 0.15) + Math.cos(y * 0.15);
                    
                    // Si el valor da un hueco y estamos profundo -> Cueva
                    if (caveNoise < -0.4 && y > surfaceY + 10 && y < this.height - 8) {
                        this.blocks[idx] = BLOCKS.AIR;
                    } else {
                        // Vetas de minerales según la profundidad
                        let rand = Math.random();
                        if (rand < 0.015 && y > surfaceY + 35) {
                            this.blocks[idx] = BLOCKS.DIAMOND;
                        } else if (rand < 0.03 && y > surfaceY + 25) {
                            this.blocks[idx] = BLOCKS.GOLD;
                        } else if (rand < 0.06 && y > surfaceY + 12) {
                            this.blocks[idx] = BLOCKS.IRON;
                        } else if (rand < 0.09) {
                            this.blocks[idx] = BLOCKS.COAL;
                        } else {
                            this.blocks[idx] = BLOCKS.STONE;
                        }
                    }
                }
            }

            // Generación de Árboles Frondosos
            if (x > 5 && x < this.width - 5 && Math.random() < 0.12) {
                let treeY = surfaceY - 1;
                // Tronco
                for (let h = 0; h < 5; h++) {
                    this.setBlock(x, treeY - h, BLOCKS.WOOD);
                }
                // Copa de hojas
                for (let lx = -2; lx <= 2; lx++) {
                    for (let ly = -3; ly <= 0; ly++) {
                        if (this.getBlock(x + lx, treeY - 4 + ly) === BLOCKS.AIR) {
                            this.setBlock(x + lx, treeY - 4 + ly, BLOCKS.LEAVES);
                        }
                    }
                }
            }
        }
    }

    getBlock(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return BLOCKS.STONE;
        return this.blocks[y * this.width + x];
    }

    setBlock(x, y, type) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.blocks[y * this.width + x] = type;
        }
    }
}
