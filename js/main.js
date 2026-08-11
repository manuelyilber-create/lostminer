// js/main.js
import { CONFIG } from './config.js';
import { World } from './world/terrain.js';
import { Player } from './entities/player.js';
import { Animal } from './entities/animals.js';
import { Monster } from './entities/monsters.js';
import { Renderer } from './engine/renderer.js';
import { Physics } from './engine/physics.js';
import { ParticleSystem } from './engine/particles.js';
import { BLOCKS, BLOCK_PROPERTIES } from './world/blockData.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
const particleSystem = new ParticleSystem();
const world = new World();
world.generate();

// Spawn del Jugador
const spawnX = (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) / 2;
const player = new Player(spawnX, 100);

// Animales Pasivos
const animals = [];
for (let i = 0; i < 8; i++) {
    const animalX = spawnX + (Math.random() - 0.5) * 600;
    animals.push(new Animal(animalX, 100, 'sheep'));
}

// Lista de Monstruos
const monsters = [];

let keys = {};
let timeOfDay = 0.2;

window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// --- INTERACCIÓN DE ROMPER BLOQUES Y GENERAR PARTÍCULAS ---
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convertir coordenadas de pantalla a coordenadas del mundo
    const cameraX = player.x - CONFIG.CANVAS_WIDTH / 2;
    const cameraY = player.y - CONFIG.CANVAS_HEIGHT / 2;
    const worldX = Math.floor((mouseX + cameraX) / CONFIG.TILE_SIZE);
    const worldY = Math.floor((mouseY + cameraY) / CONFIG.TILE_SIZE);

    const blockId = world.getBlock(worldX, worldY);
    if (blockId !== BLOCKS.AIR) {
        const props = BLOCK_PROPERTIES[blockId];
        
        // Generar explosión de partículas del color del bloque
        const particleX = worldX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const particleY = worldY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        particleSystem.spawnBlockParticles(particleX, particleY, props.color || '#fff', 15);

        // Romper bloque (Convertir en aire)
        world.setBlock(worldX, worldY, BLOCKS.AIR);
    }
});

function gameLoop() {
    timeOfDay = (timeOfDay + 0.0002) % 1.0;
    const isNight = Math.sin(timeOfDay * Math.PI) < 0.2;

    // Aparecer Monstruos en la Noche
    if (isNight && monsters.length < 4 && Math.random() < 0.01) {
        const spawnDistance = (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 150);
        monsters.push(new Monster(player.x + spawnDistance, 100));
    }

    // Actualizar Entidades y Partículas
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

    // Renderizado del Mundo
    renderer.render(world, player, timeOfDay);
    
    // Renderizado de Entidades y Partículas
    const ctx = renderer.ctx;
    const camera = {
        x: player.x - CONFIG.CANVAS_WIDTH / 2,
        y: player.y - CONFIG.CANVAS_HEIGHT / 2
    };

    ctx.save();
    animals.forEach(animal => animal.render(ctx, camera));
    monsters.forEach(monster => monster.render(ctx, camera));
    particleSystem.render(ctx, camera); // Dibujar partículas
    ctx.restore();

    requestAnimationFrame(gameLoop);
}

gameLoop();
