// 1. CRIMSON REAPER - Melee Assassin
class CrimsonReaper extends Boss {
    constructor(x, y, canvas) {
        super(x, y, canvas);
        this.name = 'Crimson Reaper';
        this.color = '#dc143c';
        this.size = 25;
        this.speed = 168; // 2.8 * 60
        this.contactDamage = 3;
        this.maxHealth = 100; // Reduced from 120
        this.health = this.maxHealth;
        this.targetDistance = 50; // Prefers close range

        this.dashCooldown = 0.5; // Staggered start
        this.dashSpeed = 180; // 3 * 60
        this.isDashing = false;
        this.dashDuration = 0;
        this.dashAngle = 0;

        this.teleportCooldown = 1.5; // Staggered start
        this.isTeleporting = false;
        this.teleportCharge = 0;
        this.teleportTarget = { x: 0, y: 0 };

        // Phantom Strike
        this.phantomStrikeDashes = 0;
        this.phantomStrikeDelay = 0;
        this.phantomStrikeCooldown = 2.0; // Staggered start
        this.spinDuration = 0;
        this.tornadoCooldown = 2.5; // Staggered start
        this.bloodSlashCooldown = 1.0; // Staggered start

        // New Mechanics - Reflect Parry
        this.reflectParry = new ReflectParryMechanic({
            duration: 2.0,
            cooldown: 5.0,
            reflectionSpeedMultiplier: 1.5,
            reflectedColor: '#ffffff',
            indicatorColor: '#ffffff',
            indicatorSize: 10,
            glowIntensity: 20
        });

        this.executionCooldown = 0.5; // Staggered start
        this.isExecuting = false;
        this.executionCharge = 0;
        this.executionAngle = 0;


    }

    updateAI(player, distance, dt) {
        // Stand still during execution charge, teleport charge, tornado spin, or phantom strike
        if (this.isExecuting || this.isTeleporting || this.spinDuration > 0 || this.phantomStrikeDashes > 0) {
            return;
        }
        super.updateAI(player, distance, dt);
    }

    update(player, projectiles, level, particles, dt) {
        super.update(player, projectiles, level, particles, dt);

        // Phase 3: Blood Frenzy
        if (this.phase === 3) {
            this.speed = 270; // 4.5 * 60
            this.damageMultiplier = 1.5; // More damage
            // But takes more damage (handled in takeDamage)

            // Visual trail
            if (particles && Math.random() < 0.3) {
                particles.push(new Particle(this.x, this.y, '#ff0000', 3));
            }
        }
    }

    takeDamage(amount, particles) {
        // Reflect Parry Mechanic - projectile reflection is handled in game.js
        if (this.reflectParry.isActive()) {
            // Show visual feedback for successful parry
            if (particles) {
                for (let i = 0; i < 8; i++) {
                    particles.push(new Particle(this.x, this.y, '#ffffff', 4));
                }
            }
            console.log("Crimson Reaper Reflected!");
            return false; // No damage taken
        }

        // Blood Frenzy Vulnerability
        if (this.phase === 3) {
            amount *= 1.5;
        }

        return super.takeDamage(amount, particles);
    }

    handleAttacks(player, projectiles, level, particles, dt) {
        // Update reflect parry state
        this.reflectParry.update(dt);

        // Phase 1: Reflect Parry Stance (Level 5+)
        if (level >= 10 & this.phase >= 1 && !this.reflectParry.isOnCooldown() && !this.isExecuting && !this.isDashing) {
            if (Math.random() < 0.005) {
                if (this.reflectParry.activate()) {
                    this.color = '#ffffff'; // Visual indicator
                }
            }
        }

        // Reset color when parry ends
        if (!this.reflectParry.isActive() && this.color === '#ffffff') {
            this.color = '#dc143c';
        }

        // Don't perform other attacks while parrying
        if (this.reflectParry.isActive()) {
            return;
        }

        // Execution (Cone Attack) 1
        if (level >= 1 && this.phase >= 1 && this.executionCooldown <= 0 && !this.isDashing) {
            if (Math.random() < 0.008) {
                this.isExecuting = true;
                this.executionCharge = 1.0; // 60 frames / 60
                this.executionAngle = Math.atan2(player.y - this.y, player.x - this.x);
                this.executionCooldown = 3.33; // 400 frames / 60
            }
        }

        if (this.isExecuting) {
            this.executionCharge -= dt;
            if (this.executionCharge <= 0) {
                // FIRE!
                const coneAngle = Math.PI / 8; // 60 degrees
                const count = 8;
                for (let i = 0; i < count; i++) {
                    const a = this.executionAngle - coneAngle / 2 + (i / count) * coneAngle;
                    const speed = 1000 * this.projectileSpeedMultiplier;
                    projectiles.push(new Projectile(
                        this.x, this.y,
                        Math.cos(a) * speed, Math.sin(a) * speed,
                        25 * this.damageMultiplier, 'boss', '#8b0000', 8
                    ));
                }
                this.isExecuting = false;
            }
            return; // Don't move while charging
        }
        if (this.executionCooldown > 0) this.executionCooldown -= dt;

        // Dash Strike 1
        if (level >= 1 && this.executionCooldown <= 0 && this.dashCooldown <= 0 && !this.isDashing) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 300 && distance > 50) {
                this.isDashing = true;
                this.dashDuration = 0.25; // 15 frames / 60
                this.dashAngle = Math.atan2(dy, dx);
                this.dashCooldown = 2.0; // 120 frames / 60
            }
        }

        if (this.isDashing) {
            this.x += Math.cos(this.dashAngle) * this.dashSpeed * dt;
            this.y += Math.sin(this.dashAngle) * this.dashSpeed * dt;
            this.dashDuration -= dt;
            if (this.dashDuration <= 0) {
                this.isDashing = false;
                // Trigger execution after dash completes
                this.isExecuting = true;
                this.executionCharge = 1.0; // 60 frames / 60
                this.executionAngle = Math.atan2(player.y - this.y, player.x - this.x);
                this.executionCooldown = 3.33; // 400 frames / 60
            }
        }

        if (this.dashCooldown > 0) this.dashCooldown -= dt;

        // Ability 2: Blood Slash - Boomerang Scythes (Level 15+)
        if (level >= 15 && this.bloodSlashCooldown <= 0) {
            const count = 1 + Math.floor(this.projectileCount / 2); // 1-3 boomerangs based on phase
            for (let i = -count; i <= count; i++) {
                const angle = this.angle + (i * Math.PI / 6); // Wider spread for boomerangs
                const speed = 280 * this.projectileSpeedMultiplier;
                projectiles.push(new BoomerangProjectile(
                    this.x, this.y, angle, speed,
                    15 * this.damageMultiplier, 'boss', '#8b0000'
                ));
            }
            this.bloodSlashCooldown = 3.0; // 3 second cooldown for Blood Slash
        }
        if (this.bloodSlashCooldown > 0) this.bloodSlashCooldown -= dt;

        // Ability 3: Shadow Step (Level 1+) - Now with Telegraph!
        if (level >= 10 && this.teleportCooldown <= 0 && !this.isTeleporting && !this.isDashing) {
            // Start teleport charge
            this.isTeleporting = true;
            this.teleportCharge = 0.35;// 0.7 second telegraph

            // Calculate teleport destination (behind player)
            const dist = 80;
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.teleportTarget.x = player.x - Math.cos(angle) * dist;
            this.teleportTarget.y = player.y - Math.sin(angle) * dist;

            // Show telegraph particles
            if (particles) {
                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle(this.teleportTarget.x, this.teleportTarget.y, '#9370db', 4));
                }
            }
        }

        // Handle teleport charge
        if (this.isTeleporting) {
            this.teleportCharge -= dt;

            // Show charging particles
            if (particles && Math.random() < 0.3) {
                particles.push(new Particle(this.x, this.y, '#9370db', 3));
                particles.push(new Particle(this.teleportTarget.x, this.teleportTarget.y, '#9370db', 3));
            }

            if (this.teleportCharge <= 0) {
                // Execute teleport!
                this.x = this.teleportTarget.x;
                this.y = this.teleportTarget.y;

                // Spawn particles at arrival location
                if (particles) {
                    for (let i = 0; i < 20; i++) {
                        particles.push(new Particle(this.x, this.y, '#dc143c', 4));
                    }
                }

                this.isTeleporting = false;
                this.teleportCooldown = 5.0;
            }
        }
        if (this.teleportCooldown > 0) this.teleportCooldown -= dt;

        // Ability 4: Crimson Tornado (Level 20+)
        if (level >= 20 && this.spinDuration > 0 && !this.isTeleporting && this.phantomStrikeCooldown <= 0) {
            // Create spinning projectile tornado
            const angle = (Date.now() / 50) % (Math.PI * 2);
            const count = 8 + (this.projectileCount * 2);
            for (let i = 0; i < count; i++) {
                const a = angle + (i * Math.PI / (count / 2));
                const distance = this.size - 80;
                const px = this.x + Math.cos(a) * distance;
                const py = this.y + Math.sin(a) * distance;
                const speed = 180; // Shoot outward at decent speed
                projectiles.push(new Projectile(
                    px, py, Math.cos(a) * speed, Math.sin(a) * speed,
                    8 * this.damageMultiplier, 'boss', '#dc143c', 4, 2
                ));
            }
            this.spinDuration -= dt;
        } else if (level >= 20 && this.tornadoCooldown <= 0 && !this.isTeleporting && this.phantomStrikeCooldown <= 0 && Math.random() < 0.3) {
            this.spinDuration = 1.0; // 60 frames / 60
            this.tornadoCooldown = 6.0; // Separate cooldown for tornado
        }
        if (this.tornadoCooldown > 0) this.tornadoCooldown -= dt;

        // Ability 5: Phantom Strike Series (Level 1+)
        if (level >= 15 && this.phantomStrikeCooldown <= 0 && !this.isDashing && !this.isTeleporting && !this.isExecuting && this.spinDuration <= 0) {
            if (Math.random() < 0.005) {
                // Start phantom strike sequence
                this.phantomStrikeDashes = 3 + Math.floor(Math.random() * 2); // 3-4 dashes
                this.phantomStrikeDelay = 0;
                this.phantomStrikeCooldown = 8.0; // Long cooldown for this powerful ability
            }
        }

        // Handle Phantom Strike dashes
        if (this.phantomStrikeDashes > 0) {
            this.phantomStrikeDelay -= dt;

            if (this.phantomStrikeDelay <= 0) {
                // Perform a dash in a semi-random direction
                const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
                const randomOffset = (Math.random() - 0.5) * Math.PI; // Random angle offset
                const dashAngle = angleToPlayer + randomOffset;
                const dashDistance = 100 + Math.random() * 50; // Random distance 100-150

                // Calculate dash destination
                const targetX = this.x + Math.cos(dashAngle) * dashDistance;
                const targetY = this.y + Math.sin(dashAngle) * dashDistance;

                // Spawn afterimage particles at current position
                if (particles) {
                    for (let i = 0; i < 15; i++) {
                        particles.push(new Particle(this.x, this.y, '#8b0000', 5));
                    }
                }

                // Teleport to new position (instant dash)
                this.x = Math.max(50, Math.min(this.canvas.width - 50, targetX));
                this.y = Math.max(50, Math.min(this.canvas.height - 50, targetY));

                // Spawn arrival particles
                if (particles) {
                    for (let i = 0; i < 15; i++) {
                        particles.push(new Particle(this.x, this.y, '#dc143c', 5));
                    }
                }

                this.phantomStrikeDashes--;
                this.phantomStrikeDelay = 0.2; // Short delay between dashes
            }
        }

        if (this.phantomStrikeCooldown > 0) this.phantomStrikeCooldown -= dt;
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw Reflect Parry Stance using the mechanic's draw method
        this.reflectParry.draw(ctx, this.x, this.y, this.size);

        // Draw Teleport Telegraph
        if (this.isTeleporting) {
            const progress = 1 - (this.teleportCharge / 0.7);
            const pulseSize = 30 + Math.sin(Date.now() / 100) * 10;

            // Draw target location indicator
            ctx.save();
            ctx.fillStyle = `rgba(147, 112, 219, ${0.3 + progress * 0.3})`;
            ctx.strokeStyle = '#9370db';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#9370db';

            // Pulsing circle at destination
            ctx.beginPath();
            ctx.arc(this.teleportTarget.x, this.teleportTarget.y, pulseSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Progress ring
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.teleportTarget.x, this.teleportTarget.y, pulseSize + 10, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
            ctx.stroke();

            // Draw line connecting current and target position
            ctx.strokeStyle = `rgba(147, 112, 219, ${0.3 + progress * 0.4})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.teleportTarget.x, this.teleportTarget.y);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.restore();
        }

        // Draw Execution Telegraph
        if (this.isExecuting) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.arc(this.x, this.y, 200, this.executionAngle - Math.PI / 6, this.executionAngle + Math.PI / 6);
            ctx.lineTo(this.x, this.y);
            ctx.fill();

            // Progress indicator
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            const progress = 1 - (this.executionCharge / 1.0);
            ctx.beginPath();
            ctx.arc(this.x, this.y, 200 * progress, this.executionAngle - Math.PI / 6, this.executionAngle + Math.PI / 6);
            ctx.stroke();
            ctx.restore();
        }

        // Add visual effects for special moves
        if (this.spinDuration > 0) {
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;

            for (let i = 0; i < 6; i++) {
                const angle = (Date.now() / 100 + i * Math.PI / 3) % (Math.PI * 2);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size + 25, angle, angle + Math.PI / 3);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
}
