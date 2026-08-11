// js/main.js
import { CONFIG } from './config.js';
import { World } from './world/terrain.js';
import { Player } from './entities/player.js';
import { Animal } from './entities/animals.js';
import { Renderer } from './engine/renderer.js';
import { Physics } from './engine/physics.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
const world = new World();
world.generate();

// Spawn del jugador
const spawnX = (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) / 2;
const player = new Player(spawnX, 100);

// Spawn de Animales en la superficie
const animals = [];
for (let i = 0; i < 8; i++) {
    const animalX = spawnX + (Math.random() - 0.5) * 600;
    animals.push(new Animal(animalX, 100, 'sheep'));
}

let keys = {};
let timeOfDay = 0.2;

window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function gameLoop() {
    timeOfDay = (timeOfDay + 0.0001) % 1.0;

    // Actualizar Jugador
    player.update(keys);
    Physics.checkWorldCollision(player, world);

    // Actualizar y aplicar física a los Animales
    animals.forEach(animal => {
        animal.update(world);
        Physics.checkWorldCollision(animal, world);
    });

    // Renderizar Mundo, Jugador y Animales
    renderer.render(world, player, timeOfDay);
    
    // Renderizado extra de entidades sobre el Canvas
    const ctx = renderer.ctx;
    const camera = {
        x: player.x - CONFIG.CANVAS_WIDTH / 2,
        y: player.y - CONFIG.CANVAS_HEIGHT / 2
    };

    ctx.save();
    animals.forEach(animal => animal.render(ctx, camera));
    ctx.restore();

    requestAnimationFrame(gameLoop);
}

gameLoop();
