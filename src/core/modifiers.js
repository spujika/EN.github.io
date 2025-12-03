// Modifier System
const MODIFIER_TYPES = {
    HEALTH: {
        name: 'Fortified',
        icon: '🛡️',
        description: 'Boss gains increased health',
        getValue: (level) => 0.25 + (Math.floor(level / 5) * 0.05), // +25% base, +5% per tier
        getCurrentValue: (boss) => `Current: ${Math.round(boss.maxHealth)}`,
        apply: (boss, value) => {
            boss.maxHealth *= (1 + value);
            boss.health *= (1 + value);
        },
        color: '#00ff00'
    },
    SPEED: {
        name: 'Accelerated',
        icon: '⚡',
        description: 'Boss moves faster',
        getValue: (level) => 0.20 + (Math.floor(level / 5) * 0.05), // +20% base, +5% per tier
        getCurrentValue: (boss) => `Current: ${boss.speed.toFixed(1)}`,
        apply: (boss, value) => {
            boss.speed *= (1 + value);
        },
        color: '#ffff00'
    },
    FIRE_RATE: {
        name: 'Rapid Fire',
        icon: '🔥',
        description: 'Boss attacks more frequently',
        getValue: (level) => 0.25 + (Math.floor(level / 5) * 0.05), // +25% base, +5% per tier
        getCurrentValue: (boss) => `Cooldown: ${boss.attackCooldownMax.toFixed(1)}s`,
        apply: (boss, value) => {
            boss.attackCooldownMax *= (1 - value); // Lower cooldown = faster attacks
        },
        color: '#ff6600'
    },
    DAMAGE: {
        name: 'Empowered',
        icon: '💥',
        description: 'Boss deals more damage',
        getValue: (level) => 0.30 + (Math.floor(level / 5) * 0.05), // +30% base, +5% per tier
        getCurrentValue: (boss) => `Multiplier: ${boss.damageMultiplier.toFixed(1)}x`,
        apply: (boss, value) => {
            boss.damageMultiplier *= (1 + value);
        },
        color: '#ff0000'
    },
    PROJECTILE_COUNT: {
        name: 'Multi-Shot',
        icon: '☄️',
        description: 'Boss shoots more projectiles',
        getValue: (level) => 1, // Always +1 projectile per pick
        getCurrentValue: (boss) => `Extra Shots: +${boss.projectileCount || 0}`,
        apply: (boss, value) => {
            boss.projectileCount = (boss.projectileCount || 0) + value;
        },
        color: '#8a2be2'
    },
    PROJECTILE_SPEED: {
        name: 'Ballistic',
        icon: '🎯',
        description: 'Boss projectiles move faster',
        getValue: (level) => 0.25 + (Math.floor(level / 5) * 0.05), // +25% base, +5% per tier
        getCurrentValue: (boss) => `Speed: ${boss.projectileSpeedMultiplier.toFixed(1)}x`,
        apply: (boss, value) => {
            boss.projectileSpeedMultiplier *= (1 + value);
        },
        color: '#00ffff'
    },
    REGENERATION: {
        name: 'Regenerating',
        icon: '💚',
        description: 'Boss slowly regenerates health',
        getValue: (level) => 0.5 + (Math.floor(level / 5) * 0.2), // 0.5 HP/sec base, +0.2 per tier
        getCurrentValue: (boss) => `Regen: ${boss.regeneration.toFixed(1)}/s`,
        apply: (boss, value) => {
            boss.regeneration = (boss.regeneration || 0) + value;
        },
        color: '#00cc66'
    },
    ARMOR: {
        name: 'Armored',
        icon: '🔰',
        description: 'Boss takes reduced damage',
        getValue: (level) => 0.15 + (Math.floor(level / 5) * 0.03), // 15% reduction base, +3% per tier
        getCurrentValue: (boss) => `Armor: ${(boss.damageReduction * 100).toFixed(0)}%`,
        apply: (boss, value) => {
            boss.damageReduction = Math.min(0.75, (boss.damageReduction || 0) + value); // Cap at 75%
        },
        color: '#silver'
    }
};

class ModifierManager {
    constructor() {
        this.activeModifiers = [];
    }

    getRandomModifiers(level, count = 3) {
        const types = Object.keys(MODIFIER_TYPES);
        const selected = [];

        // Randomly select unique modifier types
        while (selected.length < count && selected.length < types.length) {
            const randomType = types[Math.floor(Math.random() * types.length)];
            if (!selected.find(m => m.type === randomType)) {
                const modifierDef = MODIFIER_TYPES[randomType];
                selected.push({
                    type: randomType,
                    name: modifierDef.name,
                    icon: modifierDef.icon,
                    description: modifierDef.description,
                    value: modifierDef.getValue(level),
                    color: modifierDef.color
                });
            }
        }

        return selected;
    }

    applyModifier(boss, modifier) {
        this.activeModifiers.push(modifier);
        const modifierDef = MODIFIER_TYPES[modifier.type];
        modifierDef.apply(boss, modifier.value);
    }

    applyModifiers(boss) {
        // Apply all active modifiers to the boss
        this.activeModifiers.forEach(modifier => {
            const modifierDef = MODIFIER_TYPES[modifier.type];
            modifierDef.apply(boss, modifier.value);
        });
    }

    addModifier(modifier) {
        this.activeModifiers.push(modifier);
    }

    reset() {
        this.activeModifiers = [];
    }

    getModifierSummary() {
        const summary = {};
        this.activeModifiers.forEach(mod => {
            if (!summary[mod.type]) {
                summary[mod.type] = {
                    name: mod.name,
                    count: 0,
                    totalValue: 0
                };
            }
            summary[mod.type].count++;
            summary[mod.type].totalValue += mod.value;
        });
        return summary;
    }
}
