// 2. VOID SORCERER - Ranged Caster
class VoidSorcerer extends Boss {
    constructor(x, y, canvas) {
        super(x, y, canvas);
        this.name = 'Void Sorcerer';
        this.color = '#8a2be2';
        this.size = 28;
        this.speed = 60; // 1.0 * 60
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.targetDistance = 300; // Prefers long range



        this.orbs = [];
        this.gravityWells = [];
        this.voidRifts = [];
        this.darkStarCharging = false;
        this.darkStarCharge = 0;

        // New Mechanics
        this.blackHoleActive = false;
        this.blackHoleDuration = 0;
        this.blackHoleCooldown = 1.0; // Staggered start
        this.blackHoleRadius = 60;

        this.bulletHellActive = false;
        this.bulletHellAngle = 0;
        this.bulletHellDuration = 0;
    }

    takeDamage(amount, particles) {
        if (this.blackHoleActive) {
            return false; // Immune during Black Hole
        }
        return super.takeDamage(amount, particles);
    }

    update(player, projectiles, level, particles, dt) {
        super.update(player, projectiles, level, particles, dt);

        // Black Hole Logic (Phase 2+)
        if (this.blackHoleActive) {
            // Pull player
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 10) {
                // Changed to linear falloff for stronger pull at range
                const pullStrength = 200 / (dist + 20);
                player.x += (dx / dist) * pullStrength * 5;
                player.y += (dy / dist) * pullStrength * 5;
            }

            // Damage if too close
            if (dist < this.blackHoleRadius) {
                if (player.takeDamage(1, particles)) { // Fast tick damage
                    // Player died handling in game loop usually, but takeDamage returns true if dead
                }
            }

            this.blackHoleDuration -= dt;
            if (this.blackHoleDuration <= 0) {
                this.blackHoleActive = false;
                this.aiState = 'chase'; // Resume movement
            }
        } else if (level >= 5 && this.phase >= 2 && this.blackHoleCooldown <= 0 && Math.random() < 0.005) {
            // Activate Black Hole
            this.blackHoleActive = true;
            this.blackHoleDuration = 5.0; // 300 frames / 60
            this.blackHoleCooldown = 10.0; // 600 frames / 60

            // Teleport to center
            this.x = this.canvas.width / 2;
            this.y = this.canvas.height / 2;
            this.aiState = 'stationary'; // Stop moving

            console.log("Void Sorcerer: Black Hole Active!");
        }
        if (this.blackHoleCooldown > 0) this.blackHoleCooldown -= dt;

        // Bullet Hell Logic (Phase 3) (Level 5+)
        if (level >= 5 && this.phase === 3) {
            // Rotate bullet hell pattern
            if (this.bulletHellActive) {
                this.bulletHellAngle += 0.05;

                // Spawn spiral projectiles
                if (Date.now() % 10 === 0) { // Every few frames
                    for (let i = 0; i < 4; i++) {
                        const angle = this.bulletHellAngle + (i * Math.PI / 2);
                        const speed = 240 * this.projectileSpeedMultiplier; // 4 * 60
                        projectiles.push(new Projectile(
                            this.x, this.y,
                            Math.cos(angle) * speed, Math.sin(angle) * speed,
                            10 * this.damageMultiplier, 'boss', '#8a2be2', 4
                        ));
                    }
                }

                this.bulletHellDuration -= dt;
                if (this.bulletHellDuration <= 0) {
                    this.bulletHellActive = false;
                }
            } else if (Math.random() < 0.01) {
                this.bulletHellActive = true;
                this.bulletHellDuration = 3.0; // 180 frames / 60
            }
        }
    }

    updateAI(player, distance, dt) {
        if (this.blackHoleActive) return; // Don't move
        super.updateAI(player, distance, dt);
    }

    handleAttacks(player, projectiles, level, particles, dt) {
        // Ability 1: Dark Bolt (Level 5+)
        if (level >= 5 && this.attackCooldown <= 0 && !this.blackHoleActive) {
            const count = 1 + this.projectileCount;
            for (let i = 0; i < count; i++) {
                const spread = (i - (count - 1) / 2) * 0.2;
                projectiles.push(new HomingProjectile(
                    this.x, this.y, 180 * this.projectileSpeedMultiplier, // 3.0 * 60
                    6 * this.damageMultiplier, 'boss', player, '#8a2be2'
                ));
                // Homing projectiles adjust their own angle, but we could offset start position slightly
                projectiles[projectiles.length - 1].x += Math.cos(this.angle + Math.PI / 2) * spread * 20;
                projectiles[projectiles.length - 1].y += Math.sin(this.angle + Math.PI / 2) * spread * 20;
            }
            this.attackCooldown = this.attackCooldownMax;
        }

        // Ability 2: Void Orbs (Level 1+)
        if (level >= 1) {
            // Maintain orbiting orbs
            this.orbs = this.orbs.filter(orb => orb.active);
            const maxOrbs = 3 + this.projectileCount;
            while (this.orbs.length < maxOrbs) {
                this.orbs.push({
                    angle: Math.random() * Math.PI * 2,
                    distance: this.size + 40,
                    shootCooldown: 1.0, // 60 frames / 60
                    active: true
                });
            }

            this.orbs.forEach(orb => {
                orb.angle += 0.05 * dt;
                orb.shootCooldown -= dt;

                if (orb.shootCooldown <= 0) {
                    const orbX = this.x + Math.cos(orb.angle) * orb.distance;
                    const orbY = this.y + Math.sin(orb.angle) * orb.distance;
                    const angle = Math.atan2(player.y - orbY, player.x - orbX);
                    const speed = 4.5 * this.projectileSpeedMultiplier;

                    projectiles.push(new Projectile(
                        orbX, orbY,
                        Math.cos(angle) * speed, Math.sin(angle) * speed,
                        10 * this.damageMultiplier, 'boss', '#9370db', 5
                    ));
                    orb.shootCooldown = 1.5; // 90 frames / 60
                }
            });
        }

        // Ability 3: Gravity Well (Level 10+)
        if (level >= 10 && Math.random() < 0.008 && !this.blackHoleActive) {
            this.gravityWells.push({
                x: player.x,
                y: player.y,
                radius: 80,
                strength: 0.5,
                lifetime: 3.0, // 180 frames / 60
                age: 0
            });
        }

        this.gravityWells = this.gravityWells.filter(well => {
            well.age += dt;
            return well.age < well.lifetime;
        });

        // Ability 4: Void Rift (Level 15+)
        if (level >= 15 && Math.random() < 0.005 && !this.blackHoleActive) {
            const angle = Math.random() * Math.PI * 2;
            this.voidRifts.push({
                x: this.canvas.width / 2 + Math.cos(angle) * 200,
                y: this.canvas.height / 2 + Math.sin(angle) * 200,
                angle: angle,
                lifetime: 2.0, // 120 frames / 60
                age: 0,
                shootTimer: 0
            });
        }

        this.voidRifts = this.voidRifts.filter(rift => {
            rift.age += dt;
            rift.shootTimer += dt;

            if (rift.shootTimer > 0.16) { // 10 frames / 60
                const speed = 300 * this.projectileSpeedMultiplier; // 5.0 * 60
                const count = 1 + this.projectileCount;
                for (let i = 0; i < count; i++) {
                    const spread = (i - (count - 1) / 2) * 0.3;
                    projectiles.push(new Projectile(
                        rift.x, rift.y,
                        Math.cos(rift.angle + spread) * speed, Math.sin(rift.angle + spread) * speed,
                        12 * this.damageMultiplier, 'boss', '#4b0082', 6
                    ));
                }
                rift.shootTimer = 0;
            }

            return rift.age < rift.lifetime;
        });

        // Ability 5: Dark Star (Level 20+)
        if (level >= 20 && !this.blackHoleActive) {
            if (!this.darkStarCharging && Math.random() < 0.002) {
                this.darkStarCharging = true;
                this.darkStarCharge = 0;
            }

            if (this.darkStarCharging) {
                this.darkStarCharge += dt;
                if (this.darkStarCharge >= 2.0) { // 120 frames / 60
                    // Create massive explosion
                    projectiles.push(new ExplodingProjectile(
                        this.x, this.y, 0, 0,
                        30 * this.damageMultiplier, 'boss', '#8a2be2'
                    ));
                    projectiles[projectiles.length - 1].explode();
                    projectiles[projectiles.length - 1].explosionRadius = 150;

                    this.darkStarCharging = false;
                    this.darkStarCharge = 0;
                }
            }
        }
    }

    applyGravityWells(player) {
        this.gravityWells.forEach(well => {
            const dx = well.x - player.x;
            const dy = well.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < well.radius) {
                const pull = well.strength * (1 - distance / well.radius);
                player.x += (dx / distance) * pull;
                player.y += (dy / distance) * pull;
            }
        });
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw Black Hole
        if (this.blackHoleActive) {
            ctx.save();
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 50;
            ctx.shadowColor = '#4b0082';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.blackHoleRadius, 0, Math.PI * 2);
            ctx.fill();

            // Accretion disk effect
            ctx.strokeStyle = '#8a2be2';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.blackHoleRadius * 1.5, 0, Math.PI * 2);
            ctx.stroke();

            // Particle suck effect (visual only)
            const time = Date.now() / 100;
            for (let i = 0; i < 8; i++) {
                const angle = time + (i * Math.PI / 4);
                const r = this.blackHoleRadius * (1.5 + Math.sin(time * 2 + i) * 0.5);
                ctx.beginPath();
                ctx.arc(this.x + Math.cos(angle) * r, this.y + Math.sin(angle) * r, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
            ctx.restore();
        }

        // Draw orbs
        this.orbs.forEach(orb => {
            const x = this.x + Math.cos(orb.angle) * orb.distance;
            const y = this.y + Math.sin(orb.angle) * orb.distance;

            ctx.save();
            ctx.fillStyle = '#9370db';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#9370db';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw gravity wells
        this.gravityWells.forEach(well => {
            const alpha = 1 - (well.age / well.lifetime);
            ctx.save();
            ctx.globalAlpha = alpha * 0.5;
            ctx.strokeStyle = '#4b0082';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#4b0082';

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(well.x, well.y, well.radius - i * 20, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        });

        // Draw void rifts
        this.voidRifts.forEach(rift => {
            ctx.save();
            ctx.strokeStyle = '#4b0082';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#4b0082';
            ctx.beginPath();
            ctx.moveTo(
                rift.x - Math.cos(rift.angle + Math.PI / 2) * 30,
                rift.y - Math.sin(rift.angle + Math.PI / 2) * 30
            );
            ctx.lineTo(
                rift.x + Math.cos(rift.angle + Math.PI / 2) * 30,
                rift.y + Math.sin(rift.angle + Math.PI / 2) * 30
            );
            ctx.stroke();
            ctx.restore();
        });

        // Draw dark star charging
        if (this.darkStarCharging) {
            const progress = this.darkStarCharge / 2.0; // 120 frames / 60
            ctx.save();
            ctx.fillStyle = '#8a2be2';
            ctx.shadowBlur = 40 * progress;
            ctx.shadowColor = '#8a2be2';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * (1 + progress), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
