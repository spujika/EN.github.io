// Base Boss Class
class Boss {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.size = 30;
        this.speed = 1.2;
        this.maxHealth = 200;
        this.health = this.maxHealth;
        this.angle = 0;

        // Attack properties
        this.attackCooldown = 0;
        this.attackCooldownMax = 120; // 2 seconds at 60fps
        this.damageMultiplier = 1;
        this.projectileSpeedMultiplier = 0.75; // Reduced global speed
        this.projectileCount = 0;
        this.contactDamage = 1;
        this.regeneration = 0;
        this.damageReduction = 0;

        // Phase System
        this.phase = 1;
        this.phaseThresholds = [0.6, 0.3]; // 60% and 30% HP
        this.hasTriggeredPhase2 = false;
        this.hasTriggeredPhase3 = false;

        // AI state
        this.targetDistance = 200;
        this.aiState = 'chase'; // chase, strafe, retreat
        this.aiTimer = 0;

        // Visual
        this.color = '#ff0000';
        this.flashTime = 0;

        this.name = 'Boss';
    }

    update(player, projectiles, level, particles) {
        // Calculate angle to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // AI movement
        this.updateAI(player, distance);

        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        // Regeneration
        if (this.regeneration > 0) {
            this.health = Math.min(this.maxHealth, this.health + this.regeneration / 60);
        }

        // Flash effect
        if (this.flashTime > 0) {
            this.flashTime--;
        }

        // Phase Transitions
        const healthPercent = this.health / this.maxHealth;
        if (!this.hasTriggeredPhase3 && healthPercent <= this.phaseThresholds[1]) {
            this.enterPhase(3);
        } else if (!this.hasTriggeredPhase2 && healthPercent <= this.phaseThresholds[0]) {
            this.enterPhase(2);
        }

        // Attack based on level
        this.handleAttacks(player, projectiles, level, particles);
    }

    enterPhase(phase) {
        this.phase = phase;
        if (phase === 2) {
            this.hasTriggeredPhase2 = true;
            console.log(`${this.name} entering Phase 2!`);
            // Visual flare for phase change could go here
        } else if (phase === 3) {
            this.hasTriggeredPhase3 = true;
            console.log(`${this.name} entering Phase 3!`);
        }
    }

    updateAI(player, distance) {
        this.aiTimer++;

        // Change state periodically
        if (this.aiTimer > 180) { // Every 3 seconds
            this.aiTimer = 0;
            const rand = Math.random();
            if (distance > this.targetDistance) {
                this.aiState = 'chase';
            } else if (distance < 100) {
                this.aiState = 'retreat';
            } else {
                this.aiState = rand < 0.5 ? 'strafe' : 'chase';
            }
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);

        switch (this.aiState) {
            case 'chase':
                this.x += Math.cos(angle) * this.speed;
                this.y += Math.sin(angle) * this.speed;
                break;
            case 'retreat':
                this.x -= Math.cos(angle) * this.speed;
                this.y -= Math.sin(angle) * this.speed;
                break;
            case 'strafe':
                const perpAngle = angle + Math.PI / 2;
                this.x += Math.cos(perpAngle) * this.speed;
                this.y += Math.sin(perpAngle) * this.speed;
                break;
        }

        // Keep in bounds
        this.x = Math.max(this.size, Math.min(this.canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.canvas.height - this.size, this.y));
    }

    handleAttacks(player, projectiles, level, particles) {
        // Override in subclasses
    }

    takeDamage(amount, particles) {
        const actualDamage = amount * (1 - this.damageReduction);
        this.health -= actualDamage;
        this.flashTime = 5;

        // Spawn damage particles
        if (particles) {
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(this.x, this.y, this.color, 5));
            }
        }

        return this.health <= 0;
    }

    draw(ctx) {
        ctx.save();

        // Flash white when damaged
        if (this.flashTime > 0) {
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#ffffff';
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
        }

        // Boss body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Health bar above boss
        const barWidth = this.size * 2;
        const barHeight = 6;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size - 15;

        ctx.fillStyle = '#000000';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        ctx.restore();
    }

    reset() {
        this.health = this.maxHealth;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 4;
        this.attackCooldown = 0;
    }
}
