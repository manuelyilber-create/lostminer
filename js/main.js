// js/main.js
import { CONFIG } from './config.js';
import { World } from './world/terrain.js';
import { Player } from './entities/player.js';
import { Animal } from './entities/animals.js';
import { Monster } from './entities/monsters.js';
import { Renderer } from './engine/renderer.js';
import { Physics } from './engine/physics.js';
import { ParticleSystem } from './engine/particles.js';
import { HUD } from './ui/hud.js';
import { CraftingSystem } from './ui/crafting.js';
import { TouchControls } from './ui/touchControls.js';
import { BLOCKS, BLOCK_PROPERTIES } from './world/blockData.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
const particleSystem = new ParticleSystem();
const hud = new HUD();
const crafting = new CraftingSystem();
const world = new World();
world.generate();

// Spawn
const spawnX = (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) / 2;
const player = new Player(spawnX, 100);

const animals = [];
for (let i = 0; i < 5; i++) {
    animals.push(new Animal(spawnX + (Math.random() - 0.5) * 400, 100, 'sheep'));
}

const monsters = [];
let keys = {};
let timeOfDay = 0.2;

const touchControls = new TouchControls(canvas, keys);
canvas.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener('keydown', (e) => { 
    keys[e.key] = true; 
    if (e.key.toLowerCase() === 'e') crafting.toggle();
    if (e.key >= '1' && e.key <= '5') hud.selectSlot(parseInt(e.key) - 1);
});

window.addEventListener('keyup', (e) => { keys[e.key] = false; });

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cameraX = player.x - CONFIG.CANVAS_WIDTH / 2;
    const cameraY = player.y - CONFIG.CANVAS_HEIGHT / 2;
    const worldX = Math.floor((mouseX + cameraX) / CONFIG.TILE_SIZE);
    const worldY = Math.floor((mouseY + cameraY) / CONFIG.TILE_SIZE);

    if (e.button === 0) {
        const blockId = world.getBlock(worldX, worldY);
        if (blockId !== BLOCKS.AIR) {
            const props = BLOCK_PROPERTIES[blockId];
            particleSystem.spawnBlockParticles(worldX * CONFIG.TILE_SIZE + 8, worldY * CONFIG.TILE_SIZE + 8, props?.color || '#fff', 10);
            world.setBlock(worldX, worldY, BLOCKS.AIR);
        }
    } else if (e.button === 2) {
        const selectedItem = hud.hotbar[hud.selectedSlot];
        if (selectedItem && selectedItem.count > 0 && world.getBlock(worldX, worldY) === BLOCKS.AIR) {
            world.setBlock(worldX, worldY, selectedItem.id);
            selectedItem.count--;
        }
    }
});

function gameLoop() {
    timeOfDay = (timeOfDay + 0.0002) % 1.0;
    const isNight = Math.sin(timeOfDay * Math.PI) < 0.2;

    if (isNight && monsters.length < 3 && Math.random() < 0.01) {
        monsters.push(new Monster(player.x + (Math.random() > 0.5 ? 200 : -200), 100));
    }

    if (!crafting.isOpen) {
        player.update(keys);
        Physics.checkWorldCollision(player, world);

        animals.forEach(a => { a.update(world); Physics.checkWorldCollision(a, world); });
        monsters.forEach(m => { m.update(player, world); Physics.checkWorldCollision(m, world); });
        
        particleSystem.update();
    }

    renderer.render(world, player, timeOfDay);
    
    const ctx = renderer.ctx;
    const camera = { x: player.x - CONFIG.CANVAS_WIDTH / 2, y: player.y - CONFIG.CANVAS_HEIGHT / 2 };

    ctx.save();
    animals.forEach(a => a.render(ctx, camera));
    monsters.forEach(m => m.render(ctx, camera));
    particleSystem.render(ctx, camera);
    ctx.restore();

    hud.render(ctx, player);
    crafting.render(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    touchControls.render(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();
