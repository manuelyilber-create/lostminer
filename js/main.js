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

// Spawn del Jugador en la superficie
const spawnX = (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) / 2;
const player = new Player(spawnX, 100);

// Spawn de Animales Pasivos (Ovejas)
const animals = [];
for (let i = 0; i < 8; i++) {
    const animalX = spawnX + (Math.random() - 0.5) * 600;
    animals.push(new Animal(animalX, 100, 'sheep'));
}

// Lista de Monstruos Nocturnos
const monsters = [];

let keys = {};
let timeOfDay = 0.2; // Inicio de mañana

// Inicializar Controles Táctiles para Celular
const touchControls = new TouchControls(canvas, keys);

// Desactivar menú contextual con clic derecho
canvas.addEventListener('contextmenu', e => e.preventDefault());

// Listener de Teclado (PC)
window.addEventListener('keydown', (e) => { 
    keys[e.key] = true; 
    
    // Abrir / Cerrar Crafteo con tecla E
    if (e.key.toLowerCase() === 'e') {
        crafting.toggle();
    }

    // Seleccionar slot del inventario rápido (1 al 5)
    if (e.key >= '1' && e.key <= '5') {
        hud.selectSlot(parseInt(e.key) - 1);
    }
});

window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Interacción para Romper y Poner Bloques (Ratón y Toque Táctil)
const handleAction = (clientX, clientY, button) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (clientY - rect.top) * (canvas.height / rect.height);

    const cameraX = player.x - CONFIG.CANVAS_WIDTH / 2;
    const cameraY = player.y - CONFIG.CANVAS_HEIGHT / 2;
    const worldX = Math.floor((mouseX + cameraX) / CONFIG.TILE_SIZE);
    const worldY = Math.floor((mouseY + cameraY) / CONFIG.TILE_SIZE);

    if (button === 0) {
        // Romper bloque
        const blockId = world.getBlock(worldX, worldY);
        if (blockId !== BLOCKS.AIR) {
            const props = BLOCK_PROPERTIES[blockId];
            const particleX = worldX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const particleY = worldY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            particleSystem.spawnBlockParticles(particleX, particleY, props?.color || '#fff', 15);
            world.setBlock(worldX, worldY, BLOCKS.AIR);
        }
    } else if (button === 2) {
        // Colocar bloque
        const selectedItem = hud.hotbar[hud.selectedSlot];
        if (selectedItem && selectedItem.count > 0) {
            if (world.getBlock(worldX, worldY) === BLOCKS.AIR) {
                world.setBlock(worldX, worldY, selectedItem.id);
                selectedItem.count--;
            }
        }
    }
};

canvas.addEventListener('mousedown', (e) => handleAction(e.clientX, e.clientY, e.button));

// Bucle Principal del Juego (Game Loop)
function gameLoop() {
    // Paso del Tiempo (Ciclo Sol/Luna)
    timeOfDay = (timeOfDay + 0.0002) % 1.0;
    const isNight = Math.sin(timeOfDay * Math.PI) < 0.2;

    // Generar Monstruos en la Noche
    if (isNight && monsters.length < 4 && Math.random() < 0.01) {
        const spawnDistance = (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 150);
        monsters.push(new Monster(player.x + spawnDistance, 100));
    }

    // Actualización de Entidades si el menú no está abierto
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

    // Renderizado del Escenario y Cielo
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
    particleSystem.render(ctx, camera);
    ctx.restore();

    // Renderizado de Interfaces (HUD, Crafteo y Botones Táctiles)
    hud.render(ctx, player);
    crafting.render(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    touchControls.render(ctx);

    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
gameLoop();
