// Player Character
class Player {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.speed = 240; // 4 * 60
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.angle = 0;

        // Shooting
        this.fireRate = 0.16; // 10 frames / 60
        this.fireCooldown = 0;
        this.bulletSpeed = 480; // 8 * 60
        this.bulletDamage = 10;

        // Movement
        this.moveUp = false;
        this.moveDown = false;
        this.moveLeft = false;
        this.moveRight = false;

        // Invulnerability frames after hit
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.maxInvulnerabilityTime = 1.0; // 60 frames / 60

        // Debug
        this.debugInvincible = false;

        this.canvas = canvas;

        // Base Stats
        this.baseStats = {
            damage: 20,
            defense: 0,
            speed: 240, // 4 * 60
            maxHealth: 25,
            fireRate: 0.5, // 30 frames / 60
            crit: 0,
            dashDistance: 100,
            dashSpeed: 900 // 15 * 60
        };

        // Current Stats (Derived)
        this.bulletDamage = this.baseStats.damage;
        this.speed = this.baseStats.speed;
        this.maxHealth = this.baseStats.maxHealth;
        this.health = this.maxHealth;
        this.defense = this.baseStats.defense;
        this.fireRate = this.baseStats.fireRate;

        // Dash mechanics
        this.isDashing = false;
        this.maxDashCharges = 1;  // Can be increased later
        this.dashCharges = this.maxDashCharges;
        this.dashRechargeTimer = 0;
        this.dashRechargeDuration = 1.0; // 60 frames / 60
        this.dashDirection = { x: 0, y: 0 };
        this.dashTimer = 0;
        this.dashDuration = 0.16; // 10 frames / 60
        this.lastMoveDir = { x: 0, y: 0 };

        this.inventory = null;
    }

    setInventory(inventory) {
        this.inventory = inventory;
        this.updateStats();
    }

    updateStats() {
        if (!this.inventory) return;

        const bonus = this.inventory.getEquippedStats();

        this.bulletDamage = this.baseStats.damage + (bonus.damage || 0);
        this.defense = this.baseStats.defense + (bonus.defense || 0);

        // Handle Max Health changes
        const newMaxHealth = this.baseStats.maxHealth + (bonus.health || 0);
        if (newMaxHealth !== this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            this.maxHealth = newMaxHealth;
            this.health = this.maxHealth * healthPercent; // Maintain percentage
        }
    }

    update(mouseX, mouseY, isMouseDown, projectiles, deltaTime = 16.67) {
        // Use passed dt (seconds) or calculate from ms
        const dt = deltaTime < 1 ? deltaTime : deltaTime / 1000;

        // Calculate angle to mouse
        this.angle = Math.atan2(mouseY - this.y, mouseX - this.x);

        // Movement
        let dx = 0;
        let dy = 0;

        // Apply speed multiplier
        const currentSpeed = this.speed * (this.speedMultiplier || 1);

        if (this.moveUp) dy -= 1;
        if (this.moveDown) dy += 1;
        if (this.moveLeft) dx -= 1;
        if (this.moveRight) dx += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const mag = Math.sqrt(dx * dx + dy * dy);
            dx /= mag;
            dy /= mag;
        }

        // Store last movement direction for dash (but not while dashing)
        if (!this.isDashing && (dx !== 0 || dy !== 0)) {
            this.lastMoveDir = { x: dx, y: dy };
        }

        // Handle dash recharge
        if (this.dashCharges < this.maxDashCharges) {
            this.dashRechargeTimer += dt;
            if (this.dashRechargeTimer >= this.dashRechargeDuration) {
                this.dashCharges++;
                this.dashRechargeTimer = 0;
            }
        }

        if (this.isDashing) {
            // Continue dash - ignores movement flags
            this.x += this.dashDirection.x * this.baseStats.dashSpeed * dt;
            this.y += this.dashDirection.y * this.baseStats.dashSpeed * dt;
            this.dashTimer -= dt;

            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        } else {
            // Normal movement - uses movement flags
            this.x += dx * currentSpeed * dt;
            this.y += dy * currentSpeed * dt;
        }

        // Keep player in bounds
        this.x = Math.max(this.size, Math.min(this.canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.canvas.height - this.size, this.y));

        // Shooting with delta time
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt;
        }

        if (isMouseDown && this.fireCooldown <= 0) {
            this.shoot(projectiles);
            this.fireCooldown = this.fireRate;
        }

        // Update invulnerability with delta time
        if (this.invulnerable) {
            this.invulnerabilityTime += dt;
            if (this.invulnerabilityTime >= this.maxInvulnerabilityTime) {
                this.invulnerable = false;
                this.invulnerabilityTime = 0;
            }
        }

        // Reset speed multiplier at the END of the frame
        this.speedMultiplier = 1;
    }

    shoot(projectiles) {
        const bulletX = this.x + Math.cos(this.angle) * (this.size + 5);
        const bulletY = this.y + Math.sin(this.angle) * (this.size + 5);
        const vx = Math.cos(this.angle) * this.bulletSpeed;
        const vy = Math.sin(this.angle) * this.bulletSpeed;

        projectiles.push(new Projectile(bulletX, bulletY, vx, vy, this.bulletDamage, 'player', '#00ffff', 5));
    }

    dash() {
        if (this.dashCharges <= 0 || this.isDashing) return;

        // Use last movement direction, or mouse direction if not moving
        let dx = this.lastMoveDir.x;
        let dy = this.lastMoveDir.y;

        if (dx === 0 && dy === 0) {
            dx = Math.cos(this.angle);
            dy = Math.sin(this.angle);
        }

        this.dashDirection = { x: dx, y: dy };
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCharges--;

        if (this.dashCharges < this.maxDashCharges && this.dashRechargeTimer === 0) {
            this.dashRechargeTimer = 0;
        }
    }

    takeDamage(amount, particles, flags = {}) {
        if (this.invulnerable || this.debugInvincible) return;

        // Check for dash skippable damage
        if (flags.dashSkippable && this.isDashing) {
            return false; // Skipped damage
        }

        this.health -= amount;
        this.invulnerable = true;
        this.invulnerabilityTime = 0;

        // Spawn damage particles
        if (particles) {
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.x, this.y, '#ff0000', 4));
            }
        }

        if (this.health <= 0) {
            this.health = 0;
            return true; // Player died
        }
        return false;
    }

    draw(ctx) {
        ctx.save();

        // Flash when invulnerable
        if (this.invulnerable && Math.floor(this.invulnerabilityTime * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Player body
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ff88';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Direction indicator
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x + Math.cos(this.angle) * this.size * 1.5,
            this.y + Math.sin(this.angle) * this.size * 1.5
        );
        ctx.stroke();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getHealthPercent() {
        return (this.health / this.maxHealth) * 100;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    reset() {
        this.health = this.maxHealth;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.fireCooldown = 0;
    }
}
