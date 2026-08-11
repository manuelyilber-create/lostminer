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
import { BLOCKS, BLOCK_PROPERTIES } from './world/blockData.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
const particleSystem = new ParticleSystem();
const hud = new HUD();
const crafting = new CraftingSystem();
const world = new World();
world.generate();

// Spawn del Jugador
const spawnX = (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) / 2;
const player = new Player(spawnX, 100);

// Spawn de Animales
const animals = [];
for (let i = 0; i < 8; i++) {
    const animalX = spawnX + (Math.random() - 0.5) * 600;
    animals.push(new Animal(animalX, 100, 'sheep'));
}

const monsters = [];
let keys = {};
let timeOfDay = 0.2;

// Desactivar menú contextual
canvas.addEventListener('contextmenu', e => e.preventDefault());

// Controles Teclado
window.addEventListener('keydown', (e) => { 
    keys[e.key] = true; 
    
    // Abrir/Cerrar Crafteo
    if (e.key.toLowerCase() === 'e') {
        crafting.toggle();
    }

    // Selección de Hotbar (1 - 5)
    if (e.key >= '1' && e.key <= '5') {
        hud.selectSlot(parseInt(e.key) - 1);
    }
});

window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Interacción con Ratón / Toque
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cameraX = player.x - CONFIG.CANVAS_WIDTH / 2;
    const cameraY = player.y - CONFIG.CANVAS_HEIGHT / 2;
    const worldX = Math.floor((mouseX + cameraX) / CONFIG.TILE_SIZE);
    const worldY = Math.floor((mouseY + cameraY) / CONFIG.TILE_SIZE);

    if (e.button === 0) {
        // Clic Izquierdo: Romper bloque
        const blockId = world.getBlock(worldX, worldY);
        if (blockId !== BLOCKS.AIR) {
            const props = BLOCK_PROPERTIES[blockId];
            const particleX = worldX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const particleY = worldY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            particleSystem.spawnBlockParticles(particleX, particleY, props.color || '#fff', 15);
            world.setBlock(worldX, worldY, BLOCKS.AIR);
        }
    } else if (e.button === 2) {
        // Clic Derecho: Colocar bloque
        const selectedItem = hud.hotbar[hud.selectedSlot];
        if (selectedItem && selectedItem.count > 0) {
            if (world.getBlock(worldX, worldY) === BLOCKS.AIR) {
                world.setBlock(worldX, worldY, selectedItem.id);
                selectedItem.count--;
            }
        }
    }
});

// Bucle Principal de Juego
function gameLoop() {
    timeOfDay = (timeOfDay + 0.0002) % 1.0;
    const isNight = Math.sin(timeOfDay * Math.PI) < 0.2;

    // Aparición de Monstruos Nocturnos
    if (isNight && monsters.length < 4 && Math.random() < 0.01) {
        const spawnDistance = (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 150);
        monsters.push(new Monster(player.x + spawnDistance, 100));
    }

    if (!crafting.isOpen) {
        player.update(keys);
        Physics.checkWorldCollision(player, world);

        animals.forEach(animal => {
            animal.update(world);
            Physics.checkWorldCollision(animal, world);
        });

        monsters.forEach(monster => {
            monster.update(player, world);
            Physics.checkWorldCollision(monster, world);
        });

        particleSystem.update();
    }

    // Renderizado
    renderer.render(world, player, timeOfDay);
    
    const ctx = renderer.ctx;
    const camera = {
        x: player.x - CONFIG.CANVAS_WIDTH / 2,
        y: player.y - CONFIG.CANVAS_HEIGHT / 2
    };

    ctx.save();
    animals.forEach(animal => animal.render(ctx, camera));
    monsters.forEach(monster => monster.render(ctx, camera));
    particleSystem.render(ctx, camera);
    ctx.restore();

    // Renderizado de Interfaces de Usuario
    hud.render(ctx, player);
    crafting.render(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    requestAnimationFrame(gameLoop);
}

gameLoop();
