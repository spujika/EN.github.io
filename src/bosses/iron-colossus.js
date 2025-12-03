
// 3. IRON COLOSSUS - Tank
class IronColossus extends Boss {
    constructor(x, y, canvas) {
        super(x, y, canvas);
        this.name = 'Iron Colossus';
        this.color = '#696969';
        this.size = 40;
        this.speed = 36; // 0.6 * 60
        this.maxHealth = 250;
        this.health = this.maxHealth;
        this.targetDistance = 150;



        this.slamCooldown = 0.5; // Staggered start
        this.isCharging = false;
        this.chargeAngle = 0;
        this.chargeSpeed = 300; // 5 * 60
        this.chargeDuration = 0;
        this.bounceCount = 0;

        // New Mechanics: Armor Plating & Shield Generators
        this.shieldGenerators = [];
        this.armorActive = false;
        this.shieldOrbitAngle = 0;
    }

    update(player, projectiles, level, particles, dt) {
        super.update(player, projectiles, level, particles, dt);
        this.updateShields(projectiles, particles, level, dt);
    }

    updateShields(projectiles, particles, level, dt) {
        // Activate Armor in Phase 2 (Level 5+)
        if (level >= 5 && this.phase >= 2 && this.shieldGenerators.length === 0 && !this.armorBroken) {
            if (!this.armorActive) {
                this.armorActive = true;
                this.armorBroken = false; // Reset broken state
                // Spawn 3 generators
                for (let i = 0; i < 3; i++) {
                    this.shieldGenerators.push({
                        angle: (i / 3) * Math.PI * 2,
                        health: 40,
                        maxHealth: 40,
                        size: 15,
                        active: true
                    });
                }
                console.log('Iron Colossus: Armor Plating Active!');
            }
        }

        // Update generators
        if (this.armorActive) {
            this.shieldOrbitAngle += 1.2 * dt; // 0.02 * 60
            this.shieldGenerators.forEach(gen => {
                gen.x = this.x + Math.cos(gen.angle + this.shieldOrbitAngle) * (this.size + 40);
                gen.y = this.y + Math.sin(gen.angle + this.shieldOrbitAngle) * (this.size + 40);
            });

            // Check if all destroyed
            if (this.shieldGenerators.length === 0) {
                this.armorActive = false;
                this.armorBroken = true; // Prevent immediate respawn
                this.damageReduction = 0;
                console.log('Iron Colossus: Armor Broken!');
            } else {
                this.damageReduction = 0.9; // 90% reduction
            }
        }
    }

    takeDamage(amount, particles) {
        // Check collision with shield generators first
        // This logic is tricky because takeDamage is usually called by the projectile hitting the boss
        // We might need to handle generator collision in the projectile loop or here if we can check source
        // For now, let's assume projectiles hitting the boss MIGHT hit a shield if it's in the way?
        // Actually, it's better if the game loop checks collision with generators separately.
        // But since we don't want to rewrite the main game loop, let's just say:
        // If armor is active, damage is reduced. To damage generators, the player needs to aim at them.
        // We need to expose generators as targets.

        // Override: If armor is active, reduce damage
        if (this.armorActive) {
            amount *= (1 - this.damageReduction);
            // Visual feedback for armor hit
            if (particles) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, '#a9a9a9', 3));
                }
            }
        }

        return super.takeDamage(amount, particles);
    }

    // Helper to check collision with generators (called from Game class potentially, or we handle it here?)
    // Ideally, the Game class should know about sub-entities. 
    // For now, let's hack it: The Game class checks collision with Boss. 
    // We can add a method `checkProjectileCollision` to Boss that handles sub-parts.

    checkProjectileCollision(projectile) {
        if (this.armorActive) {
            for (let i = this.shieldGenerators.length - 1; i >= 0; i--) {
                const gen = this.shieldGenerators[i];
                const dx = projectile.x - gen.x;
                const dy = projectile.y - gen.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < gen.size + projectile.size) {
                    // Hit generator
                    gen.health -= projectile.damage;
                    if (gen.health <= 0) {
                        this.shieldGenerators.splice(i, 1);
                    }
                    return true; // Handled
                }
            }
        }
        return false; // Not handled, check main body
    }

    handleAttacks(player, projectiles, level, particles, dt) {
        // Ability 1: Ground Slam (Level 1+)
        if (level >= 1 && this.slamCooldown <= 0) {
            // Create shockwave
            const step = Math.PI / (8 + this.projectileCount * 2);
            for (let angle = 0; angle < Math.PI * 2; angle += step) {
                const speed = 120 * this.projectileSpeedMultiplier; // 2 * 60
                projectiles.push(new Projectile(
                    this.x, this.y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    18 * this.damageMultiplier, 'boss', '#a9a9a9', 8
                ));
            }
            this.slamCooldown = this.attackCooldownMax * 1.5;
        }
        if (this.slamCooldown > 0) this.slamCooldown -= dt;

        // Ability 2: Boulder Toss (Level 5+)
        if (level >= 5 && this.attackCooldown <= 0) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const speed = 270 * this.projectileSpeedMultiplier; // 4.5 * 60
            const count = 1 + this.projectileCount;

            for (let i = 0; i < count; i++) {
                const spread = (i - (count - 1) / 2) * 0.2;
                projectiles.push(new BouncingProjectile(
                    this.x, this.y,
                    Math.cos(angle + spread) * speed, Math.sin(angle + spread) * speed,
                    20 * this.damageMultiplier, 'boss', '#8b4513'
                ));
            }
            this.attackCooldown = this.attackCooldownMax;
        }

        // Ability 3: Charge Rush (Level 10+)
        if (level >= 10 && !this.isCharging && Math.random() < 0.005) {
            this.isCharging = true;
            this.chargeAngle = Math.atan2(player.y - this.y, player.x - this.x);
            this.chargeDuration = 1.0; // 60 frames / 60
            this.bounceCount = 0;
        }

        if (this.isCharging) {
            this.x += Math.cos(this.chargeAngle) * this.chargeSpeed * dt;
            this.y += Math.sin(this.chargeAngle) * this.chargeSpeed * dt;

            // Bounce off walls
            if (this.x < this.size || this.x > this.canvas.width - this.size) {
                this.chargeAngle = Math.PI - this.chargeAngle;
                this.x = Math.max(this.size, Math.min(this.canvas.width - this.size, this.x));
                this.bounceCount++;
            }
            if (this.y < this.size || this.y > this.canvas.height - this.size) {
                this.chargeAngle = -this.chargeAngle;
                this.y = Math.max(this.size, Math.min(this.canvas.height - this.size, this.y));
                this.bounceCount++;
            }

            this.chargeDuration -= dt;
            if (this.chargeDuration <= 0 || this.bounceCount > 3) {
                this.isCharging = false;
            }
        }

        // Phase 3: Meltdown (Lava Trail) (Level 5+)
        if (level >= 5 && this.phase === 3) {
            if (particles && Math.random() < 0.2) {
                particles.push(new Particle(this.x, this.y, '#ff4500', 4));
                // Ideally this would leave a damaging zone, but for now visual only
            }
            // Increase attack speed in Phase 3
            if (this.attackCooldown > 0) this.attackCooldown -= dt;
        }

        // Ability 4: Seismic Fissure (Level 15+)
        if (level >= 15 && Math.random() < 0.004) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);

            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const distance = i * 40 + this.size;
                    const px = this.x + Math.cos(angle) * distance;
                    const py = this.y + Math.sin(angle) * distance;

                    projectiles.push(new ExplodingProjectile(
                        px, py, 0, 0,
                        15 * this.damageMultiplier, 'boss', '#d2691e'
                    ));
                    projectiles[projectiles.length - 1].explode();
                    projectiles[projectiles.length - 1].explosionRadius = 40;
                }, i * 100);
            }
        }

        // Ability 5: Earthquake (Level 20+)
        if (level >= 20 && Math.random() < 0.001) {
            // Create multiple explosion zones with safe spots
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const x = Math.random() * this.canvas.width;
                    const y = Math.random() * this.canvas.height;

                    projectiles.push(new ExplodingProjectile(
                        x, y, 0, 0,
                        25 * this.damageMultiplier, 'boss', '#8b0000'
                    ));
                    projectiles[projectiles.length - 1].explode();
                    projectiles[projectiles.length - 1].explosionRadius = 70;
                }, i * 200);
            }
        }
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw Armor Plating visual
        if (this.armorActive) {
            ctx.save();
            ctx.strokeStyle = '#00bfff';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00bfff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Draw Shield Generators
        if (this.shieldGenerators && this.shieldGenerators.length > 0) {
            this.shieldGenerators.forEach(gen => {
                ctx.save();
                ctx.fillStyle = '#00bfff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00bfff';
                ctx.beginPath();
                ctx.arc(gen.x, gen.y, gen.size, 0, Math.PI * 2);
                ctx.fill();

                // Draw health bar for generator
                const hpPct = gen.health / gen.maxHealth;
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(gen.x - 10, gen.y - 20, 20 * hpPct, 4);
                ctx.restore();
            });
        }

        // Draw charge effect
        if (this.isCharging) {
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 5;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff6600';

            for (let i = 1; i <= 3; i++) {
                ctx.globalAlpha = 0.7 - i * 0.2;
                ctx.beginPath();
                ctx.arc(
                    this.x - Math.cos(this.chargeAngle) * i * 15,
                    this.y - Math.sin(this.chargeAngle) * i * 15,
                    this.size, 0, Math.PI * 2
                );
                ctx.stroke();
            }
            ctx.restore();
        }
    }
}
