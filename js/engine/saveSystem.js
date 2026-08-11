// js/engine/saveSystem.js
export class SaveSystem {
    static SAVE_KEY = 'lostminer_hd_save';

    static saveGame(player, world, hud, playerName, volume) {
        const saveData = {
            playerName: playerName || 'Yilber',
            volume: volume,
            player: {
                x: player.x,
                y: player.y,
                hp: player.hp
            },
            hotbar: hud.hotbar,
            inventory: hud.inventory,
            timestamp: Date.now()
        };
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
        alert("¡Partida guardada con éxito!");
    }

    static loadGame() {
        const data = localStorage.getItem(this.SAVE_KEY);
        if (!data) return null;
        return JSON.parse(data);
    }

    static hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
}
