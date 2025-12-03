// Debug Menu System

// Toggle debug menu with backtick key (`)
document.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        toggleDebugMenu();
    }
});

function toggleDebugMenu() {
    const menu = document.getElementById('debugMenu');
    if (!menu) return;

    const isHidden = menu.style.display === 'none' || menu.style.display === '';

    if (isHidden) {
        // Opening menu
        menu.style.display = 'flex';
        if (window.game && window.game.state === 'playing') {
            window.game.debugPaused = true; // Just set flag, don't change state
        }
        updateDebugValues();
        // Default to general tab if no active tab
        if (!document.querySelector('.tab-btn.active')) {
            switchDebugTab('general');
        }
    } else {
        // Closing menu
        menu.style.display = 'none';
        if (window.game) {
            window.game.debugPaused = false;
        }
    }
}

function switchDebugTab(tabId) {
    // Hide all contents
    document.querySelectorAll('.debug-tab-content').forEach(el => el.style.display = 'none');
    // Deactivate all buttons
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active');
        el.style.borderBottom = 'none';
        el.style.color = '#888';
    });

    // Show selected content
    const content = document.getElementById(`debug-tab-${tabId}`);
    if (content) content.style.display = tabId === 'general' ? 'grid' : 'flex';
    if (tabId === 'player' || tabId === 'boss') content.style.display = 'grid'; // Grid for these too

    // Activate button
    const btn = document.querySelector(`.tab-btn[onclick="switchDebugTab('${tabId}')"]`);
    if (btn) {
        btn.classList.add('active');
        btn.style.borderBottom = '2px solid #8a2be2';
        btn.style.color = '#fff';
    }
}

function initDebugUI() {
    // Player Inputs - use oninput for real-time updates
    const pSpeed = document.getElementById('debug-player-speed');
    const pDamage = document.getElementById('debug-player-damage');
    const pHealth = document.getElementById('debug-player-health');
    const pFireRate = document.getElementById('debug-player-firerate');

    if (pSpeed) pSpeed.oninput = (e) => {
        if (window.game && window.game.player) {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0) {
                window.game.player.baseStats.speed = val;
                window.game.player.speed = val; // Update active speed directly
            }
        }
    };
    if (pDamage) pDamage.oninput = (e) => {
        if (window.game && window.game.player) {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 0) {
                window.game.player.baseStats.damage = val;
                window.game.player.updateStats();
            }
        }
    };
    if (pHealth) pHealth.oninput = (e) => {
        if (window.game && window.game.player) {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val > 0) {
                window.game.player.baseStats.maxHealth = val;
                window.game.player.updateStats();
            }
        }
    };
    if (pFireRate) pFireRate.oninput = (e) => {
        if (window.game && window.game.player) {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 0) {
                window.game.player.baseStats.fireRate = val;
                window.game.player.fireRate = val; // Update active fire rate directly
            }
        }
    };

    // Dash inputs
    const pDashDist = document.getElementById('debug-player-dashdist');
    const pDashSpeed = document.getElementById('debug-player-dashspeed');
    const pMaxDashes = document.getElementById('debug-player-maxdashes');

    if (pDashDist) pDashDist.oninput = (e) => {
        if (window.game && window.game.player) {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 0) {
                window.game.player.baseStats.dashDistance = val;
            }
        }
    };
    if (pDashSpeed) pDashSpeed.oninput = (e) => {
        if (window.game && window.game.player) {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0) {
                window.game.player.baseStats.dashSpeed = val;
            }
        }
    };
    if (pMaxDashes) pMaxDashes.oninput = (e) => {
        if (window.game && window.game.player) {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= 5) {
                window.game.player.maxDashCharges = val;
                // Grant full charges when changing max
                window.game.player.dashCharges = val;
            }
        }
    };
    // Boss Inputs - use oninput for real-time updates
    const bSpeed = document.getElementById('debug-boss-speed');
    const bDmg = document.getElementById('debug-boss-dmg');
    const bProjSpd = document.getElementById('debug-boss-proj-spd');
    const bProjCount = document.getElementById('debug-boss-proj-count');

    if (bSpeed) bSpeed.oninput = (e) => {
        if (window.game && window.game.boss) {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0) window.game.boss.speed = val;
        }
    };
    if (bDmg) bDmg.oninput = (e) => {
        if (window.game && window.game.boss) {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0) window.game.boss.damageMultiplier = val;
        }
    };
    if (bProjSpd) bProjSpd.oninput = (e) => {
        if (window.game && window.game.boss) {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0) window.game.boss.projectileSpeedMultiplier = val;
        }
    };
    if (bProjCount) bProjCount.oninput = (e) => {
        if (window.game && window.game.boss) {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 0) window.game.boss.projectileCount = val;
        }
    };
}

function updateDebugValues() {
    if (!window.game) return;

    // Player
    if (window.game.player) {
        const p = window.game.player;
        const pSpeed = document.getElementById('debug-player-speed');
        const pDamage = document.getElementById('debug-player-damage');
        const pHealth = document.getElementById('debug-player-health');
        const pFireRate = document.getElementById('debug-player-firerate');
        const pGod = document.getElementById('debug-god-mode');
        const pDashDist = document.getElementById('debug-player-dashdist');
        const pDashSpeed = document.getElementById('debug-player-dashspeed');

        if (pSpeed) pSpeed.value = p.baseStats.speed;
        if (pDamage) pDamage.value = p.baseStats.damage;
        if (pHealth) pHealth.value = p.baseStats.maxHealth;
        if (pFireRate) pFireRate.value = p.baseStats.fireRate;
        if (pGod) pGod.checked = p.debugInvincible;
        if (pDashDist) pDashDist.value = p.baseStats.dashDistance;
        if (pDashSpeed) pDashSpeed.value = p.baseStats.dashSpeed;

        const pMaxDashes = document.getElementById('debug-player-maxdashes');
        if (pMaxDashes) pMaxDashes.value = p.maxDashCharges;
    }

    // Boss
    const bossInfo = document.getElementById('debug-boss-info');
    if (window.game.boss) {
        const b = window.game.boss;
        if (bossInfo) bossInfo.textContent = `${b.name} (HP: ${Math.round(b.health)}/${b.maxHealth})`;

        const bSpeed = document.getElementById('debug-boss-speed');
        const bDmg = document.getElementById('debug-boss-dmg');
        const bProjSpd = document.getElementById('debug-boss-proj-spd');
        const bProjCount = document.getElementById('debug-boss-proj-count');

        if (bSpeed) bSpeed.value = b.speed;
        if (bDmg) bDmg.value = b.damageMultiplier;
        if (bProjSpd) bProjSpd.value = b.projectileSpeedMultiplier;
        if (bProjCount) bProjCount.value = b.projectileCount;
    } else {
        if (bossInfo) bossInfo.textContent = "No active boss";
    }
}

function toggleGodMode(enabled) {
    if (window.game && window.game.player) {
        window.game.player.debugInvincible = enabled;
        console.log(`God Mode: ${enabled ? 'ON' : 'OFF'}`);
    }
}

// Debug functions
function debugSpawnCoins(amount) {
    try {
        const game = window.game;
        if (!game) return;

        const inventory = game.inventory;
        const ui = game.ui;

        if (inventory) {
            inventory.addCoins(amount);
            if (ui && ui.inventoryUI && ui.inventoryUI.render) {
                ui.inventoryUI.render();
            }
            alert(`Added ${amount} coins!`);
        }
    } catch (error) {
        console.error('Error spawning coins:', error);
    }
}

function debugSpawnItem(itemId) {
    try {
        const game = window.game;
        if (!game) return;

        const inventory = game.inventory;
        const ui = game.ui;
        const itemFactory = window.createItem || createItem;

        if (inventory && itemFactory) {
            const item = itemFactory(itemId);
            if (item) {
                if (inventory.addItem(item)) {
                    if (ui && ui.inventoryUI && ui.inventoryUI.render) {
                        ui.inventoryUI.render();
                    }
                    alert(`Added ${item.name}!`);
                } else {
                    alert('Inventory full!');
                }
            }
        }
    } catch (error) {
        console.error('Error spawning item:', error);
    }
}

function debugClearInventory() {
    if (confirm('Are you sure you want to clear all items from inventory?')) {
        try {
            const game = window.game;
            if (game && game.inventory) {
                game.inventory.grid = new Array(game.inventory.rows * game.inventory.cols).fill(null);
                game.inventory.clearEquipment();
                game.inventory.saveToStorage();

                if (game.ui && game.ui.inventoryUI) {
                    game.ui.inventoryUI.render();
                }
                alert('Inventory cleared!');
            }
        } catch (error) {
            console.error('Error clearing inventory:', error);
        }
    }
}

function debugResetGame() {
    if (confirm('WARNING: This will wipe ALL game progress, inventory, and stats. Are you sure?')) {
        try {
            localStorage.removeItem('nightmare_inventory');
            localStorage.removeItem('nightmare_player_stats');
            window.location.reload();
        } catch (error) {
            console.error('Error resetting game:', error);
        }
    }
}

function debugStartAtLevel() {
    const levelInput = document.getElementById('debug-start-level');
    const level = parseInt(levelInput.value) || 1;

    if (window.game) {
        window.game.debugStartLevel = level;
        window.game.startGame();
        toggleDebugMenu();
    }
}

// Make functions globally available
window.toggleDebugMenu = toggleDebugMenu;
window.switchDebugTab = switchDebugTab;
window.debugSpawnCoins = debugSpawnCoins;
window.debugSpawnItem = debugSpawnItem;
window.debugClearInventory = debugClearInventory;
window.debugResetGame = debugResetGame;
window.toggleGodMode = toggleGodMode;
window.initDebugUI = initDebugUI;
window.updateDebugValues = updateDebugValues;
window.debugStartAtLevel = debugStartAtLevel;
