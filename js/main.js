// js/main.js
import { CONFIG } from './config.js';
import { World } from './world/terrain.js';
import { Player } from './entities/player.js';
import { Animal } from './entities/animals.js';
import { Monster } from './entities/monsters.js';
import { Renderer } from './engine/renderer.js';
import { Physics } from './engine/physics.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
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
let timeOfDay = 0.2; // Sol arriba

window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function gameLoop() {
    // Avance del ciclo Sol / Luna
    timeOfDay = (timeOfDay + 0.0002) % 1.0;
    const isNight = Math.sin(timeOfDay * Math.PI) < 0.2;

    // --- APARECER MONSTRUOS EN LA NOCHE ---
    if (isNight && monsters.length < 4 && Math.random() < 0.01) {
        const spawnDistance = (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 150);
        monsters.push(new Monster(player.x + spawnDistance, 100));
    }

    // Actualizar Jugador
    player.update(keys);
    Physics.checkWorldCollision(player, world);

    // Actualizar Animales
    animals.forEach(animal => {
        animal.update(world);
        Physics.checkWorldCollision(animal, world);
    });

    // Actualizar Monstruos
    monsters.forEach((monster, index) => {
        monster.update(player, world);
        Physics.checkWorldCollision(monster, world);
    });

    // Renderizado del Mundo y Jugador
    renderer.render(world, player, timeOfDay);
    
    // Renderizado de Entidades sobre la Cámara
    const ctx = renderer.ctx;
    const camera = {
        x: player.x - CONFIG.CANVAS_WIDTH / 2,
        y: player.y - CONFIG.CANVAS_HEIGHT / 2
    };

    ctx.save();
    animals.forEach(animal => animal.render(ctx, camera));
    monsters.forEach(monster => monster.render(ctx, camera));
    ctx.restore();

    requestAnimationFrame(gameLoop);
}

gameLoop();
