// Item constants
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
