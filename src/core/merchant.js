// Merchant System

const MERCHANT_TYPES = {
    ARMOURSMITH: {
        id: 'armoursmith',
        name: 'Armoursmith',
        icon: '🛡️',
        description: 'Sells sturdy armor and shields.',
        buys: ['armor', 'material'],
        sells: ['armor', 'material']
    },
    WEAPONSMITH: {
        id: 'weaponsmith',
        name: 'Weaponsmith',
        icon: '⚔️',
        description: 'Sells sharp blades and heavy weapons.',
        buys: ['weapon', 'material'],
        sells: ['weapon', 'material']
    },
    POTION_SELLER: {
        id: 'potion_seller',
        name: 'Alchemist',
        icon: '⚗️',
        description: 'Sells potions and magical ingredients.',
        buys: ['potion', 'consumable', 'material'],
        sells: ['potion', 'consumable']
    },
    BANKER: {
        id: 'banker',
        name: 'Banker',
        icon: '🏦',
        description: 'Secure storage for your wealth.',
        buys: [],
        sells: ['container']
    }
};

class Merchant {
    constructor(typeId, level, inventory) {
        const type = Object.values(MERCHANT_TYPES).find(t => t.id === typeId);
        this.type = type;
        this.name = type.id === 'banker' ? 'Royal Banker' : this.generateName(type);
        this.level = level;
        this.stock = this.generateStock(level, inventory);
        this.refreshTime = Date.now();
    }

    generateName(type) {
        if (type.id === 'banker') return 'Royal Banker';

        const prefixes = ['Old', 'Master', 'Traveling', 'Mysterious', 'Royal'];
        const names = {
            armoursmith: ['Gorin', 'Hilda', 'Thorin', 'Braum'],
            weaponsmith: ['Kael', 'Syla', 'Grim', 'Vera'],
            potion_seller: ['Elara', 'Merlin', 'Zara', 'Fizz']
        };
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomName = names[type.id][Math.floor(Math.random() * names[type.id].length)];
        return `${randomPrefix} ${randomName}`;
    }

    generateStock(level, inventory) {
        // Banker sells Coin Pouch and inventory expansions
        if (this.type.id === 'banker') {
            const stock = [{
                ...ITEMS.COIN_POUCH,
                instanceId: Date.now() + Math.random(),
                price: ITEMS.COIN_POUCH.value,
                quantity: 1
            }];

            // Add row expansion if player can still purchase
            if (inventory && inventory.canPurchaseRow()) {
                stock.push({
                    id: 'ROW_EXPANSION',
                    name: 'Inventory Row Expansion',
                    icon: '📦',
                    description: `Add 1 row (10 slots) to your inventory. Current: ${inventory.rows} rows`,
                    price: 200,
                    type: 'upgrade',
                    rarity: 'RARE',
                    instanceId: Date.now() + Math.random() + 0.1,
                    quantity: 1
                });
            }

            // Add page expansion if player can still purchase
            if (inventory && inventory.canPurchasePage()) {
                stock.push({
                    id: 'PAGE_EXPANSION',
                    name: 'New Inventory Page',
                    icon: '📄',
                    description: `Add a new 10x5 inventory page. Current pages: ${inventory.getPageCount()}`,
                    price: 2000,
                    type: 'upgrade',
                    rarity: 'EPIC',
                    instanceId: Date.now() + Math.random() + 0.2,
                    quantity: 1
                });
            }

            return stock;
        }

        const stock = [];
        const stockSize = 4 + Math.floor(Math.random() * 3); // 4-6 items

        // Get all possible items this merchant sells
        const possibleItems = Object.values(ITEMS).filter(item =>
            this.type.sells.includes(item.type)
        );

        for (let i = 0; i < stockSize; i++) {
            // Rarity roll based on level
            const rarityRoll = Math.random();
            let targetRarity = 'COMMON';

            if (rarityRoll < 0.05 + (level * 0.01)) targetRarity = 'LEGENDARY';
            else if (rarityRoll < 0.15 + (level * 0.02)) targetRarity = 'EPIC';
            else if (rarityRoll < 0.30 + (level * 0.03)) targetRarity = 'RARE';
            else if (rarityRoll < 0.60) targetRarity = 'UNCOMMON';

            // Filter items by rarity
            const rarityItems = possibleItems.filter(item => item.rarity === targetRarity);

            // Fallback if no items of that rarity found
            const pool = rarityItems.length > 0 ? rarityItems : possibleItems;

            if (pool.length > 0) {
                const template = pool[Math.floor(Math.random() * pool.length)];

                // Price calculation (dearer for rare items)
                const priceMultiplier = 1.5 + (Math.random() * 0.5); // 1.5x - 2.0x base value
                const price = Math.ceil(template.value * priceMultiplier);

                stock.push({
                    ...template,
                    instanceId: Date.now() + Math.random(),
                    price: price,
                    quantity: template.stackable ? Math.floor(Math.random() * 5) + 1 : 1
                });
            }
        }

        return stock;
    }

    canBuy(item) {
        return this.type.buys.includes(item.type);
    }

    buyItemFromPlayer(item) {
        // Merchant buying from player (Player sells)
        // Returns value if successful, 0 if not allowed
        if (!this.canBuy(item)) return 0;
        return Math.floor(item.value * (item.quantity || 1));
    }

    removeItemFromStock(instanceId) {
        // Banker stock doesn't deplete (infinite pouches)
        if (this.type.id === 'banker') return false;

        const index = this.stock.findIndex(item => item.instanceId === instanceId);
        if (index !== -1) {
            this.stock.splice(index, 1);
            return true;
        }
        return false;
    }
}

class MerchantManager {
    constructor(level, inventory) {
        this.inventory = inventory;
        this.activeMerchants = [];
        this.rotationInterval = 5 * 60 * 1000; // 5 minutes
        this.nextRotationTime = Date.now() + this.rotationInterval;
        this.listeners = [];
    }

    update(level) {
        // Initialize if empty
        if (this.activeMerchants.length === 0) {
            // Add Banker (always first)
            this.activeMerchants.push(new Merchant('banker', level, this.inventory));
            // Add initial traveling merchant
            this.rotateMerchant(level);
        }

        const now = Date.now();
        if (now >= this.nextRotationTime) {
            this.rotateMerchant(level);
        }
    }

    rotateMerchant(level) {
        const types = Object.values(MERCHANT_TYPES).filter(t => t.id !== 'banker');
        const randomType = types[Math.floor(Math.random() * types.length)];

        // Replace the traveling merchant (index 1) or add if missing
        const newMerchant = new Merchant(randomType.id, level, this.inventory);

        if (this.activeMerchants.length > 1) {
            this.activeMerchants[1] = newMerchant;
        } else {
            this.activeMerchants.push(newMerchant);
        }

        this.nextRotationTime = Date.now() + this.rotationInterval;

        console.log(`Merchant rotated: ${newMerchant.name} (${newMerchant.type.name})`);
        this.notifyListeners();
    }

    getTimeRemaining() {
        return Math.max(0, this.nextRotationTime - Date.now());
    }

    // Observer pattern for UI updates
    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.activeMerchants));
    }
}
