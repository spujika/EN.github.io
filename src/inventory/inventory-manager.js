// Grid-based Inventory System
class Inventory {
    constructor(cols = 10, rows = 5) {
        this.cols = cols;
        this.rows = rows;
        this.purchasedRows = 0; // Additional rows purchased (max 5 for total of 10)
        this.MAX_ROWS = 10;
        this.MAX_PAGES = 3;

        // Multi-page support
        this.pages = []; // Array of { grid, rows, purchasedRows }
        this.activePageIndex = 0;

        this.totalSlots = cols * rows;
        this.grid = new Array(this.totalSlots).fill(null);
        this.equipment = {
            helmet: null,
            chest: null,
            weapon: null
        };

        // Hotbar for consumables (2 slots, expandable later)
        this.hotbar = [
            { itemId: null, quantity: 0 },
            { itemId: null, quantity: 0 }
        ];
        this.HOTBAR_MAX_STACK = 10;

        this.loadFromStorage();

        // Ensure at least one page exists if load failed or was empty
        if (this.pages.length === 0) {
            this.pages.push({
                grid: this.grid,
                rows: this.rows,
                purchasedRows: this.purchasedRows
            });
        }
    }

    // Save/Load
    saveToStorage() {
        // Sync current state to active page before saving
        if (this.pages && this.pages[this.activePageIndex]) {
            this.pages[this.activePageIndex] = {
                grid: this.grid,
                rows: this.rows,
                purchasedRows: this.purchasedRows
            };
        }

        const data = {
            pages: this.pages,
            activePageIndex: this.activePageIndex,
            equipment: this.equipment
        };
        localStorage.setItem('nightmare_inventory', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('nightmare_inventory');
        if (saved) {
            const data = JSON.parse(saved);

            this.equipment = data.equipment || this.equipment;

            // Handle multi-page data
            if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
                this.pages = data.pages;
                this.activePageIndex = data.activePageIndex || 0;
                this.loadPage(this.activePageIndex);
            } else {
                // Migration: Convert single page save to pages structure
                let grid = data.grid || this.grid;
                let purchasedRows = data.purchasedRows || 0;
                let rows = 5 + purchasedRows;

                // Check for old 10x6 save migration
                if (!data.purchasedRows && grid.length === 60) {
                    const hasItemsInRow6 = grid.slice(50, 60).some(item => item !== null);
                    if (hasItemsInRow6) {
                        purchasedRows = 1;
                        rows = 6;
                        console.log('Migration: Granted 1 free row expansion for existing save');
                    }
                }

                // Ensure grid size matches
                const totalSlots = this.cols * rows;
                if (grid.length !== totalSlots) {
                    const newGrid = new Array(totalSlots).fill(null);
                    for (let i = 0; i < Math.min(grid.length, totalSlots); i++) {
                        newGrid[i] = grid[i];
                    }
                    grid = newGrid;
                }

                // Create first page
                this.pages = [{
                    grid: grid,
                    rows: rows,
                    purchasedRows: purchasedRows
                }];
                this.activePageIndex = 0;
                this.loadPage(0);
            }
        } else {
            // Initialize default page if no save
            this.pages = [{
                grid: new Array(50).fill(null),
                rows: 5,
                purchasedRows: 0
            }];
            this.loadPage(0);
        }
    }

    loadPage(index) {
        if (index < 0 || index >= this.pages.length) index = 0;

        const page = this.pages[index];
        this.activePageIndex = index;

        this.grid = page.grid;
        this.rows = page.rows;
        this.purchasedRows = page.purchasedRows;
        this.totalSlots = this.cols * this.rows;
    }

    clearStorage() {
        localStorage.removeItem('nightmare_inventory');
        this.grid = new Array(this.totalSlots).fill(null);
        this.equipment = {
            helmet: null,
            chest: null,
            weapon: null
        };
    }

    // Row Expansion Methods
    canPurchaseRow() {
        return this.rows < this.MAX_ROWS;
    }

    purchaseRow() {
        if (!this.canPurchaseRow()) return false;

        this.purchasedRows++;
        this.rows++;
        const newTotalSlots = this.cols * this.rows;

        // Expand grid
        const newGrid = new Array(newTotalSlots).fill(null);
        for (let i = 0; i < this.grid.length; i++) {
            newGrid[i] = this.grid[i];
        }
        this.grid = newGrid;
        this.totalSlots = newTotalSlots;

        // Update current page data
        if (this.pages && this.pages[this.activePageIndex]) {
            this.pages[this.activePageIndex] = {
                grid: this.grid,
                rows: this.rows,
                purchasedRows: this.purchasedRows
            };
        }

        this.saveToStorage();
        return true;
    }

    getPurchasedRows() {
        return this.purchasedRows;
    }

    // Page Management Methods
    getPageCount() {
        return this.pages ? this.pages.length : 1;
    }

    canPurchasePage() {
        return this.pages && this.pages.length < this.MAX_PAGES;
    }

    purchasePage() {
        if (!this.canPurchasePage()) return false;

        // Create new default page
        this.pages.push({
            grid: new Array(50).fill(null),
            rows: 5,
            purchasedRows: 0
        });

        this.saveToStorage();
        return true;
    }

    switchPage(index) {
        if (!this.pages || index < 0 || index >= this.pages.length) return false;
        if (index === this.activePageIndex) return true;

        // Save current page state first
        this.pages[this.activePageIndex] = {
            grid: this.grid,
            rows: this.rows,
            purchasedRows: this.purchasedRows
        };

        this.loadPage(index);
        this.saveToStorage();
        return true;
    }

    loadPage(index) {
        if (index < 0 || index >= this.pages.length) index = 0;

        const page = this.pages[index];
        this.activePageIndex = index;

        this.grid = page.grid;
        this.rows = page.rows;
        this.purchasedRows = page.purchasedRows;
        this.totalSlots = this.cols * this.rows;
    }


    // Grid position helpers
    getIndex(col, row) {
        return row * this.cols + col;
    }

    getCoords(index) {
        return {
            col: index % this.cols,
            row: Math.floor(index / this.cols)
        };
    }

    // Check if item can fit at position
    canPlaceItem(item, startCol, startRow) {
        // Check bounds
        if (startCol + item.width > this.cols || startRow + item.height > this.rows) {
            return false;
        }
        if (startCol < 0 || startRow < 0) {
            return false;
        }

        // Check if all required slots are empty
        for (let r = 0; r < item.height; r++) {
            for (let c = 0; c < item.width; c++) {
                const index = this.getIndex(startCol + c, startRow + r);
                const slot = this.grid[index];

                // Allow if slot is empty or contains the same item instance (for moving)
                if (slot !== null && slot.instanceId !== item.instanceId) {
                    return false;
                }
            }
        }

        return true;
    }

    // Place item at position
    placeItem(item, startCol, startRow) {
        if (!this.canPlaceItem(item, startCol, startRow)) {
            return false;
        }

        // Remove item from current position if it exists
        this.removeItem(item.instanceId);

        // Place item reference in all occupied slots
        for (let r = 0; r < item.height; r++) {
            for (let c = 0; c < item.width; c++) {
                const index = this.getIndex(startCol + c, startRow + r);
                this.grid[index] = {
                    ...item,
                    originCol: startCol,
                    originRow: startRow,
                    isOrigin: c === 0 && r === 0
                };
            }
        }

        this.saveToStorage();
        return true;
    }

    // Remove item by instance ID
    removeItem(instanceId) {
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] && this.grid[i].instanceId === instanceId) {
                this.grid[i] = null;
            }
        }
        this.saveToStorage();
    }

    // Get item at position
    getItemAt(col, row) {
        const index = this.getIndex(col, row);
        return this.grid[index];
    }

    // Find first available position for item
    findFirstAvailablePosition(item) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.canPlaceItem(item, col, row)) {
                    return { col, row };
                }
            }
        }
        return null;
    }

    // Auto-place item (find first available spot)
    autoPlaceItem(item) {
        const pos = this.findFirstAvailablePosition(item);
        if (pos) {
            return this.placeItem(item, pos.col, pos.row);
        }
        return false;
    }

    // Stack items if possible
    tryStackItem(newItem) {
        if (!newItem.stackable) return false;

        // Find existing stack of same item
        for (let i = 0; i < this.grid.length; i++) {
            const slot = this.grid[i];
            if (slot && slot.isOrigin &&
                slot.id === newItem.id &&
                slot.quantity < slot.maxStack) {

                // Add to stack
                const availableSpace = slot.maxStack - slot.quantity;
                const amountToAdd = Math.min(availableSpace, newItem.quantity);

                slot.quantity += amountToAdd;
                newItem.quantity -= amountToAdd;

                // Update all slots with this item
                for (let j = 0; j < this.grid.length; j++) {
                    if (this.grid[j] && this.grid[j].instanceId === slot.instanceId) {
                        this.grid[j].quantity = slot.quantity;
                    }
                }

                this.saveToStorage();

                // If all added, return true
                return newItem.quantity === 0;
            }
        }

        return false;
    }

    // Add item to inventory (try stack first, then auto-place)
    addItem(item) {
        // Try to stack if stackable
        if (item.stackable) {
            const fullyStacked = this.tryStackItem(item);
            if (fullyStacked) return true;

            // If partially stacked, try to place remainder
            if (item.quantity > 0) {
                return this.autoPlaceItem(item);
            }
        } else {
            return this.autoPlaceItem(item);
        }

        return false;
    }

    // Equipment Management
    equipItem(item) {
        if (!item.equipSlot) return false;

        const slot = item.equipSlot;
        const currentEquipped = this.equipment[slot];

        // Remove item from grid first to free up space
        this.removeItem(item.instanceId);

        // If there was an item equipped, try to place it in inventory
        if (currentEquipped) {
            if (!this.addItem(currentEquipped)) {
                // Failed to place unequipped item, revert changes
                this.addItem(item); // Put the item back
                return false;
            }
        }

        this.equipment[slot] = item;
        this.saveToStorage();
        return true;
    }

    unequipItem(slot) {
        const item = this.equipment[slot];
        if (!item) return false;

        if (this.addItem(item)) {
            this.equipment[slot] = null;
            this.saveToStorage();
            return true;
        }

        return false;
    }

    getEquippedStats() {
        const stats = {
            damage: 0,
            defense: 0,
            fireRate: 0,
            crit: 0,
            fireDamage: 0,
            voidDamage: 0,
            lifeSteal: 0,
            fireResist: 0,
            allResist: 0,
            health: 0
        };

        Object.values(this.equipment).forEach(item => {
            if (item && item.stats) {
                Object.entries(item.stats).forEach(([key, value]) => {
                    if (stats[key] !== undefined) {
                        stats[key] += value;
                    } else {
                        stats[key] = value;
                    }
                });
            }
        });

        return stats;
    }

    clearEquipment() {
        this.equipment = {
            helmet: null,
            chest: null,
            weapon: null
        };
        this.saveToStorage();
    }

    // Add coins as inventory items
    addCoins(amount) {
        let remaining = amount;

        // First, try to add to existing coin stacks
        for (let i = 0; i < this.grid.length && remaining > 0; i++) {
            const item = this.grid[i];
            if (item && item.id === 'coins' && item.isOrigin) {
                const canAdd = item.maxStack - item.quantity;
                if (canAdd > 0) {
                    const toAdd = Math.min(canAdd, remaining);
                    item.quantity += toAdd;
                    remaining -= toAdd;
                }
            }
        }

        // Create new coin stacks for remaining coins
        while (remaining > 0) {
            const stackSize = Math.min(remaining, 99);
            const coinItem = createItem('coins', stackSize);
            if (!this.addItem(coinItem)) {
                // Inventory full - force add to existing stack beyond limit
                for (let i = 0; i < this.grid.length; i++) {
                    const item = this.grid[i];
                    if (item && item.id === 'coins' && item.isOrigin) {
                        item.quantity += remaining;
                        remaining = 0;
                        break;
                    }
                }
                if (remaining > 0) {
                    console.warn('Cannot add coins - inventory full!');
                    break;
                }
            }
            remaining -= stackSize;
        }

        this.saveToStorage();
    }

    // Get total coin count
    getCoinCount() {
        let total = 0;

        // Count coins in all pages
        if (this.pages && this.pages.length > 0) {
            this.pages.forEach(page => {
                for (let i = 0; i < page.grid.length; i++) {
                    const item = page.grid[i];
                    if (item && item.id === 'coins' && item.isOrigin) {
                        total += item.quantity;
                    }
                }
            });
        } else {
            // Fallback for single page/initialization
            for (let i = 0; i < this.grid.length; i++) {
                const item = this.grid[i];
                if (item && item.id === 'coins' && item.isOrigin) {
                    total += item.quantity;
                }
            }
        }

        // Count pouches (global)
        const pouches = this.getAllItemsGlobal().filter(i => i.id === 'COIN_POUCH');
        const stored = pouches.reduce((sum, p) => sum + (p.stored || 0), 0);

        return total + stored;
    }

    // Withdraw coins from pouch
    withdrawCoins(pouch, amount) {
        if (!pouch || pouch.id !== 'COIN_POUCH' || !pouch.stored) return false;

        const withdrawAmount = Math.min(amount, pouch.stored);
        pouch.stored -= withdrawAmount;

        // Add to inventory as loose coins/stacks
        this.addCoins(withdrawAmount);

        this.saveToStorage();
        return true;
    }

    // Remove coins (spend them)
    // Remove coins (spend them) - Global
    removeCoins(amount) {
        const totalCoins = this.getCoinCount();
        if (totalCoins < amount) {
            return false;
        }

        let remaining = amount;

        // 1. Try to remove from active page first
        remaining = this.removeCoinsFromGrid(this.grid, remaining);
        if (remaining <= 0) {
            this.saveToStorage();
            return true;
        }

        // 2. Try to remove from other pages
        if (this.pages) {
            for (let i = 0; i < this.pages.length; i++) {
                if (i === this.activePageIndex) continue; // Already checked active grid

                // We need to work on the page grid directly
                const page = this.pages[i];
                remaining = this.removeCoinsFromGrid(page.grid, remaining);

                if (remaining <= 0) break;
            }
        }

        if (remaining <= 0) {
            this.saveToStorage();
            return true;
        }

        // 3. Take from Coin Pouches (Global)
        const pouches = this.getAllItemsGlobal().filter(i => i.id === 'COIN_POUCH' && (i.stored || 0) > 0);
        for (const pouch of pouches) {
            if (remaining <= 0) break;

            const take = Math.min(remaining, pouch.stored);
            pouch.stored -= take;
            remaining -= take;
        }

        this.saveToStorage();
        return true;
    }

    // Helper to remove coins from a specific grid
    removeCoinsFromGrid(grid, amount) {
        let remaining = amount;
        for (let i = grid.length - 1; i >= 0 && remaining > 0; i--) {
            const item = grid[i];
            if (item && item.id === 'coins' && item.isOrigin) {
                if (item.quantity <= remaining) {
                    remaining -= item.quantity;
                    // Remove item from grid
                    this.removeItemFromGrid(grid, item.instanceId);
                } else {
                    item.quantity -= remaining;
                    remaining = 0;
                }
            }
        }
        return remaining;
    }

    // Helper to remove item from a specific grid
    removeItemFromGrid(grid, instanceId) {
        for (let i = 0; i < grid.length; i++) {
            if (grid[i] && grid[i].instanceId === instanceId) {
                grid[i] = null;
            }
        }
    }

    // Sell item
    sellItem(instanceId) {
        // Find item
        let itemToSell = null;
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] && this.grid[i].instanceId === instanceId && this.grid[i].isOrigin) {
                itemToSell = this.grid[i];
                break;
            }
        }

        if (itemToSell) {
            const sellValue = itemToSell.value * (itemToSell.quantity || 1);
            this.addCoins(sellValue);
            this.removeItem(instanceId);
            return sellValue;
        }

        return 0;
    }

    // Hotbar Management
    equipToHotbar(slotIndex, itemId, quantity = 1) {
        if (slotIndex < 0 || slotIndex >= this.hotbar.length) return 0;

        const itemDef = ITEMS[itemId];
        if (!itemDef || (!itemDef.effect && itemDef.type !== ITEM_TYPES.POTION && itemDef.type !== ITEM_TYPES.CONSUMABLE)) {
            return 0; // Only consumables/potions can go in hotbar
        }

        const currentSlot = this.hotbar[slotIndex];

        // Case 1: Slot is empty
        if (!currentSlot.itemId || currentSlot.quantity <= 0) {
            const added = Math.min(quantity, this.HOTBAR_MAX_STACK);
            this.hotbar[slotIndex] = { itemId: itemId, quantity: added };
            return added;
        }

        // Case 2: Slot has same item (Stacking)
        if (currentSlot.itemId === itemId) {
            const spaceLeft = this.HOTBAR_MAX_STACK - currentSlot.quantity;
            if (spaceLeft <= 0) return 0; // Full

            const added = Math.min(quantity, spaceLeft);
            currentSlot.quantity += added;
            return added;
        }

        // Case 3: Slot has different item (Swap)
        // Try to return current item to inventory
        let itemToReturn;
        if (typeof createItem === 'function') {
            itemToReturn = createItem(currentSlot.itemId, currentSlot.quantity);
        } else {
            // Fallback
            const oldItemDef = ITEMS[currentSlot.itemId];
            if (oldItemDef) {
                itemToReturn = {
                    ...oldItemDef,
                    instanceId: Date.now() + Math.random().toString(),
                    quantity: currentSlot.quantity,
                    isOrigin: true
                };
            }
        }

        if (itemToReturn) {
            if (this.addItem(itemToReturn)) {
                // Successfully returned to inventory, now overwrite slot
                const added = Math.min(quantity, this.HOTBAR_MAX_STACK);
                this.hotbar[slotIndex] = { itemId: itemId, quantity: added };
                return added;
            } else {
                console.log("Inventory full, cannot unequip hotbar item");
                return 0; // Failed to swap
            }
        }

        return 0;
    }

    clearHotbar() {
        this.hotbar = [
            { itemId: null, quantity: 0 },
            { itemId: null, quantity: 0 }
        ];
        this.saveToStorage();
    }

    clearEquipment() {
        this.equipment = {
            weapon: null,
            chest: null,
            head: null,
            legs: null,
            feet: null,
            accessory1: null,
            accessory2: null
        };
        this.saveToStorage();
    }

    removeFromHotbar(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.hotbar.length) return false;

        const slot = this.hotbar[slotIndex];
        if (slot.itemId && slot.quantity > 0) {
            // Try to add back to inventory
            // Assuming createItem is globally available or we construct it manually
            // Since createItem is used elsewhere in this file, we assume it's available
            let item;
            if (typeof createItem === 'function') {
                item = createItem(slot.itemId, slot.quantity);
            } else {
                // Fallback if createItem is not available
                const itemDef = ITEMS[slot.itemId];
                if (itemDef) {
                    item = {
                        ...itemDef,
                        instanceId: Date.now() + Math.random().toString(),
                        quantity: slot.quantity,
                        isOrigin: true
                    };
                }
            }

            if (item && this.addItem(item)) {
                this.hotbar[slotIndex] = { itemId: null, quantity: 0 };
                return true;
            } else {
                return false; // Inventory full or error
            }
        }

        this.hotbar[slotIndex] = { itemId: null, quantity: 0 };
        return true;
    }

    consumeFromHotbar(slotIndex, player) {
        if (slotIndex < 0 || slotIndex >= this.hotbar.length) return false;

        const slot = this.hotbar[slotIndex];
        if (!slot.itemId || slot.quantity <= 0) return false;

        const item = ITEMS[slot.itemId];
        if (!item || !item.effect) return false;

        // Apply effect to player
        if (player && item.effect.type === 'heal') {
            player.heal(item.effect.value);
        }

        // Reduce quantity
        slot.quantity--;
        if (slot.quantity <= 0) {
            slot.itemId = null;
            slot.quantity = 0;
        }

        return true;
    }

    getHotbarSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.hotbar.length) return null;
        return this.hotbar[slotIndex];
    }

    // Get all unique items (origins only)
    getAllItems() {
        const items = [];
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] && this.grid[i].isOrigin) {
                items.push(this.grid[i]);
            }
        }
        return items;
    }

    // Get all unique items (origins only) - Global
    getAllItemsGlobal() {
        const items = [];
        if (this.pages) {
            this.pages.forEach(page => {
                for (let i = 0; i < page.grid.length; i++) {
                    if (page.grid[i] && page.grid[i].isOrigin) {
                        items.push(page.grid[i]);
                    }
                }
            });
        } else {
            for (let i = 0; i < this.grid.length; i++) {
                if (this.grid[i] && this.grid[i].isOrigin) {
                    items.push(this.grid[i]);
                }
            }
        }
        return items;
    }

    // Get inventory value - Global
    getTotalValue() {
        let total = this.getCoinCount();
        this.getAllItemsGlobal().forEach(item => {
            if (item.id !== 'coins') { // Don't double-count coins
                total += item.value * (item.quantity || 1);
            }
        });
        return total;
    }

    getGlobalSlotsUsed() {
        let used = 0;
        if (this.pages) {
            this.pages.forEach(page => {
                for (let i = 0; i < page.grid.length; i++) {
                    if (page.grid[i]) used++;
                }
            });
        } else {
            for (let i = 0; i < this.grid.length; i++) {
                if (this.grid[i]) used++;
            }
        }
        return used;
    }

    getGlobalTotalSlots() {
        let total = 0;
        if (this.pages) {
            this.pages.forEach(page => {
                total += (this.cols * page.rows);
            });
        } else {
            total = this.totalSlots;
        }
        return total;
    }
}

// Inventory UI Controller
class InventoryUI {
    constructor(inventory) {
        this.inventory = inventory;
        this.draggedItem = null;
        this.dragOffset = { x: 0, y: 0 };
        this.highlightedSlots = [];

        this.gridElement = null;
        this.initialized = false;
    }

    initialize(gridElement, coinsElement) {
        this.gridElement = gridElement;
        this.coinsElement = coinsElement;
        this.render();
        this.setupEventListeners();
        this.initialized = true;
    }

    render() {
        if (!this.gridElement) return;

        // Ensure page switcher exists
        let pageSwitcher = this.gridElement.parentElement.querySelector('.inventory-page-switcher');
        if (!pageSwitcher) {
            pageSwitcher = document.createElement('div');
            pageSwitcher.className = 'inventory-page-switcher';
            this.gridElement.parentElement.insertBefore(pageSwitcher, this.gridElement);
        }

        // Render page switcher
        this.renderPageSwitcher(pageSwitcher);

        // Update grid rows dynamically
        this.gridElement.style.gridTemplateRows = `repeat(${this.inventory.rows}, 60px)`;

        // Clear grid
        this.gridElement.innerHTML = '';

        // Create grid cells
        for (let row = 0; row < this.inventory.rows; row++) {
            for (let col = 0; col < this.inventory.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'inventory-slot';
                cell.dataset.col = col;
                cell.dataset.row = row;
                // Explicitly position each slot in the grid
                cell.style.gridColumn = col + 1;
                cell.style.gridRow = row + 1;
                this.gridElement.appendChild(cell);
            }
        }

        // Render items
        this.inventory.getAllItems().forEach(item => {
            this.renderItem(item);
        });

        // Update coins display
        if (this.coinsElement) {
            this.coinsElement.textContent = this.inventory.getCoinCount().toLocaleString();
        }
    }

    renderPageSwitcher(container) {
        const pageCount = this.inventory.getPageCount();
        const activePage = this.inventory.activePageIndex;

        container.innerHTML = '';

        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-nav-btn';
        prevBtn.textContent = '◀';
        prevBtn.disabled = activePage === 0;
        prevBtn.onclick = () => {
            if (this.inventory.switchPage(activePage - 1)) {
                this.render();
            }
        };
        container.appendChild(prevBtn);

        // Page Indicators
        const indicators = document.createElement('div');
        indicators.className = 'page-indicators';

        for (let i = 0; i < pageCount; i++) {
            const indicator = document.createElement('div');
            indicator.className = `page-indicator ${i === activePage ? 'active' : ''}`;
            indicator.textContent = i + 1;
            indicator.onclick = () => {
                if (this.inventory.switchPage(i)) {
                    this.render();
                }
            };
            indicators.appendChild(indicator);
        }
        container.appendChild(indicators);

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-nav-btn';
        nextBtn.textContent = '▶';
        nextBtn.disabled = activePage === pageCount - 1;
        nextBtn.onclick = () => {
            if (this.inventory.switchPage(activePage + 1)) {
                this.render();
            }
        };
        container.appendChild(nextBtn);
    }

    renderItem(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.dataset.instanceId = item.instanceId;
        itemElement.dataset.itemId = item.id;

        // Position and size
        itemElement.style.gridColumn = `${item.originCol + 1} / span ${item.width}`;
        itemElement.style.gridRow = `${item.originRow + 1} / span ${item.height}`;

        // Rarity styling
        const rarity = RARITY[item.rarity];
        itemElement.style.borderColor = rarity.color;
        itemElement.style.background = `linear-gradient(135deg, ${rarity.glow}, rgba(0,0,0,0.8))`;
        itemElement.style.boxShadow = `0 0 10px ${rarity.glow}`;

        // Dynamic icon size based on item dimensions
        const iconSize = Math.min(item.width, item.height) * 1.5;

        // Content
        itemElement.innerHTML = `
            <div class="item-icon" style="font-size: ${iconSize}rem">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            ${item.stackable ? `<div class="item-quantity">${item.quantity}</div>` : ''}
            ${item.id === 'COIN_POUCH' && (item.stored || 0) > 0 ? `<div class="pouch-stored">${item.stored}</div>` : ''}
        `;

        // Tooltip
        itemElement.title = this.getItemTooltip(item);

        this.gridElement.appendChild(itemElement);
    }

    getItemTooltip(item) {
        const rarity = RARITY[item.rarity];
        let tooltip = `${item.name}\n`;
        tooltip += `${rarity.name}\n`;
        tooltip += `${item.description}\n`;
        if (item.stats) {
            tooltip += `\nStats:\n`;
            Object.entries(item.stats).forEach(([stat, value]) => {
                tooltip += `  ${stat}: +${value}\n`;
            });
        }
        tooltip += `\nValue: ${item.value * (item.quantity || 1)} coins`;
        return tooltip;
    }

    setupEventListeners() {
        // Item drag events
        this.gridElement.addEventListener('mousedown', (e) => {
            const itemElement = e.target.closest('.inventory-item');
            if (itemElement) {
                this.startDrag(itemElement, e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.draggedItem) {
                this.onDrag(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.draggedItem) {
                this.endDrag(e);
            }
        });

        // Right-click for item menu
        this.gridElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const itemElement = e.target.closest('.inventory-item');
            if (itemElement) {
                this.showItemMenu(itemElement, e);
            }
        });
    }



    startDrag(itemElement, event) {
        const instanceId = itemElement.dataset.instanceId;
        const item = this.inventory.getAllItems().find(i => i.instanceId == instanceId);

        if (!item) return;

        this.draggedItem = item;
        itemElement.classList.add('dragging');

        // Calculate offset
        const rect = itemElement.getBoundingClientRect();
        this.dragOffset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    onDrag(event) {
        // Visual feedback handled by CSS

        // Check if hovering over hotbar slot FIRST (since they also have equipment-slot class)
        const hotbarSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest('.hotbar-equipment-slot');
        if (hotbarSlot) {
            // Clear grid highlights
            this.highlightSlots(-1, -1, this.draggedItem);

            // Check if item is consumable/potion
            if (this.draggedItem.effect || this.draggedItem.type === ITEM_TYPES.CONSUMABLE || this.draggedItem.type === ITEM_TYPES.POTION) {
                hotbarSlot.classList.add('highlight');
            }
            return;
        } else {
            document.querySelectorAll('.hotbar-equipment-slot').forEach(s => s.classList.remove('highlight'));
        }

        // Check if hovering over equipment slot
        const equipmentSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest('.equipment-slot');

        if (equipmentSlot && !equipmentSlot.classList.contains('hotbar-equipment-slot')) {
            // Clear grid highlights
            this.highlightSlots(-1, -1, this.draggedItem); // Clear grid

            const slotType = equipmentSlot.dataset.slot;
            // Highlight equipment slot if compatible
            if (this.draggedItem.equipSlot === slotType) {
                equipmentSlot.classList.add('highlight');
            }
            return;
        } else {
            // Clear equipment highlights
            document.querySelectorAll('.equipment-slot').forEach(s => s.classList.remove('highlight'));
        }

        // Calculate grid position
        const gridRect = this.gridElement.getBoundingClientRect();
        const cellWidth = gridRect.width / this.inventory.cols;
        const cellHeight = gridRect.height / this.inventory.rows;

        const col = Math.floor((event.clientX - gridRect.left) / cellWidth);
        const row = Math.floor((event.clientY - gridRect.top) / cellHeight);


        // Highlight valid/invalid placement
        this.highlightSlots(col, row, this.draggedItem);
    }

    highlightSlots(col, row, item) {
        // Clear previous highlights
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('valid-placement', 'invalid-placement');
        });

        if (!item || col < 0 || row < 0) return;

        const canPlace = this.inventory.canPlaceItem(item, col, row);

        // Highlight affected slots
        for (let r = 0; r < item.height; r++) {
            for (let c = 0; c < item.width; c++) {
                const targetCol = col + c;
                const targetRow = row + r;

                if (targetCol >= 0 && targetCol < this.inventory.cols &&
                    targetRow >= 0 && targetRow < this.inventory.rows) {

                    const slotElement = this.gridElement.querySelector(
                        `.inventory-slot[data-col="${targetCol}"][data-row="${targetRow}"]`
                    );

                    if (slotElement) {
                        slotElement.classList.add(canPlace ? 'valid-placement' : 'invalid-placement');
                    }
                }
            }
        }
    }

    endDrag(event) {
        // Check for hotbar drop FIRST
        const hotbarSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest('.hotbar-equipment-slot');
        if (hotbarSlot) {
            const slotIndex = parseInt(hotbarSlot.dataset.hotbarSlot);

            // Check if item is consumable/potion
            if (this.draggedItem.effect || this.draggedItem.type === ITEM_TYPES.CONSUMABLE || this.draggedItem.type === ITEM_TYPES.POTION) {

                // Use equipToHotbar logic (handles stacking/swapping)
                const added = this.inventory.equipToHotbar(slotIndex, this.draggedItem.id, this.draggedItem.quantity);

                if (added > 0) {
                    // Remove from inventory
                    if (this.draggedItem.quantity <= added) {
                        this.inventory.removeItem(this.draggedItem.instanceId);
                    } else {
                        this.draggedItem.quantity -= added;
                    }
                    this.render();
                }
            }

            this.draggedItem = null;

            // Clear drag state explicitly since we return early
            document.querySelector('.dragging')?.classList.remove('dragging');
            document.querySelectorAll('.inventory-slot').forEach(slot => {
                slot.classList.remove('valid-placement', 'invalid-placement');
            });
            document.querySelectorAll('.equipment-slot').forEach(s => s.classList.remove('highlight'));
            document.querySelectorAll('.hotbar-equipment-slot').forEach(s => s.classList.remove('highlight'));

            this.render(); // Ensure cleanup
            return;
        }

        // Check for equipment drop
        const equipmentSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest('.equipment-slot');

        if (equipmentSlot && !equipmentSlot.classList.contains('hotbar-equipment-slot')) {
            const slotType = equipmentSlot.dataset.slot;
            if (this.draggedItem.equipSlot === slotType) {
                if (this.inventory.equipItem(this.draggedItem)) {
                    // Success - UI update handled by equipItem -> render
                }
            }
        } else {
            // Grid logic
            const gridRect = this.gridElement.getBoundingClientRect();
            const cellWidth = gridRect.width / this.inventory.cols;
            const cellHeight = gridRect.height / this.inventory.rows;

            const col = Math.floor((event.clientX - gridRect.left) / cellWidth);
            const row = Math.floor((event.clientY - gridRect.top) / cellHeight);

            const targetIndex = row * this.inventory.cols + col;
            const targetItem = this.inventory.grid[targetIndex];

            // Check for stack combining
            if (targetItem &&
                targetItem.isOrigin &&
                targetItem.id === this.draggedItem.id &&
                targetItem.stackable &&
                this.draggedItem.stackable &&
                targetItem.instanceId !== this.draggedItem.instanceId) {

                // Get quantities before removing
                const draggedQty = this.draggedItem.quantity;

                // Remove dragged item first to prevent double counting
                this.inventory.removeItem(this.draggedItem.instanceId);

                // Combine stacks
                const totalAmount = targetItem.quantity + draggedQty;
                const maxStack = targetItem.maxStack || 99;

                if (totalAmount <= maxStack) {
                    // Fits in one stack
                    targetItem.quantity = totalAmount;
                } else {
                    // Overflow - fill target to max, create new stack with remainder
                    const remainder = totalAmount - maxStack;
                    targetItem.quantity = maxStack;

                    // Create new stack with overflow
                    const overflowStack = createItem(this.draggedItem.id, remainder);
                    // Try to place overflow near the combined stack
                    let placed = false;
                    for (let r = 0; r < this.inventory.rows && !placed; r++) {
                        for (let c = 0; c < this.inventory.cols && !placed; c++) {
                            if (this.inventory.canPlaceItem(overflowStack, c, r)) {
                                this.inventory.placeItem(overflowStack, c, r);
                                placed = true;
                            }
                        }
                    }
                }

                this.inventory.saveToStorage();
            } else if (targetItem && targetItem.id === 'COIN_POUCH' && this.draggedItem.type === 'currency') {
                // Deposit coins into pouch - find the origin if we're on a non-origin cell
                const pouchOrigin = targetItem.isOrigin ? targetItem : this.inventory.getAllItems().find(
                    item => item.id === 'COIN_POUCH' && item.instanceId === targetItem.instanceId && item.isOrigin
                );

                if (pouchOrigin) {
                    const space = pouchOrigin.capacity - (pouchOrigin.stored || 0);
                    const amount = Math.min(space, this.draggedItem.quantity);

                    if (amount > 0) {
                        pouchOrigin.stored = (pouchOrigin.stored || 0) + amount;

                        // Remove dragged coins
                        if (amount === this.draggedItem.quantity) {
                            this.inventory.removeItem(this.draggedItem.instanceId);
                            this.draggedItem = null;
                        } else {
                            this.draggedItem.quantity -= amount;
                        }

                        this.inventory.saveToStorage();
                        this.render();
                    }
                }
            } else {
                // Try normal placement
                if (this.inventory.placeItem(this.draggedItem, col, row)) {
                    // Success
                } else {
                    // Failed - item remains in original position
                }
            }
        }

        // Clear drag state
        document.querySelector('.dragging')?.classList.remove('dragging');
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('valid-placement', 'invalid-placement');
        });
        document.querySelectorAll('.equipment-slot').forEach(s => s.classList.remove('highlight'));

        this.draggedItem = null;
        this.render();
    }

    showItemMenu(itemElement, event) {
        const instanceId = Number(itemElement.dataset.instanceId);
        const item = this.inventory.getAllItems().find(i => i.instanceId === instanceId);

        if (!item) return;

        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'item-context-menu';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';

        const sellValue = item.value * (item.quantity || 1);

        let menuHtml = '';

        // Add Equip option if item is equippable
        if (item.equipSlot) {
            menuHtml += `<div class="menu-item" data-action="equip">Equip</div>`;
        }

        // Add Hotbar options for consumables
        if (item.effect || item.type === ITEM_TYPES.CONSUMABLE || item.type === ITEM_TYPES.POTION) {
            menuHtml += `<div style="height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0;"></div>`;
            menuHtml += `<div style="padding: 4px 8px; color: #b19cd9; font-size: 12px; font-weight: bold;">Add to Hotbar:</div>`;
            for (let i = 0; i < this.inventory.hotbar.length; i++) {
                menuHtml += `<div class="menu-item" data-action="hotbar-${i}">Slot ${i + 1}</div>`;
            }
            menuHtml += `<div style="height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0;"></div>`;
        }

        // Add Split option for stackable items with quantity > 1
        if (item.stackable && item.quantity > 1) {
            menuHtml += `<div class="menu-item" data-action="split">Split Stack</div>`;
        }

        // Add Withdraw option for Coin Pouch
        if (item.id === 'COIN_POUCH' && (item.stored || 0) > 0) {
            menuHtml += `<div class="menu-item" data-action="withdraw">Withdraw Coins</div>`;
        }

        // Merchant Selling Logic
        if (item.id !== 'coins') {
            let canSell = false;
            let sellMessage = "Sell";

            if (this.merchantManager && this.merchantManager.currentMerchant) {
                const merchant = this.merchantManager.currentMerchant;
                if (merchant.canBuy(item)) {
                    canSell = true;
                    sellMessage = `Sell to ${merchant.name} (${sellValue} coins)`;
                } else {
                    menuHtml += `<div class="menu-item disabled" style="color: #666; cursor: default;">${merchant.name} won't buy this</div>`;
                }
            } else {
                // Fallback if no merchant system (or offline) - keep generic sell for now
                canSell = true;
                sellMessage = `Sell (${sellValue} coins)`;
            }

            if (canSell) {
                menuHtml += `<div class="menu-item" data-action="sell">${sellMessage}</div>`;
            }
        }

        menuHtml += `<div class="menu-item" data-action="destroy">Destroy</div>`;

        menu.innerHTML = menuHtml;

        // Menu click handlers
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            // Handle disabled items
            if (e.target.classList.contains('disabled')) return;

            if (action && action.startsWith('hotbar-')) {
                const slotIndex = parseInt(action.split('-')[1]);
                // Try to add as much as possible (up to max stack)
                // equipToHotbar now returns the amount actually added
                const added = this.inventory.equipToHotbar(slotIndex, item.id, item.quantity);

                if (added > 0) {
                    // Remove from inventory
                    if (item.quantity <= added) {
                        this.inventory.removeItem(instanceId);
                    } else {
                        item.quantity -= added;
                    }
                    this.render();
                }
            } else if (action === 'equip') {
                if (this.inventory.equipItem(item)) {
                    this.render();
                }
            } else if (action === 'split') {
                this.showSplitModal(item);
            } else if (action === 'withdraw') {
                this.showWithdrawModal(item);
            } else if (action === 'sell') {
                this.inventory.sellItem(instanceId);
                this.render();
            } else if (action === 'destroy') {
                if (confirm(`Destroy ${item.name}?`)) {
                    this.inventory.removeItem(instanceId);
                    this.render();
                }
            }

            menu.remove();
            document.removeEventListener('click', closeMenu);
        });

        // Close menu on outside click
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);

        document.body.appendChild(menu);
    }

    showSplitModal(item) {
        const modal = document.getElementById('splitModal');
        const slider = document.getElementById('splitSlider');
        const leftAmount = document.getElementById('splitLeft');
        const rightAmount = document.getElementById('splitRight');
        const itemIcon = document.getElementById('splitItemIcon');
        const itemName = document.getElementById('splitItemName');

        // Setup display
        itemIcon.textContent = item.icon;
        itemName.textContent = item.name;

        // Setup slider
        slider.max = item.quantity - 1;
        slider.value = Math.floor(item.quantity / 2);

        // Inverted: slider controls right (split off) amount
        const updatePreview = () => {
            const right = parseInt(slider.value);
            const left = item.quantity - right;
            leftAmount.textContent = left;
            rightAmount.textContent = right;
        };

        slider.oninput = updatePreview;
        updatePreview();

        modal.classList.add('active');

        // Confirm button
        const confirmBtn = document.getElementById('splitConfirm');
        const cancelBtn = document.getElementById('splitCancel');

        // Remove old listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        newConfirmBtn.onclick = () => {
            const rightAmount = parseInt(slider.value);
            const leftAmount = item.quantity - rightAmount;
            this.confirmSplit(item, leftAmount);
            modal.classList.remove('active');
        };

        newCancelBtn.onclick = () => {
            modal.classList.remove('active');
        };
    }

    confirmSplit(item, leftAmount) {
        const rightAmount = item.quantity - leftAmount;

        // Update original stack
        item.quantity = leftAmount;

        // Create new stack
        const newStack = {
            ...item,
            quantity: rightAmount,
            instanceId: Date.now() + Math.random()
        };

        // Try to place new stack in inventory (find empty slot)
        if (this.inventory.autoPlaceItem(newStack)) {
            // Success
            this.render();
        } else {
            // Inventory full - revert changes
            item.quantity += rightAmount;
            alert('Inventory full!');
            this.render();
        }
    }

    showWithdrawModal(item) {
        const modal = document.getElementById('withdrawModal');
        const slider = document.getElementById('withdrawSlider');
        const leftAmount = document.getElementById('withdrawLeft');
        const rightAmount = document.getElementById('withdrawRight');
        const itemIcon = document.getElementById('withdrawItemIcon');
        const itemName = document.getElementById('withdrawItemName');

        // Setup display
        itemIcon.textContent = item.icon;
        itemName.textContent = item.name;

        // Setup slider
        slider.max = item.stored;
        slider.value = Math.min(50, item.stored);

        // Update preview function
        const updatePreview = () => {
            const withdraw = parseInt(slider.value);
            const keep = item.stored - withdraw;
            leftAmount.textContent = keep;
            rightAmount.textContent = withdraw;
        };

        updatePreview();
        slider.oninput = updatePreview;

        // Get buttons
        const confirmBtn = document.getElementById('withdrawConfirmBtn');
        const cancelBtn = document.getElementById('withdrawCancelBtn');

        // Remove old listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        newConfirmBtn.onclick = () => {
            const withdrawAmount = parseInt(slider.value);
            this.confirmWithdraw(item, withdrawAmount);
            modal.classList.remove('active');
        };

        newCancelBtn.onclick = () => {
            modal.classList.remove('active');
        };

        modal.classList.add('active');
    }

    confirmWithdraw(item, amount) {
        if (amount > 0 && amount <= item.stored) {
            this.inventory.withdrawCoins(item, amount);
            this.render();
        }
    }
}
