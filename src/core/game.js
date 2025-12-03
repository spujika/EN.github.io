// Main Game Engine
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Systems
        this.ui = new UIManager();
        this.inventory = new Inventory();

        // Test items removed


        this.rewardGenerator = new RewardGenerator();
        this.modifierManager = new ModifierManager();
        this.merchantManager = new MerchantManager(this.level, this.inventory);

        // Initialize Player immediately so UI has stats to read
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2, this.canvas);
        this.player.setInventory(this.inventory);

        // Initialize Inventory UI with player and merchant manager
        this.ui.initInventory(this.inventory, this.player, this.merchantManager);

        // Game State
        this.state = 'menu'; // menu, playing, extraction, selecting_modifier, gameover, inventory
        this.level = 1;
        this.score = 0;
        this.startTime = 0;
        this.survivalTime = 0;
        this.currentBossType = null; // Store boss type for the run

        // Boss Selection
        this.availableBosses = ['CrimsonReaper', 'VoidSorcerer', 'IronColossus', 'SwarmQueen', 'ChaosPhantom'];

        // Current Run Rewards
        this.currentReward = null;

        // Entities
        this.boss = null;
        this.projectiles = [];
        this.particles = [];

        // Boss contact damage cooldown (in milliseconds)
        this.bossContactDamageCooldown = 0;

        // Input
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        this.shiftPressed = false;
        this.debugPaused = false;

        this.resize();
        this.setupEventListeners();

        // Start loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);

        // Show menu initially
        this.ui.showScreen('menu');

        // Initialize Debug UI
        if (window.initDebugUI) {
            window.initDebugUI();
        }
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.resize());

        // Input handling - normalize to lowercase
        window.addEventListener('keydown', e => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
        });

        window.addEventListener('keyup', e => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            delete this.keys[key]; // Also delete it to be sure
        });

        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', () => this.isMouseDown = true);
        this.canvas.addEventListener('mouseup', () => this.isMouseDown = false);

        // UI Buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('returnMenuBtn').addEventListener('click', () => this.returnToMenu());

        // Inventory Buttons
        document.getElementById('inventoryBtn').addEventListener('click', () => {
            this.state = 'inventory';
            this.ui.showScreen('inventory');
        });

        document.getElementById('closeInventoryBtn').addEventListener('click', () => {
            this.state = 'menu';
            this.ui.showScreen('menu');
        });

        document.getElementById('enterNightmareFromInventory').addEventListener('click', () => {
            this.startGame();
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    startGame() {
        console.log('startGame called');
        this.level = this.debugStartLevel || 1;
        this.debugStartLevel = null; // Reset
        this.score = 0;
        this.startTime = Date.now();
        this.projectiles = [];
        this.particles = [];
        this.modifierManager.reset();
        this.currentBossType = null; // Reset boss type for new run

        // Reset rewards
        this.currentReward = { coins: 0, items: [] };

        //Clear extraction pool (items lost)
        this.extractedItems = [];
        this.extractedCoins = 0;

        // Reset Player for new run
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2, this.canvas);
        this.player.setInventory(this.inventory);

        // Re-init UI with new player instance
        this.ui.initInventory(this.inventory, this.player, this.merchantManager);

        this.spawnBoss();
        this.state = 'playing';
        this.isMouseDown = false; // Reset mouse state  
        this.ui.showScreen('game');
    }

    spawnBoss() {
        // If no boss type selected yet, pick one randomly from AVAILABLE bosses and store it
        if (!this.currentBossType) {
            // Filter bosses based on selection
            // Note: createRandomBoss needs to be updated or we handle selection here
            // Since createRandomBoss is a global function (likely in boss.js), we might need to pass the list
            // Or we can just pick a type here and instantiate it.

            // Let's look at how createRandomBoss works. It probably picks from a hardcoded list.
            // We should override that behavior.

            if (this.availableBosses.length === 0) {
                // Fallback if nothing selected (should be prevented by UI but just in case)
                this.availableBosses = ['CrimsonReaper', 'VoidSorcerer', 'IronColossus', 'SwarmQueen', 'ChaosPhantom'];
            }

            const randomBossName = this.availableBosses[Math.floor(Math.random() * this.availableBosses.length)];

            // Map name to class - assuming classes are globally available
            // We need to know the mapping. Based on boss.js (assumed), classes are likely:
            // CrimsonReaper, VoidSorcerer, IronColossus, SwarmQueen, ChaosPhantom

            switch (randomBossName) {
                case 'CrimsonReaper': this.boss = new CrimsonReaper(this.canvas.width / 2, this.canvas.height / 4, this.canvas); break;
                case 'VoidSorcerer': this.boss = new VoidSorcerer(this.canvas.width / 2, this.canvas.height / 4, this.canvas); break;
                case 'IronColossus': this.boss = new IronColossus(this.canvas.width / 2, this.canvas.height / 4, this.canvas); break;
                case 'SwarmQueen': this.boss = new SwarmQueen(this.canvas.width / 2, this.canvas.height / 4, this.canvas); break;
                case 'ChaosPhantom': this.boss = new ChaosPhantom(this.canvas.width / 2, this.canvas.height / 4, this.canvas); break;
                default: this.boss = new CrimsonReaper(this.canvas.width / 2, this.canvas.height / 4, this.canvas);
            }

            this.currentBossType = this.boss.constructor; // Store the boss class
        } else {
            // Use the stored boss type for consistency throughout the run
            const canvas = { width: this.canvas.width, height: this.canvas.height };
            this.boss = new this.currentBossType(this.canvas.width / 2, this.canvas.height / 4, canvas);
        }

        // Set level scaling (Apply to ALL bosses)
        // REMOVED per user request: Stats do not increase by level, only by modifiers
        this.boss.health = this.boss.maxHealth;

        // Unlock abilities based on level
        this.boss.unlockAbilities(this.level);

        // Apply active modifiers
        this.modifierManager.applyModifiers(this.boss);

        // Show boss entry effect
        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(
                this.boss.x, this.boss.y,
                '#8a2be2',
                5
            ));
        }
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        // Update Debug Values
        const debugMenu = document.getElementById('debugMenu');
        if (window.updateDebugValues && debugMenu && debugMenu.style.display !== 'none') {
            window.updateDebugValues();
        }

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Update merchant timer regardless of state
        this.merchantManager.update(this.level);

        if (this.state !== 'playing' || this.debugPaused) return; // ADD debugPaused check

        // Cap delta time to prevent huge jumps (e.g., if tab was inactive)
        const cappedDelta = Math.min(deltaTime, 100);
        const dt = cappedDelta / 1000; // Convert to seconds

        // Update entities
        // Always read keys, even during dash (so we capture releases)
        this.player.moveUp = this.keys['w'] || false;
        this.player.moveDown = this.keys['s'] || false;
        this.player.moveLeft = this.keys['a'] || false;
        this.player.moveRight = this.keys['d'] || false;

        // Handle dash - only trigger on key press, not hold
        if (this.keys['shift'] && !this.shiftPressed) {
            this.player.dash();
            this.shiftPressed = true;
        } else if (!this.keys['shift']) {
            this.shiftPressed = false;
        }

        // Hotbar consumption - keys 1 and 2
        if (this.keys['1']) {
            this.inventory.consumeFromHotbar(0, this.player);
            delete this.keys['1']; // Prevent spamming
        }
        if (this.keys['2']) {
            this.inventory.consumeFromHotbar(1, this.player);
            delete this.keys['2']; // Prevent spamming
        }

        this.player.update(this.mouseX, this.mouseY, this.isMouseDown, this.projectiles, cappedDelta); // Player uses ms for some things, check this later
        this.boss.update(this.player, this.projectiles, this.level, this.particles, dt);

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(this.canvas, dt);

            // Remove if out of bounds or inactive
            if (proj.x < 0 || proj.x > this.canvas.width ||
                proj.y < 0 || proj.y > this.canvas.height ||
                !proj.active) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Collision detection
            if (proj.owner === 'player') {
                // Player hit boss
                const dx = proj.x - this.boss.x;
                const dy = proj.y - this.boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.boss.size + proj.size) {
                    // Hit!
                    if (this.boss.takeDamage(proj.damage, this.particles)) {
                        this.bossDefeated();
                    }

                    // Create impact particles
                    for (let j = 0; j < 5; j++) {
                        this.particles.push(new Particle(
                            proj.x, proj.y,
                            proj.color,
                            3
                        ));
                    }

                    this.projectiles.splice(i, 1);
                    continue; // Skip to next projectile
                }

                // Check collision with boss sub-parts (e.g., Shield Generators, Clones)
                if (this.boss.checkProjectileCollision) {
                    const result = this.boss.checkProjectileCollision(proj);
                    if (result) {
                        // Projectile handled by sub-part
                        this.projectiles.splice(i, 1);

                        if (result === 'fake_clone_hit') {
                            // Punish player for hitting fake clone
                            this.projectiles.push(new ExplodingProjectile(
                                proj.x, proj.y, 0, 0,
                                20, 'boss', '#ff00ff' // Enemy explosion
                            ));
                            this.projectiles[this.projectiles.length - 1].explode();
                        }
                        continue;
                    }
                }

                // Player hit minions (Swarm Queen)
                if (this.boss.minions && this.boss.minions.length > 0) {
                    for (let m = this.boss.minions.length - 1; m >= 0; m--) {
                        const minion = this.boss.minions[m];
                        const mdx = proj.x - minion.x;
                        const mdy = proj.y - minion.y;
                        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                        if (mdist < minion.size + proj.size) {
                            // Hit minion!
                            minion.health -= proj.damage;

                            // Create impact particles
                            for (let j = 0; j < 3; j++) {
                                this.particles.push(new Particle(
                                    proj.x, proj.y,
                                    '#ffd700',
                                    2
                                ));
                            }

                            // Remove minion if dead
                            if (minion.health <= 0) {
                                this.boss.minions.splice(m, 1);
                                // Spawn death particles
                                for (let j = 0; j < 8; j++) {
                                    this.particles.push(new Particle(
                                        minion.x, minion.y,
                                        '#9b870c',
                                        4
                                    ));
                                }
                            }

                            this.projectiles.splice(i, 1);
                            break; // Projectile destroyed, exit minion loop
                        }
                    }
                }
            } else {
                // Boss hit player
                const dx = proj.x - this.player.x;
                const dy = proj.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.player.size + proj.size) {
                    if (this.player.takeDamage(proj.damage, this.particles)) {
                        this.playerDied();
                    }

                    // Remove projectile after hit (most boss projectiles are not piercing)
                    this.projectiles.splice(i, 1);
                }
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update boss contact damage cooldown
        if (this.bossContactDamageCooldown > 0) {
            this.bossContactDamageCooldown -= cappedDelta;
        }

        // Check player collision with boss
        const dx = this.player.x - this.boss.x;
        const dy = this.player.y - this.boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.player.size + this.boss.size) {
            // Only apply contact damage if cooldown expired (1 damage per second)
            if (this.bossContactDamageCooldown <= 0) {
                if (this.player.takeDamage(this.boss.contactDamage, this.particles)) {
                    this.playerDied();
                }
                this.bossContactDamageCooldown = 250; // Reset to 0.25 seconds (4 hits/sec)
            }
        }

        this.ui.updateHUD(this.level, this.boss, this.player);
    }

    draw() {
        // Clear screen
        this.ctx.fillStyle = '#0f0520';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.particles.forEach(p => p.draw(this.ctx));

        if (this.state === 'playing' || this.state === 'extraction' || this.state === 'selecting_modifier') {
            // Draw boss
            if (this.boss) {
                this.boss.draw(this.ctx);
            }

            // Draw projectiles
            this.projectiles.forEach(p => p.draw(this.ctx));

            // Draw player
            if (this.player) {
                this.player.draw(this.ctx);
            }

            // Draw special effects
            if (this.boss instanceof ChaosPhantom && this.boss.controlsInverted) {
                this.ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        // Draw controls inverted message
        if (this.boss instanceof ChaosPhantom && this.boss.controlsInverted) {
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.font = '30px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CONTROLS INVERTED!', this.canvas.width / 2, 100);
        }
    }

    bossDefeated() {
        this.state = 'extraction';

        // Generate rewards for this level
        const newReward = this.rewardGenerator.generateReward(this.level);

        // Accumulate rewards
        this.currentReward.coins += newReward.coins;
        this.currentReward.items = [...this.currentReward.items, ...newReward.items];

        // Show extraction screen
        this.ui.showExtraction(
            this.currentReward,
            () => this.handleExtract(),
            () => this.handleContinue(),
            this.level
        );
    }

    handleExtract() {
        // Convert coins to coin items
        const coinItems = [];
        let remainingCoins = this.currentReward.coins;
        while (remainingCoins > 0) {
            const stackSize = Math.min(remainingCoins, 99);
            coinItems.push(createItem('coins', stackSize));
            remainingCoins -= stackSize;
        }

        // Combine all items (regular items + coin items)
        this.extractedItems = [...this.currentReward.items, ...coinItems];
        this.extractedCoins = this.currentReward.coins; // Keep for display

        // Show inventory screen in extraction mode
        this.state = 'extraction_inventory';
        this.ui.showExtractionInventory(this.extractedItems);
    }

    handleContinue() {
        this.state = 'selecting_modifier';

        const modifiers = this.modifierManager.getRandomModifiers(this.level);
        this.ui.showModifierSelection(modifiers, this.boss, (selectedModifier) => {
            this.modifierManager.addModifier(selectedModifier);
            this.nextLevel();
        });
    }

    nextLevel() {
        this.level++;
        this.projectiles = []; // Clear projectiles from previous level
        this.particles = [];   // Clear particles from previous level
        this.player.heal(20); // Heal player slightly
        this.spawnBoss();
        this.state = 'playing';
        this.isMouseDown = false; // Reset mouse state
        this.ui.showScreen('game');
    }

    playerDied() {
        this.state = 'gameover';
        this.survivalTime = Math.floor((Date.now() - this.startTime) / 1000);

        // Lost all rewards!
        this.currentReward = null;

        // Death Penalty: Lose equipped items
        this.inventory.clearEquipment();
        this.inventory.clearHotbar();
        this.ui.updateEquipment(this.inventory);

        const modifierSummary = this.modifierManager.getModifierSummary();
        this.ui.showGameOver(this.level, this.boss.name, this.survivalTime, modifierSummary);
    }

    returnToMenu() {
        this.state = 'menu';
        this.ui.showScreen('menu');
    }

    toggleBossAvailability(bossType) {
        const index = this.availableBosses.indexOf(bossType);
        if (index === -1) {
            this.availableBosses.push(bossType);
            return true; // Added
        } else {
            // Don't allow removing the last boss
            if (this.availableBosses.length <= 1) return true; // Kept (treated as active)

            this.availableBosses.splice(index, 1);
            return false; // Removed
        }
    }
}

// Start game when page loads
window.onload = () => {
    window.game = new Game();
};

// Prevent default context menu globally (for Firefox and other browsers)
document.oncontextmenu = function () {
    return false;
};

window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
}, false);
