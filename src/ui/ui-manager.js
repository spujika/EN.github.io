// UI Manager
class UIManager {
    constructor() {
        this.mainMenu = document.getElementById('mainMenu');
        this.gameContainer = document.getElementById('gameContainer');
        this.modifierScreen = document.getElementById('modifierScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.extractionScreen = document.getElementById('extractionScreen');
        this.inventoryScreen = document.getElementById('inventoryScreen');

        this.levelDisplay = document.getElementById('levelDisplay');
        this.bossName = document.getElementById('bossName');
        this.bossHealthBar = document.getElementById('bossHealthFill');
        this.bossHealthText = document.getElementById('bossHealthText');
        this.playerHealthFill = document.getElementById('playerHealthFill');
        this.playerHealthText = document.getElementById('playerHealthText');

        this.modifierOptions = document.getElementById('modifierOptions');
        this.finalLevel = document.getElementById('finalLevel');
        this.finalBoss = document.getElementById('finalBoss');
        this.survivalTime = document.getElementById('survivalTime');

        // Extraction UI
        this.rewardCoins = document.getElementById('rewardCoins');
        this.rewardItems = document.getElementById('rewardItems');

        // Inventory UI
        this.inventoryGrid = document.getElementById('inventoryGrid');
        this.inventoryCoinsDisplay = document.getElementById('inventoryCoinsDisplay');
        this.totalItems = document.getElementById('totalItems');
        this.inventoryValue = document.getElementById('inventoryValue');
        this.slotsUsed = document.getElementById('slotsUsed');

        // Equipment UI
        this.equipmentSlots = {};
        ['helmet', 'chest', 'weapon'].forEach(slot => {
            this.equipmentSlots[slot] = document.querySelector(`.equipment-slot[data-slot="${slot}"]`);
        });

        this.statDisplays = {
            damage: document.getElementById('statDamage'),
            defense: document.getElementById('statDefense'),
            speed: document.getElementById('statSpeed'),
            health: document.getElementById('statHealth')
        };

        // Merchant UI
        this.merchantName = document.getElementById('merchantName');
        this.merchantTimer = document.getElementById('merchantTimer');
        this.merchantIcon = document.getElementById('merchantIcon');
        this.merchantDesc = document.getElementById('merchantDesc');
        this.merchantStockGrid = document.getElementById('merchantStockGrid');

        this.inventoryUI = null;

        this.setupBossSelection();
    }

    setupBossSelection() {
        const bossIcons = document.querySelectorAll('.boss-icon');
        bossIcons.forEach(icon => {
            const bossType = icon.dataset.bossType;
            if (!bossType) return;

            // Initialize visual state based on game's availableBosses
            if (window.game && !window.game.availableBosses.includes(bossType)) {
                icon.classList.add('unselected');
            }

            // Add click handler
            icon.addEventListener('click', () => {
                // Toggle in game logic
                // We need access to the game instance. Since UI is created inside Game, 
                // we might need to pass it or access via window.game (which is set in game.js)
                if (window.game) {
                    const isActive = window.game.toggleBossAvailability(bossType);

                    // Update visual state
                    if (isActive) {
                        icon.classList.remove('unselected');
                    } else {
                        icon.classList.add('unselected');
                    }
                }
            });
        });
    }

    refreshBossIconStates(game = window.game) {
        const bossIcons = document.querySelectorAll('.boss-icon');
        bossIcons.forEach(icon => {
            const bossType = icon.dataset.bossType;
            if (!bossType) return;

            // Update visual state based on game's availableBosses
            if (game && !game.availableBosses.includes(bossType)) {
                icon.classList.add('unselected');
            } else {
                icon.classList.remove('unselected');
            }
        });
    }

    showScreen(screenName) {
        // Hide all screens
        this.mainMenu.classList.remove('active');
        this.gameContainer.classList.remove('active');
        this.modifierScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
        this.extractionScreen.classList.remove('active');
        this.inventoryScreen.classList.remove('active');

        // Show requested screen
        switch (screenName) {
            case 'menu':
                this.mainMenu.classList.add('active');
                break;
            case 'game':
                this.gameContainer.classList.add('active');
                break;
            case 'modifier':
                this.modifierScreen.classList.add('active');
                break;
            case 'gameover':
                this.gameOverScreen.classList.add('active');
                break;
            case 'extraction':
                this.extractionScreen.classList.add('active');
                break;
            case 'inventory':
                this.inventoryScreen.classList.add('active');
                if (this.inventoryUI) this.inventoryUI.render();
                break;
        }
    }

    updateHUD(level, boss, player) {
        // Update level
        this.levelDisplay.textContent = level;

        // Update boss info
        this.bossName.textContent = boss.name;
        const bossHealthPercent = (boss.health / boss.maxHealth) * 100;
        this.bossHealthBar.style.width = bossHealthPercent + '%';
        this.bossHealthText.textContent = Math.round(bossHealthPercent) + '%';

        // Update player info
        const playerHealthPercent = (player.health / player.maxHealth) * 100;
        this.playerHealthFill.style.width = playerHealthPercent + '%';
        this.playerHealthText.textContent = `${Math.round(player.health)} / ${player.maxHealth}`;

        // Update dash charges
        const dashContainer = document.getElementById('dashChargesContainer');
        if (dashContainer && player) {
            dashContainer.innerHTML = '';
            for (let i = 0; i < player.maxDashCharges; i++) {
                const charge = document.createElement('div');
                charge.className = 'dash-charge';

                if (i < player.dashCharges) {
                    charge.classList.add('full');
                } else if (i === player.dashCharges) {
                    const progress = (player.dashRechargeTimer / player.dashRechargeDuration) * 100;
                    charge.classList.add('recharging');
                    charge.style.setProperty('--recharge-progress', `${progress}%`);
                }

                dashContainer.appendChild(charge);
            }
        }

        // Update hotbar
        if (window.game && window.game.inventory) {
            this.renderHotbar(window.game.inventory);
        }
    }

    renderHotbar(inventory) {
        for (let i = 0; i < inventory.hotbar.length; i++) {
            const slot = inventory.hotbar[i];
            const slotElement = document.getElementById(`hotbarSlot${i}`);
            if (!slotElement) continue;

            const iconElement = slotElement.querySelector('.hotbar-icon');
            const quantityElement = slotElement.querySelector('.hotbar-quantity');

            if (slot.itemId && slot.quantity > 0) {
                const item = ITEMS[slot.itemId];
                if (item) {
                    iconElement.textContent = item.icon;
                    quantityElement.textContent = slot.quantity;
                    slotElement.classList.remove('empty');
                } else {
                    iconElement.textContent = '';
                    quantityElement.textContent = '';
                    slotElement.classList.add('empty');
                }
            } else {
                iconElement.textContent = '';
                quantityElement.textContent = '';
                slotElement.classList.add('empty');
            }
        }
    }

    showModifierSelection(modifiers, boss, onSelect) {
        this.modifierOptions.innerHTML = '';

        modifiers.forEach((modifier, index) => {
            const card = document.createElement('div');
            card.className = 'modifier-card';

            const valueText = modifier.value >= 1
                ? `+${modifier.value.toFixed(1)}`
                : `+${(modifier.value * 100).toFixed(0)}%`;

            // Get current value if available
            let currentText = '';
            const modifierDef = MODIFIER_TYPES[modifier.type];
            if (modifierDef && modifierDef.getCurrentValue && boss) {
                currentText = `<div class="modifier-current">${modifierDef.getCurrentValue(boss)}</div>`;
            }

            card.innerHTML = `
                <div class="modifier-icon">${modifier.icon}</div>
                <div class="modifier-name">${modifier.name}</div>
                <div class="modifier-description">${modifier.description}</div>
                <div class="modifier-value">${valueText}</div>
                ${currentText}
            `;

            card.addEventListener('click', () => onSelect(modifier));
            this.modifierOptions.appendChild(card);
        });

        this.showScreen('modifier');
    }

    showExtraction(reward, onExtract, onContinue, currentLevel) {
        this.rewardCoins.textContent = `💰 ${reward.coins}`;
        this.rewardItems.innerHTML = '';

        reward.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.style.position = 'relative'; // Override absolute from CSS
            itemEl.style.width = '60px';
            itemEl.style.height = '60px';

            const rarity = RARITY[item.rarity];
            itemEl.style.borderColor = rarity.color;
            itemEl.style.background = `linear-gradient(135deg, ${rarity.glow}, rgba(0,0,0,0.8))`;

            itemEl.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                ${item.stackable ? `<div class="item-quantity">${item.quantity}</div>` : ''}
            `;

            this.rewardItems.appendChild(itemEl);
        });

        // Update Level Info
        const nextLevel = currentLevel + 1;
        const nextLevelDisplay = document.getElementById('nextLevelDisplay');
        const mechanicWarning = document.getElementById('mechanicWarning');

        if (nextLevelDisplay) {
            nextLevelDisplay.textContent = `Next Level: ${nextLevel}`;
        }

        if (mechanicWarning) {
            // Warn if next level unlocks a new ability (every 5 levels)
            // Level 5, 10, 15, 20...
            if (nextLevel % 5 === 0) {
                mechanicWarning.style.display = 'block';
                mechanicWarning.textContent = "The nightmare stirs and gains new knowledge...";
            } else {
                mechanicWarning.style.display = 'none';
            }
        }

        // Setup buttons
        const extractBtn = document.getElementById('extractBtn');
        const continueBtn = document.getElementById('continueBtn');

        // Remove old listeners
        const newExtractBtn = extractBtn.cloneNode(true);
        const newContinueBtn = continueBtn.cloneNode(true);
        extractBtn.parentNode.replaceChild(newExtractBtn, extractBtn);
        continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);

        newExtractBtn.addEventListener('click', onExtract);
        newContinueBtn.addEventListener('click', onContinue);

        this.showScreen('extraction');
    }

    initInventory(inventory, player, merchantManager) {
        if (!this.inventoryUI) {
            this.inventoryUI = new InventoryUI(inventory);
            this.inventoryUI.initialize(this.inventoryGrid, this.inventoryCoinsDisplay);
        } else {
            this.inventoryUI.inventory = inventory;
            this.inventoryUI.render();
        }

        // Pass merchant manager to inventory UI for context menu checks
        this.inventoryUI.merchantManager = merchantManager;

        // Merchant UI Setup
        if (merchantManager) {
            // Subscribe to merchant rotation
            merchantManager.subscribe((merchant) => {
                this.updateMerchantUI(merchant);
            });

            // Initial update
            if (merchantManager.currentMerchant) {
                this.updateMerchantUI(merchantManager.currentMerchant);
            }

            // Update timer loop
            setInterval(() => {
                if (this.inventoryScreen.classList.contains('active')) {
                    const remaining = merchantManager.getTimeRemaining();
                    const minutes = Math.floor(remaining / 60000);
                    const seconds = Math.floor((remaining % 60000) / 1000);
                    this.merchantTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            }, 1000);
        }

        // Equipment slot listeners
        Object.entries(this.equipmentSlots).forEach(([slot, element]) => {
            // Remove old listeners (cloning)
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            this.equipmentSlots[slot] = newElement;

            newElement.addEventListener('click', () => {
                if (inventory.unequipItem(slot)) {
                    this.inventoryUI.render();
                    this.updateEquipment(inventory);
                    if (player) this.updatePlayerStats(player);
                }
            });
        });

        // Hotbar slot listeners
        for (let i = 0; i < 2; i++) {
            const slotEl = document.querySelector(`.hotbar-equipment-slot[data-hotbar-slot="${i}"]`);
            if (slotEl) {
                // Remove old listeners
                const newSlotEl = slotEl.cloneNode(true);
                slotEl.parentNode.replaceChild(newSlotEl, slotEl);

                newSlotEl.addEventListener('click', () => {
                    if (inventory.removeFromHotbar(i)) {
                        this.inventoryUI.render();
                        this.updateEquipment(inventory);
                    } else {
                        // Optional: Show message if inventory full
                        console.log('Could not unequip hotbar item (Inventory full?)');
                    }
                });
            }
        }

        // Update stats
        this.updateInventoryStats(inventory);
        this.updateEquipment(inventory);
        if (player) this.updatePlayerStats(player);

        // Hook into render to update stats
        const originalRender = this.inventoryUI.render.bind(this.inventoryUI);
        this.inventoryUI.render = () => {
            originalRender();
            this.updateInventoryStats(inventory);
            this.updateEquipment(inventory);
            if (player) this.updatePlayerStats(player);
        };
    }

    updateInventoryStats(inventory) {
        const items = inventory.getAllItemsGlobal();
        this.totalItems.textContent = items.length;
        this.inventoryValue.textContent = `${inventory.getTotalValue()} 💰`;

        const usedSlots = inventory.getGlobalSlotsUsed();
        const totalSlots = inventory.getGlobalTotalSlots();
        this.slotsUsed.textContent = `${usedSlots} / ${totalSlots}`;
    }

    showGameOver(level, bossName, survivalTime, modifierSummary) {
        this.finalLevel.textContent = level;
        this.finalBoss.textContent = bossName;

        const minutes = Math.floor(survivalTime / 60);
        const seconds = survivalTime % 60;
        this.survivalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Display modifier summary
        const modifierSummaryEl = document.getElementById('modifierSummary');
        const modifierSummarySection = document.getElementById('modifierSummarySection');

        if (modifierSummary && Object.keys(modifierSummary).length > 0) {
            modifierSummarySection.style.display = 'block';
            modifierSummaryEl.innerHTML = '';

            Object.entries(modifierSummary).forEach(([type, data]) => {
                const item = document.createElement('div');
                item.className = 'modifier-summary-item';

                const modifierDef = MODIFIER_TYPES[type];
                const valueText = data.totalValue >= 1
                    ? `+${data.totalValue.toFixed(1)}`
                    : `+${(data.totalValue * 100).toFixed(0)}%`;

                item.innerHTML = `
                    <div class="modifier-summary-icon">${modifierDef.icon}</div>
                    <div class="modifier-summary-text">
                        <div class="modifier-summary-name">${data.name}</div>
                        <div class="modifier-summary-count">x${data.count} - ${valueText}</div>
                    </div>
                `;

                modifierSummaryEl.appendChild(item);
            });
        } else {
            modifierSummarySection.style.display = 'none';
        }

        this.showScreen('gameover');
    }

    updateEquipment(inventory) {
        Object.entries(inventory.equipment).forEach(([slot, item]) => {
            const element = this.equipmentSlots[slot];
            if (!element) return;

            const placeholder = slot === 'helmet' ? '⛑️' : slot === 'chest' ? '🛡️' : '⚔️';

            if (item) {
                element.innerHTML = `
                    <div class="item-icon" style="font-size: 2.5rem">${item.icon}</div>
                    <div class="slot-label">${item.name}</div>
                `;
                element.classList.add('equipped');

                // Add tooltip
                if (this.inventoryUI && this.inventoryUI.getItemTooltip) {
                    element.title = this.inventoryUI.getItemTooltip(item);
                }
            } else {
                element.innerHTML = `
                    <div class="slot-placeholder">${placeholder}</div>
                    <div class="slot-label">${slot.charAt(0).toUpperCase() + slot.slice(1)}</div>
                `;
                element.classList.remove('equipped');
                element.title = '';
            }
        });

        // Update hotbar slots in equipment panel
        for (let i = 0; i < 2; i++) {
            const slotEl = document.querySelector(`.hotbar-equipment-slot[data-hotbar-slot="${i}"]`);
            if (!slotEl) continue;

            const slotData = inventory.hotbar[i];

            if (slotData && slotData.itemId && slotData.quantity > 0) {
                const item = ITEMS[slotData.itemId];
                if (item) {
                    slotEl.innerHTML = `
                        <div class="item-icon" style="font-size: 1.5rem">${item.icon}</div>
                        <div class="slot-label" style="font-size: 0.7rem">Slot ${i + 1}</div>
                        <div class="item-quantity" style="position: absolute; bottom: 2px; right: 2px; font-size: 0.8rem; font-weight: bold; color: #fff; text-shadow: 0 0 2px #000;">${slotData.quantity}</div>
                    `;
                    slotEl.classList.add('equipped');
                    slotEl.title = `${item.name}\nQuantity: ${slotData.quantity}`;
                }
            } else {
                slotEl.innerHTML = `
                    <div class="slot-placeholder" style="font-size: 1.2rem">${i + 1}</div>
                    <div class="slot-label" style="font-size: 0.7rem">Slot ${i + 1}</div>
                `;
                slotEl.classList.remove('equipped');
                slotEl.title = '';
            }
        }
    }

    updatePlayerStats(player) {
        if (!player.baseStats) return;

        const base = player.baseStats;
        const bonus = player.inventory.getEquippedStats();

        const updateStat = (id, baseVal, bonusVal) => {
            const el = this.statDisplays[id];
            if (el) {
                const valEl = el.querySelector('.stat-val');
                // Format: Base (+Bonus)
                valEl.innerHTML = `${baseVal} <span class="bonus-val">(+${bonusVal})</span>`;
            }
        };

        updateStat('damage', base.damage, bonus.damage || 0);
        updateStat('defense', base.defense, bonus.defense || 0);
        updateStat('speed', base.speed, bonus.speed || 0);
        updateStat('health', base.maxHealth, bonus.health || 0);
    }

    showExtractionInventory(extractedItems) {
        console.log('showExtractionInventory called with', extractedItems.length, 'items');

        this.showScreen('inventory');

        const container = document.querySelector('.inventory-container');
        container.classList.add('extraction-mode');

        const extractionPool = document.querySelector('.extraction-pool');
        const extractionItemsGrid = document.getElementById('extractionItemsGrid');
        const extractionCoinsDisplay = document.getElementById('extractionCoinsDisplay');
        const takeAllBtn = document.getElementById('takeAllBtn');
        const doneManagingBtn = document.getElementById('doneManagingBtn');

        // Make extraction pool visible
        if (extractionPool) {
            extractionPool.style.display = 'flex';

            // Add pulsing glow effect
            extractionPool.classList.add('pulsing-glow');

            // Remove glow on interaction
            const removeGlow = () => {
                extractionPool.classList.remove('pulsing-glow');
                extractionPool.removeEventListener('mouseover', removeGlow);
                extractionPool.removeEventListener('click', removeGlow);
            };

            extractionPool.addEventListener('mouseover', removeGlow);
            extractionPool.addEventListener('click', removeGlow);
        }

        this.extractedItems = [...extractedItems];

        if (extractionCoinsDisplay) {
            extractionCoinsDisplay.textContent = game.extractedCoins || 0;
        }

        this.renderExtractionPool();

        // Take All button
        if (takeAllBtn) {
            takeAllBtn.onclick = () => {
                this.extractedItems.forEach((item, index) => {
                    const itemElement = extractionItemsGrid.children[index];
                    if (itemElement && !itemElement.classList.contains('taken')) {
                        if (game.inventory.addItem(item)) {
                            itemElement.classList.add('taken');
                        }
                    }
                });
                this.inventoryUI.render();

                // Auto close after take all
                setTimeout(() => {
                    const doneBtn = document.getElementById('doneManagingBtn');
                    if (doneBtn) doneBtn.click();
                }, 500);
            };
        }

        // Done Managing button
        if (doneManagingBtn) {
            doneManagingBtn.onclick = () => {
                container.classList.remove('extraction-mode');
                if (extractionPool) extractionPool.style.display = 'none';
                game.extractedItems = [];
                game.state = 'inventory';
                game.inventory.saveToStorage();
                this.inventoryUI.render();
            };
        }
    }

    renderExtractionPool() {
        const extractionItemsGrid = document.getElementById('extractionItemsGrid');
        if (!extractionItemsGrid) return;

        extractionItemsGrid.innerHTML = '';

        this.extractedItems.forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'extraction-item inventory-item';
            itemDiv.style.borderColor = item.rarity === 'legendary' ? '#ff8c00' :
                item.rarity === 'rare' ? '#9370db' :
                    item.rarity === 'uncommon' ? '#00ff88' : '#888';
            itemDiv.style.background = item.rarity === 'legendary' ? 'linear-gradient(135deg, rgba(255,140,0,0.2), rgba(255,69,0,0.2))' :
                item.rarity === 'rare' ? 'linear-gradient(135deg, rgba(147,112,219,0.2), rgba(138,43,226,0.2))' :
                    item.rarity === 'uncommon' ? 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,200,100,0.2))' :
                        'rgba(255,255,255,0.05)';

            itemDiv.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                ${item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ''}
            `;

            itemDiv.onclick = () => {
                if (itemDiv.classList.contains('taken')) return;

                if (game.inventory.addItem(item)) {
                    itemDiv.classList.add('taken');
                    this.inventoryUI.render();

                    // Check if all items are taken
                    const allTaken = Array.from(extractionItemsGrid.children).every(child =>
                        child.classList.contains('taken')
                    );

                    if (allTaken) {
                        setTimeout(() => {
                            const doneBtn = document.getElementById('doneManagingBtn');
                            if (doneBtn) doneBtn.click();
                        }, 500); // Small delay for better UX
                    }
                } else {
                    alert('Inventory is full! Destroy items to make space.');
                }
            };

            extractionItemsGrid.appendChild(itemDiv);
        });
    }

    updateMerchantUI(merchants) {
        const container = document.getElementById('vendorSection') || document.querySelector('.vendor-section');
        if (!container) return;

        // If passing a single merchant (legacy call), wrap in array
        if (!Array.isArray(merchants)) {
            merchants = [merchants];
        }

        // Clear container if it doesn't have the new structure yet
        if (!container.querySelector('.merchant-list')) {
            container.innerHTML = '<div class="merchant-list"></div>';
        }

        const list = container.querySelector('.merchant-list');
        list.innerHTML = '';

        merchants.forEach(merchant => {
            if (!merchant) return;

            const card = document.createElement('div');
            card.className = 'merchant-card collapsed';

            // Header (Collapsible)
            const header = document.createElement('div');
            header.className = 'merchant-header';

            let timerHtml = '';
            if (merchant.type.id !== 'banker') {
                const remaining = game.merchantManager.getTimeRemaining();
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                timerHtml = `<div class="merchant-timer" data-timer="true">⟳ ${minutes}:${seconds.toString().padStart(2, '0')}</div>`;
            }

            header.innerHTML = `
                <div class="merchant-info">
                    <div class="merchant-icon">${merchant.type.icon}</div>
                    <div class="merchant-name">${merchant.name}</div>
                </div>
                ${timerHtml}
                <div class="collapse-icon">▼</div>
            `;

            // Content (Stock)
            const content = document.createElement('div');
            content.className = 'merchant-content';

            // Description
            const desc = document.createElement('p');
            desc.className = 'merchant-desc';
            desc.textContent = merchant.type.description;
            content.appendChild(desc);

            // Stock Grid
            const grid = document.createElement('div');
            grid.className = 'merchant-grid';

            merchant.stock.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'merchant-item';

                const rarity = RARITY[item.rarity];
                itemEl.style.borderColor = rarity.color;
                itemEl.style.background = `linear-gradient(135deg, ${rarity.glow}, rgba(0,0,0,0.8))`;

                // Check if player can afford
                const canAfford = game.inventory.getCoinCount() >= item.price;
                if (!canAfford) itemEl.classList.add('too-expensive');

                itemEl.innerHTML = `
                    <div class="item-icon">${item.icon}</div>
                    ${item.quantity && item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ''}
                    <div class="item-price">💰 ${item.price}</div>
                `;

                // Tooltip
                itemEl.title = `${item.name}\n${rarity.name}\n${item.description}\nPrice: ${item.price} coins`;

                itemEl.onclick = () => {
                    // Handle special upgrade items
                    if (item.type === 'upgrade') {
                        if (item.id === 'ROW_EXPANSION') {
                            if (game.inventory.removeCoins(item.price)) {
                                if (game.inventory.purchaseRow()) {
                                    this.inventoryUI.render();
                                    this.updateMerchantUI(merchants); // Re-render to update stock
                                    alert(`Inventory expanded! Now ${game.inventory.rows} rows (${game.inventory.totalSlots} slots)`);
                                } else {
                                    game.inventory.addCoins(item.price); // Refund
                                    alert('Cannot expand inventory further!');
                                }
                            } else {
                                alert('Not enough coins!');
                            }
                            return;
                        }

                        if (item.id === 'PAGE_EXPANSION') {
                            if (game.inventory.removeCoins(item.price)) {
                                if (game.inventory.purchasePage()) {
                                    this.inventoryUI.render();
                                    this.updateMerchantUI(merchants);
                                    alert(`New inventory page purchased! Total pages: ${game.inventory.getPageCount()}`);
                                } else {
                                    game.inventory.addCoins(item.price);
                                    alert('Cannot purchase more pages!');
                                }
                            } else {
                                alert('Not enough coins!');
                            }
                            return;
                        }
                    }

                    // Normal item purchase
                    if (game.inventory.removeCoins(item.price)) {
                        // Create a copy of the item for the player
                        const boughtItem = { ...item, instanceId: Date.now() + Math.random() };
                        delete boughtItem.price; // Remove price property from player's copy

                        if (game.inventory.addItem(boughtItem)) {
                            // Success
                            merchant.removeItemFromStock(item.instanceId);
                            this.inventoryUI.render();
                            this.updateMerchantUI(merchants); // Re-render
                        } else {
                            // Inventory full, refund
                            game.inventory.addCoins(item.price);
                            alert('Inventory Full!');
                        }
                    } else {
                        alert('Not enough coins!');
                    }
                };

                grid.appendChild(itemEl);
            });

            content.appendChild(grid);
            card.appendChild(header);
            card.appendChild(content);

            // Toggle logic
            header.onclick = () => {
                card.classList.toggle('collapsed');
            };

            list.appendChild(card);
        });

        // Update merchant timers every second
        if (!this.merchantTimerInterval) {
            this.merchantTimerInterval = setInterval(() => {
                const timerElements = document.querySelectorAll('.merchant-timer[data-timer="true"]');
                timerElements.forEach(timerEl => {
                    const remaining = game.merchantManager.getTimeRemaining();
                    const minutes = Math.floor(remaining / 60000);
                    const seconds = Math.floor((remaining % 60000) / 1000);
                    timerEl.textContent = `⟳ ${minutes}:${seconds.toString().padStart(2, '0')}`;
                });
            }, 1000);
        }
    }
}
