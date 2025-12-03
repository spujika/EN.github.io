// Reflect Parry Mechanic System
// A reusable reflect parry mechanic that can be applied to any entity (boss or player)
// This type of parry reflects projectiles back at the attacker
class ReflectParryMechanic {
    constructor(options = {}) {
        // Configuration
        this.duration = options.duration || 2.0; // Seconds parry stays active
        this.cooldown = options.cooldown || 5.0; // Seconds before parry can be used again
        this.reflectionSpeedMultiplier = options.reflectionSpeedMultiplier || 1.5; // How much faster reflected projectiles are
        this.reflectedColor = options.reflectedColor || '#ffffff'; // Color of reflected projectiles

        // Visual configuration
        this.indicatorColor = options.indicatorColor || '#ffffff';
        this.indicatorSize = options.indicatorSize || 10; // Extra radius around entity
        this.glowIntensity = options.glowIntensity || 20; // Shadow blur amount

        // State
        this.active = false;
        this.currentDuration = 0;
        this.currentCooldown = 0;
    }

    /**
     * Attempt to activate reflect parry stance
     * @returns {boolean} True if reflect parry was activated, false if on cooldown
     */
    activate() {
        if (this.currentCooldown > 0) {
            return false; // Still on cooldown
        }

        this.active = true;
        this.currentDuration = this.duration;
        this.currentCooldown = this.cooldown;
        return true;
    }

    /**
     * Update reflect parry state (duration and cooldown timers)
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Update active parry duration
        if (this.active) {
            this.currentDuration -= dt;
            if (this.currentDuration <= 0) {
                this.active = false;
            }
        }

        // Update cooldown
        if (this.currentCooldown > 0) {
            this.currentCooldown -= dt;
        }
    }

    /**
     * Check if reflect parry is currently active
     * @returns {boolean} True if reflect parry is active
     */
    isActive() {
        return this.active;
    }

    /**
     * Check if reflect parry is on cooldown
     * @returns {boolean} True if reflect parry is on cooldown
     */
    isOnCooldown() {
        return this.currentCooldown > 0;
    }

    /**
     * Reflect a projectile (reverses direction and changes owner)
     * @param {Projectile} projectile - The projectile to reflect
     * @returns {boolean} True if projectile was reflected
     */
    reflectProjectile(projectile) {
        if (!this.active) {
            return false;
        }

        // Change ownership
        projectile.owner = projectile.owner === 'player' ? 'boss' : 'player';

        // Reverse and amplify velocity
        projectile.vx *= -this.reflectionSpeedMultiplier;
        projectile.vy *= -this.reflectionSpeedMultiplier;

        // Change color to indicate reflection
        projectile.color = this.reflectedColor;

        return true;
    }

    /**
     * Draw reflect parry visual indicator around an entity
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Entity x position
     * @param {number} y - Entity y position
     * @param {number} entitySize - Size of the entity
     */
    draw(ctx, x, y, entitySize) {
        if (!this.active) {
            return;
        }

        ctx.save();
        ctx.strokeStyle = this.indicatorColor;
        ctx.lineWidth = 4;
        ctx.shadowBlur = this.glowIntensity;
        ctx.shadowColor = this.indicatorColor;
        ctx.beginPath();
        ctx.arc(x, y, entitySize + this.indicatorSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Reset reflect parry state (useful when entity dies or resets)
     */
    reset() {
        this.active = false;
        this.currentDuration = 0;
        this.currentCooldown = 0;
    }

    /**
     * Get current cooldown percentage (0.0 to 1.0)
     * @returns {number} Cooldown progress (1.0 = ready, 0.0 = just used)
     */
    getCooldownProgress() {
        if (this.currentCooldown <= 0) {
            return 1.0;
        }
        return 1.0 - (this.currentCooldown / this.cooldown);
    }

    /**
     * Get current duration percentage (0.0 to 1.0)
     * @returns {number} Duration progress (1.0 = just started, 0.0 = about to end)
     */
    getDurationProgress() {
        if (!this.active) {
            return 0.0;
        }
        return this.currentDuration / this.duration;
    }
}
