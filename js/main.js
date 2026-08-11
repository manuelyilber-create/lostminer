// js/main.js
import { CONFIG } from './config.js';
import { World } from './world/terrain.js';
import { Player } from './entities/player.js';
import { Renderer } from './engine/renderer.js';
import { Physics } from './engine/physics.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
const world = new World();
world.generate();

// Generar jugador en el centro del mundo sobre la superficie
const spawnX = (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) / 2;
const player = new Player(spawnX, 100);

let keys = {};
let timeOfDay = 0.2; // Inicia de mañana

// Controles por teclado
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Bucle principal (Game Loop)
function gameLoop() {
    // Paso del tiempo (Ciclo Sol/Luna)
    timeOfDay = (timeOfDay + 0.0001) % 1.0;

    // Actualización de física y jugador
    player.update(keys);
    Physics.checkWorldCollision(player, world);

    // Renderizado completo HD
    renderer.render(world, player, timeOfDay);

    requestAnimationFrame(gameLoop);
}

gameLoop();
