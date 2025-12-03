
// 5. CHAOS PHANTOM - Unpredictable
class ChaosPhantom extends Boss {
    constructor(x, y, canvas) {
        super(x, y, canvas);
        this.name = 'Chaos Phantom';
        this.color = '#ff00ff';
        this.size = 26;
        this.speed = 1.7;
        this.maxHealth = 190;
        this.health = this.maxHealth;
        this.targetDistance = 200;

        this.clones = [];
        this.controlsInverted = false;
        this.controlsInvertDuration = 0;
        this.attackPattern = 'random';

        // New Mechanics
        this.realCloneActive = false;
        this.screenTearActive = false;
        this.screenTearDuration = 0;
        this.cloneCooldown = 0;
        this.screenTearCooldown = 0;
        this.hasUsedClonePhase2 = false;
        this.hasUsedClonePhase3 = false;
    }

    takeDamage(amount, particles) {
        if (this.realCloneActive) {
            // When real boss is hit during clone phase, end the phase immediately
            this.realCloneActive = false;
            this.clones = []; // Destroy all clones
            this.aiState = 'chase'; // Resume movement
            return super.takeDamage(amount, particles);
        }
        return super.takeDamage(amount, particles);
    }

    update(player, projectiles, level, particles) {
        super.update(player, projectiles, level, particles);

        // Phase 2+: Real Clone Mechanic (Once per phase)
        if (this.phase === 2 && !this.hasUsedClonePhase2 && !this.realCloneActive) {
            this.activateRealClone();
            this.hasUsedClonePhase2 = true;
        } else if (this.phase === 3 && !this.hasUsedClonePhase3 && !this.realCloneActive) {
            this.activateRealClone();
            this.hasUsedClonePhase3 = true;
        }

        // Manage Clones
        if (this.realCloneActive) {
            // Update clone positions (stationary until real boss is hit)
            this.clones.forEach(clone => {
                if (clone.isFake && clone.active) {
                    // Clones don't move - they stand still
                    // No movement code needed
                }
            });

            // Check if all clones are gone or timer expires
            if (this.clones.filter(c => c.isFake).length === 0) {
                this.realCloneActive = false;
                this.aiState = 'chase';
            }
        }

        // Phase 2+: Screen Tear
        if (this.phase >= 2) {
            if (this.screenTearCooldown <= 0 && Math.random() < 0.003) {
                this.screenTearActive = true;
                this.screenTearDuration = 120; // 2 seconds
                this.screenTearCooldown = 400;
            }
            if (this.screenTearCooldown > 0) this.screenTearCooldown--;

            if (this.screenTearActive) {
                this.screenTearDuration--;
                if (this.screenTearDuration <= 0) {
                    this.screenTearActive = false;
                }
            }
        }

        // Phase 3: Reality Collapse (Randomize projectile colors)
        if (this.phase === 3) {
            // Invert controls more often
            if (!this.controlsInverted && Math.random() < 0.01) {
                this.controlsInverted = true;
                this.controlsInvertDuration = 120;
            }
        }
    }

    updateAI(player, distance) {
        if (this.realCloneActive) {
            return; // Don't move during clone phase
        }
        super.updateAI(player, distance);
    }

    activateRealClone() {
        this.realCloneActive = true;
        this.clones = [];

        // Teleport boss and spawn 3 clones
        const positions = [
            { x: this.canvas.width * 0.25, y: this.canvas.height * 0.25 },
            { x: this.canvas.width * 0.75, y: this.canvas.height * 0.25 },
            { x: this.canvas.width * 0.25, y: this.canvas.height * 0.75 },
            { x: this.canvas.width * 0.75, y: this.canvas.height * 0.75 }
        ];

        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Move real boss to first position
        this.x = positions[0].x;
        this.y = positions[0].y;
        this.aiState = 'stationary'; // Stop moving

        // Spawn 3 fake clones
        for (let i = 1; i < 4; i++) {
            this.clones.push({
                x: positions[i].x,
                y: positions[i].y,
                isFake: true,
                health: 1, // Die in one hit
                size: this.size,
                active: true
            });
        }
    }

    checkProjectileCollision(projectile) {
        // Check collision with Clones
        for (let i = this.clones.length - 1; i >= 0; i--) {
            const clone = this.clones[i];
            if (!clone.isFake || !clone.active) continue; // Only check fake clones

            const dx = projectile.x - clone.x;
            const dy = projectile.y - clone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < clone.size + projectile.size) {
                // Hit a fake clone - punish player
                clone.active = false;
                this.clones.splice(i, 1);
                return 'fake_clone_hit'; // Return special value
            }
        }
        return false;
    }

    handleAttacks(player, projectiles, level, particles) {
        // Level 1: Chaos Bolt (random patterns)
        if (level >= 1 && this.attackCooldown === 0 && !this.realCloneActive) {
            const patterns = ['spread', 'spiral', 'circle', 'burst'];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];

            switch (pattern) {
                case 'spread':
                    const spreadCount = 3 + this.projectileCount;
                    for (let i = -spreadCount; i <= spreadCount; i++) {
                        const angle = this.angle + (i * Math.PI / 12);
                        const speed = 5.0 * this.projectileSpeedMultiplier;
                        projectiles.push(new Projectile(
                            this.x, this.y,
                            Math.cos(angle) * speed, Math.sin(angle) * speed,
                            12 * this.damageMultiplier, 'boss', this.phase === 3 ? '#00ff00' : '#ff00ff', 5
                        ));
                    }
                    break;
                case 'spiral':
                    const spiralCount = 12 + (this.projectileCount * 2);
                    for (let i = 0; i < spiralCount; i++) {
                        const angle = (i / spiralCount) * Math.PI * 2 + (Date.now() / 200);
                        const speed = 3.5 * this.projectileSpeedMultiplier;
                        projectiles.push(new Projectile(
                            this.x, this.y,
                            Math.cos(angle) * speed, Math.sin(angle) * speed,
                            10 * this.damageMultiplier, 'boss', '#ff00ff', 5
                        ));
                    }
                    break;
                case 'circle':
                    const circleCount = 16 + (this.projectileCount * 4);
                    for (let i = 0; i < circleCount; i++) {
                        const angle = (i / circleCount) * Math.PI * 2;
                        const speed = 4.5 * this.projectileSpeedMultiplier;
                        projectiles.push(new Projectile(
                            this.x, this.y,
                            Math.cos(angle) * speed, Math.sin(angle) * speed,
                            11 * this.damageMultiplier, 'boss', '#ff00ff', 5
                        ));
                    }
                    break;
                case 'burst':
                    const burstCount = 1 + this.projectileCount;
                    for (let i = 0; i < burstCount; i++) {
                        projectiles.push(new HomingProjectile(
                            this.x, this.y, 4.5 * this.projectileSpeedMultiplier,
                            15 * this.damageMultiplier, 'boss', player, '#ff00ff'
                        ));
                    }
                    break;
            }

            this.attackCooldown = this.attackCooldownMax;
        }

        // Level 5: Phase Shift (teleport)
        if (level >= 5 && Math.random() < 0.008) {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;

            if (particles) {
                for (let i = 0; i < 25; i++) {
                    particles.push(new Particle(this.x, this.y, '#ff00ff', 5));
                }
            }
        }

        // Level 10: Mirror Image
        if (level >= 10) {
            this.clones = this.clones.filter(c => c.lifetime > 0);
            const maxClones = 2 + this.projectileCount;

            if (this.clones.length < maxClones && Math.random() < 0.005) {
                this.clones.push({
                    x: this.x + (Math.random() - 0.5) * 100,
                    y: this.y + (Math.random() - 0.5) * 100,
                    lifetime: 180,
                    shootCooldown: 30
                });
            }

            this.clones.forEach(clone => {
                clone.lifetime--;
                clone.shootCooldown--;

                if (clone.shootCooldown <= 0) {
                    const angle = Math.atan2(player.y - clone.y, player.x - clone.x);
                    const speed = 4.5 * this.projectileSpeedMultiplier;
                    projectiles.push(new Projectile(
                        clone.x, clone.y,
                        Math.cos(angle) * speed, Math.sin(angle) * speed,
                        10 * this.damageMultiplier, 'boss', '#ff1493', 5
                    ));
                    clone.shootCooldown = 60;
                }
            });
        }

        // Level 15: Reality Warp (invert controls)
        if (level >= 15 && !this.controlsInverted && Math.random() < 0.003) {
            this.controlsInverted = true;
            this.controlsInvertDuration = 180;
        }

        if (this.controlsInverted) {
            this.controlsInvertDuration--;
            if (this.controlsInvertDuration <= 0) {
                this.controlsInverted = false;
            }
        }

        // Level 20: Pandemonium (use all attacks)
        if (level >= 20 && Math.random() < 0.015) {
            // Randomly use any previous attack
            this.attackCooldown = 0;
        }
    }

    draw(ctx) {
        // Screen Tear Effect (Global distortion)
        if (this.screenTearActive) {
            ctx.save();
            const shiftX = (Math.random() - 0.5) * 20;
            const shiftY = (Math.random() - 0.5) * 20;
            ctx.translate(shiftX, shiftY);
            if (Math.random() < 0.3) {
                ctx.fillStyle = `rgba(${Math.random() * 255}, 0, 255, 0.1)`;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        super.draw(ctx);

        // Draw Real Clones (Phase 2+ mechanic)
        if (this.realCloneActive) {
            this.clones.forEach(clone => {
                if (clone.isFake && clone.active) {
                    ctx.save();
                    ctx.fillStyle = this.color; // Use boss color instead of hardcoded
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = this.color;
                    ctx.beginPath();
                    ctx.arc(clone.x, clone.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // Draw fake health bar to match real boss
                    const barWidth = 60;
                    const barHeight = 6;
                    const healthPercent = this.health / this.maxHealth; // Match real boss HP

                    ctx.fillStyle = '#333';
                    ctx.fillRect(clone.x - barWidth / 2, clone.y - this.size - 15, barWidth, barHeight);

                    // Draw health based on actual boss HP
                    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : (healthPercent > 0.25 ? '#ffff00' : '#ff0000');
                    ctx.fillRect(clone.x - barWidth / 2, clone.y - this.size - 15, barWidth * healthPercent, barHeight);
                }
            });

            // Draw subtle glitch effect on REAL boss only (10% chance)
            if (Math.random() < 0.1) {
                ctx.save();
                ctx.fillStyle = '#00ffff';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Draw Legacy Mirror Image Clones (Level 10)
        this.clones.forEach(clone => {
            if (!clone.isFake && clone.lifetime) {
                const alpha = clone.lifetime / 180;
                ctx.save();
                ctx.globalAlpha = alpha * 0.7;
                ctx.fillStyle = '#ff1493';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ff1493';
                ctx.beginPath();
                ctx.arc(clone.x, clone.y, this.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        // Glitch effect (general)
        if (!this.realCloneActive && Math.random() < 0.1) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.screenTearActive) {
            ctx.restore();
        }
    }
}

