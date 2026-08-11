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
            let heightOffset = Math.floor(Math.sin(x * 0.05) * 8 + Math.cos(x * 0.02) * 12);
            let surfaceY = CONFIG.SEA_LEVEL + heightOffset;

            for (let y = 0; y < this.height; y++) {
                let idx = y * this.width + x;

                if (y < surfaceY) {
                    // Si está por debajo del nivel del mar pero sobre la tierra -> Agua
                    if (y >= CONFIG.SEA_LEVEL) {
                        this.blocks[idx] = BLOCKS.WATER;
                    } else {
                        this.blocks[idx] = BLOCKS.AIR;
                    }
                } else if (y === surfaceY) {
                    this.blocks[idx] = surfaceY >= CONFIG.SEA_LEVEL ? BLOCKS.SAND : BLOCKS.GRASS;
                } else if (y > surfaceY && y < surfaceY + 6) {
                    this.blocks[idx] = BLOCKS.DIRT;
                } else {
                    let rand = Math.random();
                    if (rand < 0.015 && y > surfaceY + 35) this.blocks[idx] = BLOCKS.DIAMOND;
                    else if (rand < 0.03 && y > surfaceY + 25) this.blocks[idx] = BLOCKS.GOLD;
                    else if (rand < 0.06 && y > surfaceY + 12) this.blocks[idx] = BLOCKS.IRON;
                    else if (rand < 0.09) this.blocks[idx] = BLOCKS.COAL;
                    else this.blocks[idx] = BLOCKS.STONE;
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
