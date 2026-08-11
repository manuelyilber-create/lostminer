// js/engine/physics.js
import { CONFIG } from '../config.js';
import { BLOCK_PROPERTIES } from '../world/blockData.js';

export class Physics {
    static checkWorldCollision(entity, world) {
        let tileSize = CONFIG.TILE_SIZE;

        // Físicas Eje X
        entity.x += entity.vx;
        if (this.isColliding(entity, world, tileSize)) {
            entity.x -= entity.vx;
            entity.vx = 0;
        }

        // Físicas Eje Y
        entity.y += entity.vy;
        if (this.isColliding(entity, world, tileSize)) {
            entity.y -= entity.vy;
            if (entity.vy > 0) {
                entity.grounded = true;
            }
            entity.vy = 0;
        } else {
            entity.grounded = false;
        }
    }

    static isColliding(entity, world, tileSize) {
        let left = Math.floor(entity.x / tileSize);
        let right = Math.floor((entity.x + entity.width) / tileSize);
        let top = Math.floor(entity.y / tileSize);
        let bottom = Math.floor((entity.y + entity.height) / tileSize);

        for (let x = left; x <= right; x++) {
            for (let y = top; y <= bottom; y++) {
                let blockId = world.getBlock(x, y);
                if (BLOCK_PROPERTIES[blockId]?.solid) {
                    return true;
                }
            }
        }
        return false;
    }
}
