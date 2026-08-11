// js/main.js
import { CONFIG } from './config.js'; // config.js está en la misma carpeta js/
import { World } from './world/terrain.js';
import { Player } from './entities/player.js';
import { Animal } from './entities/animals.js';
import { Monster } from './entities/monsters.js';
import { Environment } from './world/environment.js';
import { Renderer } from './engine/renderer.js';
import { Physics } from './engine/physics.js';
import { ParticleSystem } from './engine/particles.js';
import { SoundEngine } from './engine/audio.js';
import { SaveSystem } from './engine/saveSystem.js';
import { HUD } from './ui/hud.js';
import { CraftingSystem } from './ui/crafting.js';
import { TouchControls } from './ui/touchControls.js';
import { BLOCKS, BLOCK_PROPERTIES } from './world/blockData.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);
const particleSystem = new ParticleSystem();
const soundEngine = new SoundEngine();
const environment = new Environment();
const hud = new HUD();
const crafting = new CraftingSystem();
const world = new World();

let player;
let animals = [];
let monsters = [];
let keys = {};
let timeOfDay = 0.2;
let playerName = "Yilber";
let gameStarted = false;

const touchControls = new TouchControls(canvas, keys);
canvas.addEventListener('contextmenu', e => e.preventDefault());

// Función para inicializar el mundo seguro
function initGame() {
    world.generate();
    const spawnX = (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE) / 2;
    player = new Player(spawnX, 100);

    // Intentar Cargar Partida Guardada
    if (SaveSystem.hasSave()) {
        const saved = SaveSystem.loadGame();
        if (saved) {
            playerName = saved.playerName || "Yilber";
            player.x = saved.player.x;
            player.y = saved.player.y;
            player.hp = saved.player.hp;
            if (saved.hotbar) hud.hotbar = saved.hotbar;
            if (saved.inventory) hud.inventory = saved.inventory;
            if (saved.volume !== undefined) soundEngine.setVolume(saved.volume);
        }
    }

    animals.push(new Animal(spawnX + 100, 100, 'sheep'));
    gameStarted = true;
}

// Pantalla de Inicio / Carga (Evita la pantalla negra)
function renderStartMenu() {
    const ctx = renderer.ctx;
    ctx.fillStyle = "#111118";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff9900";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LOSTMINER HD", canvas.width / 2, canvas.height / 3);

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";
    ctx.fillText("Toca la pantalla o presiona Click para iniciar", canvas.width / 2, canvas.height / 2);

    ctx.strokeStyle = "#ff9900";
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width / 2 - 120, canvas.height / 2 - 30, 240, 50);
}

// Evento de Inicio al tocar/hacer clic
function StartHandler() {
    if (!gameStarted) {
        initGame();
        canvas.removeEventListener('click', StartHandler);
        canvas.removeEventListener('touchstart', StartHandler);
    }
}
canvas.addEventListener('click', StartHandler);
canvas.addEventListener('touchstart', StartHandler);

// Eventos de Teclado
window.addEventListener('keydown', (e) => { 
    if (!gameStarted) return;
    keys[e.key] = true; 
    
    if (e.key.toLowerCase() === 'e') crafting.toggle();
    if (e.key.toLowerCase() === 'b') hud.toggleBag();
    if (e.key.toLowerCase() === 'p') hud.toggleSettings();
    if (e.key.toLowerCase() === 'g') SaveSystem.saveGame(player, world, hud, playerName, soundEngine.volume);

    if (e.key === '+' || e.key === '=') soundEngine.setVolume(soundEngine.volume + 0.1);
    if (e.key === '-' || e.key === '_') soundEngine.setVolume(soundEngine.volume - 0.1);

    if (e.key >= '1' && e.key <= '5') hud.selectSlot(parseInt(e.key) - 1);
    if ((e.key === 'w' || e.key === ' ') && player.grounded) soundEngine.playJumpSound();
});

window.addEventListener('keyup', (e) => { if (gameStarted) keys[e.key] = false; });

// Acciones de Ratón / Toque
canvas.addEventListener('mousedown', (e) => {
    if (!gameStarted) return;
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
            soundEngine.playBreakSound();
            const props = BLOCK_PROPERTIES[blockId];
            particleSystem.spawnBlockParticles(worldX * CONFIG.TILE_SIZE + 12, worldY * CONFIG.TILE_SIZE + 12, props?.color || '#fff', 12);
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

// Bucle Principal (Game Loop)
function gameLoop() {
    if (!gameStarted) {
        renderStartMenu();
        requestAnimationFrame(gameLoop);
        return;
    }

    timeOfDay = (timeOfDay + 0.0002) % 1.0;
    const isNight = Math.sin(timeOfDay * Math.PI) < 0.2;

    if (isNight && monsters.length < 3 && Math.random() < 0.008) {
        const type = Math.random() > 0.5 ? 'zombie' : 'spider';
        monsters.push(new Monster(player.x + (Math.random() > 0.5 ? 200 : -200), 100, type));
    }

    if (!crafting.isOpen && !hud.isBagOpen && !hud.isSettingsOpen) {
        player.update(keys);
        Physics.checkWorldCollision(player, world);

        animals.forEach(a => { a.update(world); Physics.checkWorldCollision(a, world); });
        monsters.forEach(m => { m.update(player, world); Physics.checkWorldCollision(m, world); });
        
        environment.update(world);
        particleSystem.update();
    }

    renderer.render(world, player, timeOfDay);
    
    const ctx = renderer.ctx;
    const camera = { x: player.x - CONFIG.CANVAS_WIDTH / 2, y: player.y - CONFIG.CANVAS_HEIGHT / 2 };

    ctx.save();
    environment.render(ctx, camera);
    animals.forEach(a => a.render(ctx, camera));
    monsters.forEach(m => m.render(ctx, camera));
    particleSystem.render(ctx, camera);
    ctx.restore();

    hud.render(ctx, player, playerName, soundEngine.volume);
    crafting.render(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    touchControls.render(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();
