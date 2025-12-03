// Item Database and Reward System

// Rarity definitions
const RARITY = {
    COMMON: {
        name: 'Common',
        color: '#888888',
        valueMultiplier: 1,
        glow: 'rgba(136, 136, 136, 0.3)'
    },
    UNCOMMON: {
        name: 'Uncommon',
        color: '#00ff00',
        valueMultiplier: 2,
        glow: 'rgba(0, 255, 0, 0.4)'
    },
    RARE: {
        name: 'Rare',
        color: '#0080ff',
        valueMultiplier: 5,
        glow: 'rgba(0, 128, 255, 0.5)'
    },
    EPIC: {
        name: 'Epic',
        color: '#8a2be2',
        valueMultiplier: 10,
        glow: 'rgba(138, 43, 226, 0.6)'
    },
    LEGENDARY: {
        name: 'Legendary',
        color: '#ffd700',
        valueMultiplier: 25,
        glow: 'rgba(255, 215, 0, 0.7)'
    }
};

// Item type definitions
const ITEM_TYPES = {
    CURRENCY: 'currency',
    POTION: 'potion',
    ARMOR: 'armor',
    WEAPON: 'weapon',
    CONSUMABLE: 'consumable',
    MATERIAL: 'material'
};

// Equipment slot types
const EQUIPMENT_SLOTS = {
    HELMET: 'helmet',
    CHEST: 'chest',
    WEAPON: 'weapon'
};

// Item database
const ITEMS = {
    // Currency
    coins: {
        id: 'coins',
        name: 'Coins',
        type: ITEM_TYPES.CURRENCY,
        rarity: 'COMMON',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 99,
        value: 1,
        icon: '💰',
        description: 'Currency used for trading'
    },

    // Potions
    health_potion_minor: {
        id: 'health_potion_minor',
        name: 'Minor Health Potion',
        type: ITEM_TYPES.POTION,
        rarity: 'COMMON',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 10,
        value: 10,
        icon: '🧪',
        description: 'Restores 50 HP',
        effect: { type: 'heal', value: 50 }
    },
    health_potion: {
        id: 'health_potion',
        name: 'Health Potion',
        type: ITEM_TYPES.POTION,
        rarity: 'UNCOMMON',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 10,
        value: 25,
        icon: '🧪',
        description: 'Restores 100 HP',
        effect: { type: 'heal', value: 100 }
    },
    health_potion_greater: {
        id: 'health_potion_greater',
        name: 'Greater Health Potion',
        type: ITEM_TYPES.POTION,
        rarity: 'RARE',
        width: 1,
        height: 2,
        stackable: true,
        maxStack: 10,
        value: 50,
        icon: '🧪',
        description: 'Restores 200 HP',
        effect: { type: 'heal', value: 200 }
    },
    mana_potion: {
        id: 'mana_potion',
        name: 'Mana Potion',
        type: ITEM_TYPES.POTION,
        rarity: 'UNCOMMON',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 10,
        value: 20,
        icon: '💙',
        description: 'Restores mana',
        effect: { type: 'mana', value: 50 }
    },
    damage_boost: {
        id: 'damage_boost',
        name: 'Damage Elixir',
        type: ITEM_TYPES.POTION,
        rarity: 'RARE',
        width: 1,
        height: 2,
        stackable: true,
        maxStack: 5,
        value: 75,
        icon: '⚗️',
        description: '+25% damage for next run',
        effect: { type: 'buff', stat: 'damage', value: 1.25 }
    },

    // Armor
    leather_helmet: {
        id: 'leather_helmet',
        name: 'Leather Helmet',
        type: ITEM_TYPES.ARMOR,
        rarity: 'COMMON',
        width: 2,
        height: 2,
        stackable: false,
        maxStack: 1,
        value: 30,
        icon: '⛑️',
        description: '+5 Defense',
        stats: { defense: 5 },
        equipSlot: EQUIPMENT_SLOTS.HELMET
    },
    iron_helmet: {
        id: 'iron_helmet',
        name: 'Iron Helmet',
        type: ITEM_TYPES.ARMOR,
        rarity: 'UNCOMMON',
        width: 2,
        height: 2,
        stackable: false,
        maxStack: 1,
        value: 60,
        icon: '⛑️',
        description: '+12 Defense',
        stats: { defense: 12 },
        equipSlot: EQUIPMENT_SLOTS.HELMET
    },
    steel_helmet: {
        id: 'steel_helmet',
        name: 'Steel Helmet',
        type: ITEM_TYPES.ARMOR,
        rarity: 'RARE',
        width: 2,
        height: 2,
        stackable: false,
        maxStack: 1,
        value: 150,
        icon: '⛑️',
        description: '+25 Defense',
        stats: { defense: 25 },
        equipSlot: EQUIPMENT_SLOTS.HELMET
    },
    leather_chestplate: {
        id: 'leather_chestplate',
        name: 'Leather Chestplate',
        type: ITEM_TYPES.ARMOR,
        rarity: 'COMMON',
        width: 3,
        height: 3,
        stackable: false,
        maxStack: 1,
        value: 50,
        icon: '🛡️',
        description: '+10 Defense',
        stats: { defense: 10 },
        equipSlot: EQUIPMENT_SLOTS.CHEST
    },
    iron_chestplate: {
        id: 'iron_chestplate',
        name: 'Iron Chestplate',
        type: ITEM_TYPES.ARMOR,
        rarity: 'UNCOMMON',
        width: 3,
        height: 3,
        stackable: false,
        maxStack: 1,
        value: 100,
        icon: '🛡️',
        description: '+25 Defense',
        stats: { defense: 25 },
        equipSlot: EQUIPMENT_SLOTS.CHEST
    },
    steel_chestplate: {
        id: 'steel_chestplate',
        name: 'Steel Chestplate',
        type: ITEM_TYPES.ARMOR,
        rarity: 'RARE',
        width: 3,
        height: 3,
        stackable: false,
        maxStack: 1,
        value: 250,
        icon: '🛡️',
        description: '+50 Defense',
        stats: { defense: 50 },
        equipSlot: EQUIPMENT_SLOTS.CHEST
    },
    dragonscale_chestplate: {
        id: 'dragonscale_chestplate',
        name: 'Dragonscale Chestplate',
        type: ITEM_TYPES.ARMOR,
        rarity: 'EPIC',
        width: 3,
        height: 4,
        stackable: false,
        maxStack: 1,
        value: 500,
        icon: '🛡️',
        description: '+100 Defense, +10% Fire Resist',
        stats: { defense: 100, fireResist: 10 },
        equipSlot: EQUIPMENT_SLOTS.CHEST
    },
    celestial_armor: {
        id: 'celestial_armor',
        name: 'Celestial Armor',
        type: ITEM_TYPES.ARMOR,
        rarity: 'LEGENDARY',
        width: 4,
        height: 4,
        stackable: false,
        maxStack: 1,
        value: 1500,
        icon: '✨',
        description: '+200 Defense, +25% All Resist',
        stats: { defense: 200, allResist: 25 },
        equipSlot: EQUIPMENT_SLOTS.CHEST
    },

    // Weapons
    rusty_sword: {
        id: 'rusty_sword',
        name: 'Rusty Sword',
        type: ITEM_TYPES.WEAPON,
        rarity: 'COMMON',
        width: 1,
        height: 3,
        stackable: false,
        maxStack: 1,
        value: 20,
        icon: '⚔️',
        description: '+2 Damage',
        stats: { damage: 2 },
        equipSlot: EQUIPMENT_SLOTS.WEAPON
    },
    iron_sword: {
        id: 'iron_sword',
        name: 'Iron Sword',
        type: ITEM_TYPES.WEAPON,
        rarity: 'UNCOMMON',
        width: 1,
        height: 3,
        stackable: false,
        maxStack: 1,
        value: 50,
        icon: '⚔️',
        description: '+5 Damage',
        stats: { damage: 5 },
        equipSlot: EQUIPMENT_SLOTS.WEAPON
    },
    steel_longsword: {
        id: 'steel_longsword',
        name: 'Steel Longsword',
        type: ITEM_TYPES.WEAPON,
        rarity: 'RARE',
        width: 2,
        height: 3,
        stackable: false,
        maxStack: 1,
        value: 150,
        icon: '⚔️',
        description: '+10 Damage, +5% Crit',
        stats: { damage: 10, crit: 5 },
        equipSlot: EQUIPMENT_SLOTS.WEAPON
    },
    flaming_blade: {
        id: 'flaming_blade',
        name: 'Flaming Blade',
        type: ITEM_TYPES.WEAPON,
        rarity: 'EPIC',
        width: 2,
        height: 4,
        stackable: false,
        maxStack: 1,
        value: 400,
        icon: '🔥',
        description: '+40 Damage, +15% Fire Damage',
        stats: { damage: 40, fireDamage: 15 },
        equipSlot: EQUIPMENT_SLOTS.WEAPON
    },
    void_reaver: {
        id: 'void_reaver',
        name: 'Void Reaver',
        type: ITEM_TYPES.WEAPON,
        rarity: 'LEGENDARY',
        width: 3,
        height: 4,
        stackable: false,
        maxStack: 1,
        value: 1200,
        icon: '🌌',
        description: '+120 Damage, +25% Void Damage, Life Steal',
        stats: { damage: 120, voidDamage: 25, lifeSteal: 10 },
        equipSlot: EQUIPMENT_SLOTS.WEAPON
    },

    // Consumables
    bread: {
        id: 'bread',
        name: 'Bread',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: 'COMMON',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 20,
        value: 5,
        icon: '🍞',
        description: 'Restores 20 HP',
        effect: { type: 'heal', value: 20 }
    },
    cooked_meat: {
        id: 'cooked_meat',
        name: 'Cooked Meat',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: 'COMMON',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 15,
        value: 10,
        icon: '🍖',
        description: 'Restores 40 HP',
        effect: { type: 'heal', value: 40 }
    },

    // Materials
    leather_scraps: {
        id: 'leather_scraps',
        name: 'Leather Scraps',
        type: ITEM_TYPES.MATERIAL,
        rarity: 'COMMON',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 50,
        value: 3,
        icon: '🧵',
        description: 'Crafting material'
    },
    iron_ore: {
        id: 'iron_ore',
        name: 'Iron Ore',
        type: ITEM_TYPES.MATERIAL,
        rarity: 'UNCOMMON',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 50,
        value: 5,
        icon: '⛏️',
        description: 'Crafting material'
    },
    dragon_scale: {
        id: 'dragon_scale',
        name: 'Dragon Scale',
        type: ITEM_TYPES.MATERIAL,
        rarity: 'EPIC',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 20,
        value: 50,
        icon: '🐉',
        description: 'Rare crafting material'
    },
    COIN_POUCH: {
        id: 'COIN_POUCH',
        name: 'Coin Pouch',
        type: 'container',
        rarity: 'EPIC',
        value: 500,
        icon: '💰',
        description: 'Holds up to 999 coins. Drag coins here to deposit.',
        width: 2,
        height: 2,
        maxStack: 1,
        capacity: 999,
        stored: 0
    }
};

// Helper function to create item instances
function createItem(itemId, quantity = 1) {
    const template = ITEMS[itemId];
    if (!template) {
        console.error('Unknown item ID:', itemId);
        return null;
    }

    const item = {
        ...template,
        quantity: template.stackable ? quantity : 1,
        instanceId: Date.now() + Math.random()
    };

    return item;
}

// Reward Generation
class RewardGenerator {
    getRarityForLevel(level) {
        const roll = Math.random() * 100;

        // Adjusted for scarcity and progression
        // Legendary: 0% before level 20. Max 5% chance.
        const legendaryChance = level < 20 ? 0 : Math.min((level - 19) * 0.5, 5);

        // Epic: 0% before level 10. Max 15% chance.
        const epicChance = level < 10 ? 0 : Math.min((level - 9) * 1.5, 15) + legendaryChance;

        // Rare: Starts low, max 30% chance.
        const rareChance = Math.min(level * 2, 30) + epicChance;

        // Uncommon: Base 40% chance + rare/epic/leg.
        const uncommonChance = 40 + rareChance;

        if (roll < legendaryChance) return 'LEGENDARY';
        if (roll < epicChance) return 'EPIC';
        if (roll < rareChance) return 'RARE';
        if (roll < uncommonChance) return 'UNCOMMON';
        return 'COMMON';
    }

    getItemPoolForRarity(rarity) {
        return Object.values(ITEMS).filter(item =>
            item.rarity === rarity &&
            item.type !== ITEM_TYPES.CURRENCY &&
            item.id !== 'COIN_POUCH' // Exclude Coin Pouch (merchant only)
        );
    }

    generateReward(level) {
        const reward = {
            coins: 0,
            items: []
        };

        // Generate coins (reduced for grindier progression)
        // Level 1: ~2-6 coins, Level 5: ~4-8 coins, Level 10: ~10-14 coins
        reward.coins = Math.floor(2 * Math.pow(1.25, level)) + Math.floor(Math.random() * 5);

        // Item drop chance - Significantly reduced
        // Start at 25%, increase by 2% per level, cap at 60%
        const itemDropChance = Math.min(0.25 + (level * 0.02), 0.60);

        // Determine max number of items (Scarce!)
        // 1 item max until level 10. 2 items max level 10+. Cap at 3 items (level 30+).
        const maxItems = Math.min(Math.floor(level / 10) + 1, 3);

        // Generate items with probability
        for (let i = 0; i < maxItems; i++) {
            // Each item slot has independent drop chance
            if (Math.random() < itemDropChance) {
                const rarity = this.getRarityForLevel(level);
                const itemPool = this.getItemPoolForRarity(rarity);

                if (itemPool.length > 0) {
                    const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];

                    // Create item instance
                    const item = {
                        ...randomItem,
                        quantity: randomItem.stackable ? Math.floor(Math.random() * 3) + 1 : 1,
                        instanceId: Date.now() + Math.random() // Unique ID
                    };

                    reward.items.push(item);
                }
            }
        }

        return reward;
    }

    // Increase reward value for continuing
    increaseReward(currentReward, multiplier = 1.5) {
        return {
            coins: Math.floor(currentReward.coins * multiplier),
            items: [...currentReward.items] // Keep existing items, may add more
        };
    }
}
