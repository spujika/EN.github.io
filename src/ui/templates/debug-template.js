/**
 * Debug Menu Template
 * Contains the debug menu with spawn controls and stat editors
 */
function createDebugTemplate() {
    return `
    <!-- Debug Menu -->
    <div id="debugMenu" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 600px;">
            <h2 class="modal-title">Debug Menu</h2>
            <p style="color: #888; font-size: 0.9em; margin-bottom: 20px;">Press \` (backtick) to toggle</p>

            <div style="display: grid; gap: 15px;">
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #ffd700;">Spawn Coins</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn-secondary" onclick="debugSpawnCoins(10)">+10 Coins</button>
                        <button class="btn-secondary" onclick="debugSpawnCoins(50)">+50 Coins</button>
                        <button class="btn-secondary" onclick="debugSpawnCoins(100)">+100 Coins</button>
                        <button class="btn-secondary" onclick="debugSpawnCoins(500)">+500 Coins</button>
                        <button class="btn-secondary" onclick="debugSpawnCoins(1000)">+1000 Coins</button>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #8a2be2;">Spawn Items</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn-secondary" onclick="debugSpawnItem('COIN_POUCH')">Coin Pouch</button>
                        <button class="btn-secondary" onclick="debugSpawnItem('bread')">Bread</button>
                        <button class="btn-secondary" onclick="debugSpawnItem('health_potion')">Health
                            Potion</button>
                        <button class="btn-secondary" onclick="debugSpawnItem('iron_sword')">Iron Sword</button>
                        <button class="btn-secondary" onclick="debugSpawnItem('steel_chestplate')">Steel
                            Armor</button>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #ff4444;">Clear Inventory</h3>
                    <button class="btn-secondary" onclick="debugClearInventory()" style="background: #ff4444;">Clear All
                        Items</button>
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #ff0000;">Game Settings</h3>
                    <button class="btn-secondary" onclick="debugResetGame()"
                        style="background: #ff0000; color: white; width: 100%;">Reset Game Data (Wipe Save)</button>
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #00ff88;">Player Stats</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <label>Speed: <input type="number" id="debug-player-speed" step="0.1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Damage: <input type="number" id="debug-player-damage" step="1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Defense: <input type="number" id="debug-player-defense" step="1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Max HP: <input type="number" id="debug-player-health" step="10"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Fire Rate: <input type="number" id="debug-player-firerate" step="1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Crit %: <input type="number" id="debug-player-crit" step="1" min="0" max="100"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Dash Speed: <input type="number" id="debug-player-dashspeed" step="1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Dash Dist: <input type="number" id="debug-player-dashdist" step="10"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Max Dashes: <input type="number" id="debug-player-maxdashes" step="1" min="1" max="5"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                    </div>
                    <div style="margin-top: 10px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="debug-god-mode" onchange="toggleGodMode(this.checked)">
                            God Mode (Invincible)
                        </label>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #ff0000;">Active Boss Stats</h3>
                    <div id="debug-boss-info" style="margin-bottom: 10px; color: #aaa;">No active boss</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <label>Speed: <input type="number" id="debug-boss-speed" step="0.1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Max HP: <input type="number" id="debug-boss-maxhp" step="10"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Dmg Mult: <input type="number" id="debug-boss-dmg" step="0.1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Contact Dmg: <input type="number" id="debug-boss-contact" step="0.1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Proj Spd: <input type="number" id="debug-boss-proj-spd" step="0.1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Proj Count: <input type="number" id="debug-boss-proj-count" step="1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Regeneration: <input type="number" id="debug-boss-regen" step="0.1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Dmg Reduction: <input type="number" id="debug-boss-dmgreduce" step="0.1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                        <label>Attack CD: <input type="number" id="debug-boss-attackcd" step="1"
                                style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                    </div>
                </div>
            </div>


            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #0088ff;">Level Selection</h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <label>Start Level: <input type="number" id="debug-start-level" value="1" min="1" step="1"
                            style="width: 60px; background: #333; color: white; border: 1px solid #555;"></label>
                    <button class="btn-primary" onclick="debugStartAtLevel()"
                        style="padding: 5px 10px; font-size: 0.9em;">Start Run</button>
                </div>
            </div>
        </div>

        <button class="btn-primary" onclick="toggleDebugMenu()" style="margin-top: 20px;">Close</button>
    </div>
    `;
}
