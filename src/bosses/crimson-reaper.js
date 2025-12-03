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

        this.dashCooldown = 0;
        this.dashSpeed = 180; // 3 * 60
        this.isDashing = false;
        this.dashDuration = 0;
        this.dashAngle = 0;

        this.teleportCooldown = 0;
        this.spinDuration = 0;

        // New Mechanics
        this.parryActive = false;
        this.parryCooldown = 0;
        this.parryDuration = 0;

        this.executionCooldown = 0;
        this.isExecuting = false;
        this.executionCharge = 0;
        this.executionAngle = 0;

        // Ability Pool
        this.abilityPool = ['dashStrike', 'bloodSlash', 'shadowStep', 'crimsonTornado', 'reapersDance'];
        this.startingAbility = 'bloodSlash';
    }

    updateAI(player, distance, dt) {
        // Stand still during execution charge
        if (this.isExecuting) {
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
        // Parry Mechanic
        if (this.parryActive) {
            // Reflect damage!
            // We can't easily access the player here to damage them directly unless we pass player to takeDamage
            // But we can return false (no damage taken) and maybe spawn a "Reflected" projectile?
            // For now, let's just negate damage and show visual feedback
            if (particles) {
                for (let i = 0; i < 8; i++) {
                    particles.push(new Particle(this.x, this.y, '#ffffff', 4));
                }
            }
            console.log("Crimson Reaper Parried!");
            return false;
        }

        // Blood Frenzy Vulnerability
        if (this.phase === 3) {
            amount *= 1.5;
        }

        return super.takeDamage(amount, particles);
    }

    handleAttacks(player, projectiles, level, particles, dt) {
        // Phase 2+: Parry Stance (Level 5+)
        if (level >= 5 && this.phase >= 2 && this.parryCooldown === 0 && !this.isExecuting && !this.isDashing) {
            if (Math.random() < 0.005) {
                this.parryActive = true;
                this.parryDuration = 2.0; // 120 frames / 60
                this.parryCooldown = 5.0; // 300 frames / 60
                this.color = '#ffffff'; // Visual indicator
            }
        }

        if (this.parryActive) {
            this.parryDuration -= dt;
            if (this.parryDuration <= 0) {
                this.parryActive = false;
                this.color = '#dc143c'; // Reset color
            }
            return; // No other attacks while parrying
        }
        if (this.parryCooldown > 0) this.parryCooldown -= dt;

        // Phase 2+: Execution (Cone Attack) (Level 5+)
        if (level >= 5 && this.phase >= 2 && this.executionCooldown === 0 && !this.isDashing) {
            if (Math.random() < 0.008) {
                this.isExecuting = true;
                this.executionCharge = 1.0; // 60 frames / 60
                this.executionAngle = Math.atan2(player.y - this.y, player.x - this.x);
                this.executionCooldown = 6.66; // 400 frames / 60
            }
        }

        if (this.isExecuting) {
            this.executionCharge -= dt;
            if (this.executionCharge <= 0) {
                // FIRE!
                const coneAngle = Math.PI / 3; // 60 degrees
                const count = 10;
                for (let i = 0; i < count; i++) {
                    const a = this.executionAngle - coneAngle / 2 + (i / count) * coneAngle;
                    const speed = 360 * this.projectileSpeedMultiplier; // 6 * 60
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


        // Ability 1: Dash Strike
        if (this.unlockedAbilities.includes('dashStrike') && this.dashCooldown === 0 && !this.isDashing) {
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
            }
        }

        if (this.dashCooldown > 0) this.dashCooldown -= dt;

        // Ability 2: Blood Slash
        if (this.unlockedAbilities.includes('bloodSlash') && this.attackCooldown === 0) {
            const count = 2 + this.projectileCount;
            for (let i = -count; i <= count; i++) {
                const angle = this.angle + (i * Math.PI / 8);
                const speed = 300 * this.projectileSpeedMultiplier; // 5.0 * 60
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                projectiles.push(new Projectile(
                    this.x, this.y, vx, vy,
                    15 * this.damageMultiplier, 'boss', '#8b0000', 6
                ));
            }
            this.attackCooldown = this.attackCooldownMax;
        }

        // Ability 3: Shadow Step
        if (this.unlockedAbilities.includes('shadowStep') && this.teleportCooldown === 0) {
            // Teleport behind player
            const dist = 80;
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x = player.x - Math.cos(angle) * dist;
            this.y = player.y - Math.sin(angle) * dist;

            // Spawn particles at teleport location
            if (particles) {
                for (let i = 0; i < 20; i++) {
                    particles.push(new Particle(this.x, this.y, '#dc143c', 4));
                }
            }

            this.teleportCooldown = 5.0; // 300 frames / 60
        }
        if (this.teleportCooldown > 0) this.teleportCooldown -= dt;

        // Ability 4: Crimson Tornado
        if (this.unlockedAbilities.includes('crimsonTornado') && this.spinDuration > 0) {
            // Create damage zone while spinning
            const angle = (Date.now() / 50) % (Math.PI * 2);
            const count = 8 + (this.projectileCount * 2);
            for (let i = 0; i < count; i++) {
                const a = angle + (i * Math.PI / (count / 2));
                const distance = this.size + 20;
                const px = this.x + Math.cos(a) * distance;
                const py = this.y + Math.sin(a) * distance;
                projectiles.push(new Projectile(
                    px, py, Math.cos(a) * 2.0, Math.sin(a) * 2.0,
                    8 * this.damageMultiplier, 'boss', '#dc143c', 4
                ));
            }
            this.spinDuration -= dt;
        } else if (this.unlockedAbilities.includes('crimsonTornado') && this.attackCooldown === 0 && Math.random() < 0.3) {
            this.spinDuration = 1.0; // 60 frames / 60
            this.attackCooldown = this.attackCooldownMax * 2;
        }

        // Ability 5: Reaper's Dance
        if (this.unlockedAbilities.includes('reapersDance') && !this.isDashing && Math.random() < 0.01) {
            // This is handled by multiple dash attacks
            this.dashCooldown = Math.max(0, this.dashCooldown - 1.0); // 60 frames / 60
        }
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw Parry Stance
        if (this.parryActive) {
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 10, 0, Math.PI * 2);
            ctx.stroke();
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
